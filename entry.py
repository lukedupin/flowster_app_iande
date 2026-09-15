from fastapi import APIRouter

from iande.endpoints.admin_chat import router as admin_chat_router
import iande.endpoints.admin_chat as admin_chat
from iande.endpoints.chat_bot import router as chat_bot_router
import iande.endpoints.chat_bot as chat_bot
from iande.endpoints.voice import router as voice_router
import iande.endpoints.voice as voice

router = APIRouter()


def setup(settings):
    admin_chat.setup(settings)
    chat_bot.setup(settings)
    voice.setup(settings)


def get_routers():
    return [
        ('router', router),
        ('admin_chat', admin_chat_router),
        ('chat_bot', chat_bot_router),
        ('voice', voice_router),
    ]
