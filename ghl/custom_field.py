import uuid

from result import Result, Ok, Err
import settings
import aiohttp
import asyncio
from typing import Optional, Dict, Any, List
from helpers import util
from helpers.ghl.common import _make_request


async def by_folder_id(
    folder_id: str
) -> Result[list[Dict[str, Any]], str]:
    return await _make_request(
        method="GET",
        endpoint=f"/custom-fields/{folder_id}"
    )


async def by_field_id(
        field_id: str
) -> Result[list[Dict[str, Any]], str]:
    return await _make_request(
        method="GET",
        endpoint=f"/custom-fields/{field_id}"
    )


async def by_object_id(
    object_id: str
) -> Result[list[Dict[str, Any]], str]:
    if (_ret := await _make_request(
        method="GET",
        endpoint=f"/objects/{object_id}",
        query={'locationId': None}
    )).is_err():
        return _ret

    return Ok(_ret.ok_value.get('fields', []))


async def create(
    object_id: str,
    name: str,
    field_type: str,
    placeholder: Optional[str] = None
) -> Result[Dict[str, Any], str]:
    raise NotImplementedError