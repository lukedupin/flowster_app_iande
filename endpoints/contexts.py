from fastapi import APIRouter, Request

from iande.endpoints import _err, _succ
from iande.models import Context

router = APIRouter()


@router.post("/contexts")
async def list_contexts(request: Request):
    contexts = [ctx.toJson() async for ctx in Context.objects.order_by('title')]
    return _succ(contexts=contexts)


@router.post("/context")
async def get_context(request: Request):
    body = await request.json()
    id = body.get('id')
    key = body.get('key')

    try:
        context = await Context.objects.aget(id=id) if id is not None else await Context.objects.aget(key=key)
    except Context.DoesNotExist:
        return _err("Context not found")

    return _succ(context=context.toJson())


@router.post("/context/create")
async def create_context(request: Request):
    body = await request.json()
    title = body.get('title', '')
    key = body.get('key', '')
    content = body.get('content', '')

    context = await Context.objects.acreate(title=title, key=key, content=content)
    return _succ(context=context.toJson())


@router.post("/context/update")
async def update_context(request: Request):
    body = await request.json()
    id = body.get('id')

    try:
        context = await Context.objects.aget(id=id)
    except Context.DoesNotExist:
        return _err("Context not found")

    if 'title' in body:
        context.title = body['title']
    if 'key' in body:
        context.key = body['key']
    if 'content' in body:
        context.content = body['content']

    await context.asave()
    return _succ(context=context.toJson())
