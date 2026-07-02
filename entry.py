import re

import json5
from fastapi import APIRouter
from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse, RedirectResponse
from starlette.staticfiles import StaticFiles

from agents.content_agent import content_agent
from core.script_state import update_main_dict
from flowster import FlowSheet, FlowSessionJwt
from flowster.core import util
from flowster.stdlib.ai.llm import chat_stream, chat_result, chat
import json, requests, datetime, asyncio

from agents.chat_agent import chat_agent
from agents.common import extract_dicts_from_text
from agents.script_agent import ScriptState
from agents.script_agent import script_agent, ScriptState
from core.util import sse_stream, context_to_kwargs, snake_to_title
#from flow_sheets.iande.sandler_lite_convo import sandler_convo
from flow_sheets.iande.chat_script import chat_script as sandler_convo

router = APIRouter()
FLOW_PROFILE = None
JWT_AUTH = None

def setup( settings ):
    global FLOW_PROFILE, JWT_AUTH
    FLOW_PROFILE = settings.FLOW_PROFILE
    JWT_AUTH = settings.JWT_AUTH

def gen_flow_sheet( header ):
    with open("flow_sheets/bluesky/meta.json") as handle:
        meta = json5.load(handle)
        return FlowSheet(
            meta['title'],
            FlowSessionJwt.create(JWT_AUTH)( header ),
            FLOW_PROFILE )


def dict_to_markdown(d: dict) -> str:
    if len(d) == 0:
        return '(empty)'

    rows = []
    for k, v in d.items():
        # Convert complex types to a JSON‑style string
        if isinstance(v, (dict, list, set, tuple)):
            v = json.dumps(v, ensure_ascii=False)
        # Escape pipe characters so the table is not broken
        k = str(k).replace("|", "\\|")
        v = str(v).replace("|", "\\|")
        rows.append(f"| {k} | {v} |")
    header = "| Key | Value |\n| --- | ----- |\n"
    return header + "\n".join(rows)


def _err(reason):
    return JSONResponse(content={"successful": False, "reason": reason})


def _succ(**kwargs):
    return JSONResponse(content={"successful": True, **kwargs})


@router.post("/run_script")
async def run_script(request:Request, article_url:str=None):#question: str=Body(...), conversation: list[dict]=Body(...)):
    body = await request.json()
    chat_session_uid: str = body.get('chat_session_uid', None)
    question: str = body.get('question', '')
    conversation: list[dict] = body.get('conversation', [])
    contexts: list[dict] = body.get('contexts', [])
    model: str = body.get('model', None)
    first = util.xbool(request.query_params.get("first", "0"))

    default_section = sandler_convo.get('default', 'main')

    flow_sheet = gen_flow_sheet( request.headers.get("Authorization"))

    images = [x['content'] for x in contexts if x['file_type'] == 'image']
    _contexts = [x for x in contexts if x['file_type'] != 'image']

    # Add variable params
    contexts = context_to_kwargs( _contexts ).get( 'contexts', {} )

    # Run the memory agent to pull out user data
    if 'stateful' not in flow_sheet.session or first:
        for key in list(flow_sheet.session.keys()):
            del flow_sheet.session[key]
        flow_sheet.session['stateful'] = {
            'current_section': default_section,
            'memory': {},
            'stateful_by_section': {}
        }

    # Get our starting section
    current_section = flow_sheet.session.get_nested('stateful', 'current_section', default=default_section)

    raw_payloads = []

    if article_url:
        contexts['ARTICLE'] = article_url

    for _ in range(10):
        # Create my callback for looking up memory
        if (section := sandler_convo.get(current_section, None)) is None:
            print("Unknown section in script: " + current_section)
            raise HTTPException(status_code=400, detail="Unknown section in script: " + current_section)
        raw_memory = flow_sheet.session.get_nested('stateful', 'memory', default={})
        stateful = flow_sheet.session.get_nested('stateful', 'stateful_by_section', current_section, default={})
        print("----Section Data--------")
        #print(section.get('title', 'title'), section.get('name', 'name'))
        #print(json.dumps(section['data'], indent=4))
        #print("----From Session------")
        #print(json.dumps(raw_memory, indent=4))

        # Endpoint that returns a single response
        if (_script_resp := await script_agent(
            flow_sheet,
            question,
            memory=raw_memory,
            stateful=stateful,
            script_section=section,
            current_section=current_section,
            conversation=conversation,
            contexts=contexts,
            images=images,
            model=model,
            stream=True,
        )).is_err():
            print(_script_resp.unwrap_err())
            raise HTTPException(status_code=400, detail=_script_resp.unwrap_err())

        # Pull the response apart
        resp = _script_resp.ok_value

        print("-----Resp Memory-----")
        #print(json.dumps(resp.memory, indent=4))
        #update_main_dict(raw_memory, current_section, resp.memory)
        #print("-----Final Memory-----")
        #print(json.dumps(resp.memory, indent=4))

        # Insight
        memz = {**{x: None for x in section['data'].keys()}, **resp.memory}
        raw_payloads.append(json.dumps({
          'type': 'insight',
          'text': f"**State**\n\n*{current_section}*\n\n**Memory**\n\n{dict_to_markdown(memz)}\n\n**Stateful**\n\n{dict_to_markdown(resp.stateful)}"
        }))

        # Store back into session
        flow_sheet.session.set_nested('stateful', 'memory', value=resp.memory)
        flow_sheet.session.set_nested('stateful', 'stateful_by_section', current_section, value=resp.stateful)
        if resp.next_section is not None:
            # Insight
            raw_payloads.append(json.dumps({
              'type': 'insight',
              'text': f"**Script Transition**\n\n{current_section} -- {resp.next_section}"
            }))

            flow_sheet.session.set_nested('stateful', 'current_section', value=resp.next_section)
            current_section = resp.next_section

            ### Retry the loop since we transitioned our state
            continue

        """Endpoint that streams events using SSE"""
        sess = json.dumps({'type': 'session', 'token': flow_sheet.session.token() })
        form_mem = {
            'memory': resp.memory,
            'current_section': current_section,
        }
        form_memory = json.dumps({'type': 'memory', 'content': json.dumps(form_mem) })

        raw_payloads.append(f"data: {sess}")
        #raw_payloads.append(f"data: {form_memory}")

        # Stream the response as SSE, including the session token and form memory as raw events at the end
        return StreamingResponse(
            sse_stream(resp.response, conversation, raw=raw_payloads),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
