import json5

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from flowster import FlowProfile, FlowSheet
from flowster.core import util
from flowster.core.util import context_to_kwargs, sse_stream
from flowster.stdlib.ai.llm import chat_stream, chat_result
from flowster.tools.json_tool import json_tool

from iande.endpoints import _err, _sse
from iande.models import Context

router = APIRouter()
FLOW_PROFILE = None


def setup(settings):
    global FLOW_PROFILE
    FLOW_PROFILE = settings.FLOW_PROFILE


def gen_flow_sheet(header=None):
    with open("iande/meta.json") as handle:
        meta = json5.load(handle)
        return FlowSheet(meta['title'], None, FlowProfile(FLOW_PROFILE))


@router.post("/chat")
async def chat(request: Request):
    body = await request.json()
    question: str = body.get('question', '')
    conversation: list[dict] = body.get('conversation', [])
    contexts: list[dict] = body.get('contexts', [])
    thinking = body.get('thinking', None)

    flow_sheet = gen_flow_sheet(request.headers)

    images = [x['content'] for x in contexts if x['file_type'] == 'image']
    contexts = [x for x in contexts if x['file_type'] != 'image']

    sse_messages = {}

    # Add variable params
    kwargs = context_to_kwargs(contexts)
    if thinking is not None:
        if util.xstr(thinking).lower() in ('true', 'false'):
            kwargs['thinking'] = util.xbool(thinking)
        else:
            kwargs['thinking'] = thinking

    # Endpoint that returns a single response
    if (_stream := await chat_stream(
        flow_sheet,
        question,
        conversation=conversation,
        tools=[],
        images=images,
        **kwargs
    )).is_err():
        return _err(_stream.err_value)
    stream = _stream.ok_value

    # Create the streamer
    if (ret := await chat_result(flow_sheet, stream)).is_err():
        return _err(ret.err_value)

    """Endpoint that streams events using SSE"""
    return StreamingResponse(
        sse_stream(ret.ok_value, conversation, **sse_messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/chat_json")
async def chat_json(request: Request):
    """Chat that edits a MEMORY dict (`detail`) to match one of STRUCTURES, named by the
    `structure` param -- shared by every record-editing chat panel instead of each
    endpoint duplicating this json_tool wiring."""
    body = await request.json()
    question: str = body.get('question', '')
    conversation: list[dict] = body.get('conversation', [])
    detail: dict = body.get('detail', {})
    structure_name: str = body.get('structure', '')

    db_model = {
        'context': Context,
    }.get(structure_name.lower())

    if db_model is None:
        return _err(f"Unknown structure '{structure_name}'")

    flow_sheet = gen_flow_sheet(request.headers)

    system = f"""
    You are updating a {structure_name} record based on the user's request.
    MEMORY holds the current {structure_name} data, STRUCTURE describes each field.
    Only change fields the user explicitly asks to change; leave every other field exactly as it is in MEMORY.
    Never invent values for fields the user didn't mention.
    Return the entire MEMORY with your updates applied. The result must match STRUCTURE exactly - the same fields, nothing extra.
    If no direction about the prompt is given, assume the prompt is information to extract and store into MEMORY.
    """

    if (ret := await json_tool(
        flow_sheet,
        question,
        conversation=conversation,
        memory=detail,
        structure=db_model.toStructure(),
        system=system,
    )).is_err():
        return _err(ret.err_value)

    updated = ret.ok_value

    async def event_stream():
        yield _sse({'type': 'content', 'text': f'Updated the {structure_name.lower()} details.'})
        yield _sse({'type': 'update_contexts', 'content': {'DETAIL': updated}})
        yield _sse({'type': 'conversation'})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
