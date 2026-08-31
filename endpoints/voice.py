import re
import base64
import io
import wave
from multiprocessing import shared_memory

from asgiref.sync import sync_to_async
from django.core.files.base import ContentFile
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from flowster.core import util
from flowster.tts import create_tts, pcm_to_mp3
from iande.models import VoiceClone

router = APIRouter()


def _err(reason):
    return JSONResponse(content={"successful": False, "reason": reason})


def _succ(**kwargs):
    return JSONResponse(content={"successful": True, **kwargs})


@router.get("/list_voices")
async def list_voices():
    voices = [voice.toJson() async for voice in VoiceClone.objects.all().order_by('name')]
    return _succ(voices=voices)


@router.post("/create_voice")
async def create_voice(request: Request):
    """Body: {"name": "...", "voice_model": "...", "exaggeration": 2.4, "cfg_weight": 1.5,
    "file": "<base64>"}"""
    body = await request.json()
    name: str = body.get('name', '')
    voice_model: str = body.get('voice_model', '')
    file_b64: str = body.get('file', '')

    if not name or not voice_model or not file_b64:
        return _err("name, voice_model, and file are required")

    voice = VoiceClone(
        name=name,
        voice_model=voice_model,
        exaggeration=util.xfloat(body.get('exaggeration'), none=2.4),
        cfg_weight=util.xfloat(body.get('cfg_weight'), none=1.5),
    )
    voice.file = ContentFile(base64.b64decode(file_b64), name=f"{voice_model}.wav")
    await voice.asave()

    return _succ(voice=voice.toJson())


@router.post("/update_voice")
async def update_voice(request: Request):
    """Body: {"uid": "...", "name": "...", "voice_model": "...", "exaggeration": 2.4,
    "cfg_weight": 1.5, "file": "<base64>"} -- all but uid optional"""
    body = await request.json()
    uid: str = body.get('uid', '')

    if not uid:
        return _err("uid is required")

    try:
        voice = await VoiceClone.objects.aget(uid=uid)
    except VoiceClone.DoesNotExist:
        return _err(f"Unknown voice '{uid}'")

    if body.get('name'):
        voice.name = body['name']
    if body.get('voice_model'):
        voice.voice_model = body['voice_model']
    if body.get('exaggeration'):
        voice.exaggeration = util.xfloat(body['exaggeration'], none=voice.exaggeration)
    if body.get('cfg_weight'):
        voice.cfg_weight = util.xfloat(body['cfg_weight'], none=voice.cfg_weight)
    if body.get('file'):
        voice.file = ContentFile(base64.b64decode(body['file']), name=f"{voice.voice_model}.wav")

    await voice.asave()

    return _succ(voice=voice.toJson())


@router.post("/voice_file")
async def voice_file(request: Request):
    """Return a saved VoiceClone's reference clip as base64.

    Body: {"uid": "...", "voice_model": "..."} -- uid preferred when both are given.
    """
    body = await request.json()
    uid: str = body.get('uid', '')
    voice_model: str = body.get('voice_model', '')

    if not uid and not voice_model:
        return _err("uid or voice_model is required")

    try:
        if uid:
            voice = await VoiceClone.objects.aget(uid=uid)
        else:
            voice = await VoiceClone.objects.aget(voice_model=voice_model)
    except VoiceClone.DoesNotExist:
        return _err(f"Unknown voice '{uid or voice_model}'")

    with voice.file.open('rb') as handle:
        audio_bytes = handle.read()

    return _succ(audio=base64.b64encode(audio_bytes).decode('ascii'), type="wav")


def chunk_text(text, limit=500):
    """Split text on sentence boundaries, then pack sentences into chunks no longer
    than `limit` chars, so a single TTS inference call never gets an unreasonably long text."""
    responses = [p.strip() for p in re.split(r'(?<=[.!?;])\s+', text) if p]

    cur = ""
    combined = []
    for r in responses:
        if len(cur) + len(r) > limit:
            combined.append(cur)
            cur = ""
        cur = cur + " " + r
    if len(cur) > 0:
        combined.append(cur)

    return combined


@router.post("/voice_gen")
async def voice_gen(request: Request):
    """Generate speech audio from text using a saved VoiceClone.

    Body: {"voice_model": "iande-01", "text": "...", "type": "wav"}
    """
    body = await request.json()
    uid: str = body.get('uid', '')
    voice_model: str = body.get('voice_model', '')
    text: str = body.get('text', '')
    out_type: str = body.get('type', 'wav')

    if (not uid and not voice_model) or not text:
        return _err("uid or voice_model, and text, are required")

    try:
        if uid:
            voice = await VoiceClone.objects.aget(uid=uid)
        else:
            voice = await VoiceClone.objects.aget(voice_model=voice_model)
    except VoiceClone.DoesNotExist:
        return _err(f"Unknown voice '{uid or voice_model}'")

    if (_streamer := create_tts({
        'type': 'chatterbox-turbo',
        'voice_clone': voice.file.path,
        'exaggeration': voice.exaggeration,
        'cfg_weight': voice.cfg_weight,
    })).is_err():
        return _err(_streamer.unwrap_err())
    streamer = _streamer.ok_value

    streamer.start()
    try:
        pcm_chunks = []
        for chunk in chunk_text(text):
            await sync_to_async(streamer.text_queue.put)(chunk)
            mem_info = await sync_to_async(streamer.audio_queue.get)()

            mem = shared_memory.SharedMemory(name=mem_info['name'])
            pcm_chunks.append(bytes(mem.buf[:mem_info['payload']]))
            mem.close()
        pcm_bytes = b"".join(pcm_chunks)
    finally:
        await sync_to_async(streamer.close)()

    if out_type == 'mp3':
        audio_bytes = pcm_to_mp3(pcm_bytes, streamer.hertz())
    else:
        out_type = 'wav'
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(streamer.hertz())
            wav_file.writeframes(pcm_bytes)
        audio_bytes = wav_buffer.getvalue()

    return _succ(audio=base64.b64encode(audio_bytes).decode('ascii'), type=out_type)
