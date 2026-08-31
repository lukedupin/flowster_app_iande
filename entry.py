from fastapi import APIRouter

from iande.endpoints.chat_bot import router as chat_bot_router
import iande.endpoints.chat_bot as chat_bot
from iande.endpoints.voice import router as voice_router
import iande.endpoints.voice as voice

router = APIRouter()


def setup(settings):
    chat_bot.setup(settings)
    voice.setup(settings)


def get_routers():
    return [
        ('router', router),
        ('chat_bot', chat_bot_router),
        ('voice', voice_router),
    ]
