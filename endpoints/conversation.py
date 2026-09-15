from fastapi import APIRouter, Request

from iande.endpoints import _err, _succ
from iande.models import Conversation

router = APIRouter()


@router.post("/conversations")
async def list_conversations(request: Request):
    body = await request.json()
    page: int = body.get('page', 1)
    per_page: int = body.get('per_page', 10)

    total = await Conversation.objects.acount()

    offset = (page - 1) * per_page
    conversations = Conversation.objects.order_by('-created_on')[offset:offset + per_page]

    items = []
    async for convo in conversations:
        items.append(convo.toJson())

    return _succ(conversations=items, total=total, page=page, per_page=per_page)


@router.post("/conversation")
async def get_conversation(request: Request):
    body = await request.json()
    uid = body.get('uid')

    try:
        convo = await Conversation.objects.aget(uid=uid)
    except Conversation.DoesNotExist:
        return _err("Conversation not found")

    return _succ(conversation=convo.toJson())
