import uuid

from result import Result, Ok, Err
import settings
import aiohttp
import asyncio
from typing import Optional, Dict, Any, List
from helpers import util
from helpers.ghl.common import _make_request
import settings


async def get_contact(contact_id: str) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="GET",
        endpoint=f"/contacts/{contact_id}"
    )


async def get_contacts(
    query: Optional[str] = None,
    limit: int = None,
    skip: int = None,
) -> Result[Dict[str, Any], str]:
    params = {
        "location_id": None,
    }

    if query:
        params["query"] = query
    if limit is not None:
        params["limit"] = limit
    if skip is not None:
        params["skip"] = skip

    if (_ret := await _make_request(
        method="GET",
        endpoint=f"/contacts/business/{settings.GHL_API['BUSINESS_ID']}",
        query=params
    )).is_err():
        return _ret

    return Ok(_ret.ok_value.get('contacts', []))


async def get_agents() -> Result[list[Dict[str, Any]], str]:
    agents = []
    if (_ret := await get_contacts()).is_err():
        return _ret

    for contact in _ret.ok_value:
        # Check custom fields for 'is_agent' flag, add to agents list
        for field in contact.get('customFields', []):
            if isinstance(ary := field.get('value', []), list) and 'is_agent' in ary:
                agents.append(contact)
                break

    return Ok(agents)

async def create_contact(
        email: Optional[str] = None,
        phone: Optional[str] = None,
        name: Optional[str] = None,
        location_id: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    raise "Not maintained"
    data = {
        "location_id": location_id
    }

    if kwargs.get('phone') is None and kwargs.get('email') is None:
        kwargs['email'] = str(uuid.uuid4()) +"@unknown.com"

    # Add any additional fields
    data.update(kwargs)

    if (_ret := await _make_request(
        method="POST",
        endpoint="/contacts/",
        json_data=data
    )).is_err():
        return _ret

    return Ok(util.get_dict(_ret.ok_value, 'contact', 'id'))


async def update_contact(
        contact_id: str,
        **kwargs
) -> Result[Dict[str, Any], str]:
    ghl_fields = {'email', 'phone', 'name', 'first_name', 'last_name',
                  'address1', 'city', 'state', 'postal_code', 'country', 'tags',
                  'assigned_to'}

    # Build data payload
    data = {}
    for k, v in kwargs.items():
        if v is None:
            continue

        if k == 'name' and v is not None:
            data['name'] = v
            data['first_name'] = ' '.join(v.split(' ')[:1])
            data['last_name'] = ' '.join(v.split(' ')[1:])
        elif k in ghl_fields:
            data[k] = v
        elif 'custom_fields' not in data:
            data['custom_fields'] = [{ 'key': k, 'field_value': v }]
        else:
            data['custom_fields'].append({ 'key': k, 'field_value': v })

    return await _make_request(
        method="PUT",
        endpoint=f"/contacts/{contact_id}",
        json_data=data
    )


async def delete_contact(
    contact_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="DELETE",
        endpoint=f"/contacts/{contact_id}"
    )


async def upsert_contact(
        location_id: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    ghl_fields = {'email', 'phone', 'name', 'first_name', 'last_name',
                  'address1', 'city', 'state', 'postal_code', 'country', 'tags',
                  'assigned_to'}

    # Ensure at least one of email or phone is provided
    if kwargs.get('phone') is None and kwargs.get('email') is None:
        kwargs['email'] = str(uuid.uuid4()) +"@unknown.com"
        kwargs['email'] = str(uuid.uuid4()) +"@unknown.com"

    # Build data payload
    data = { "location_id": location_id }
    for k, v in kwargs.items():
        if v is None:
            continue

        if k == 'name' and v is not None:
            data['name'] = v
            data['first_name'] = ' '.join(v.split(' ')[:1])
            data['last_name'] = ' '.join(v.split(' ')[1:])
        elif k in ghl_fields:
            data[k] = v
        elif 'custom_fields' not in data:
            data['custom_fields'] = [{ 'key': k, 'field_value': v }]
        else:
            data['custom_fields'].append({ 'key': k, 'field_value': v })

    if (_ret := await _make_request(
        method="POST",
        endpoint="/contacts/upsert",
        json_data=data
    )).is_err():
        return _ret

    return Ok(util.get_dict(_ret.ok_value, 'contact', 'id'))


async def add_tags(
    contact_id: str,
    tags: List[str]
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="POST",
        endpoint=f"/contacts/{contact_id}/tags",
        json_data={"tags": tags}
    )


async def remove_tags(
    contact_id: str,
    tags: List[str]
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="DELETE",
        endpoint=f"/contacts/{contact_id}/tags",
        json_data={"tags": tags}
    )


async def get_all_contacts(
        batch_size: int = 100,
        location_id: Optional[str] = None,
) -> Result[List[Dict[str, Any]], str]:
    all_contacts = []
    skip = 0

    while True:
        if (_result := await get_contacts(
            location_id=location_id,
            limit=batch_size,
            skip=skip
        )).is_err():
            return _result
        result = _result.unwrap()

        batch = result.get("contacts", [])
        if not batch:
            break

        all_contacts.extend(batch)
        skip += batch_size

        # Break if we got fewer results than requested (last page)
        if len(batch) < batch_size:
            break

    return Ok(all_contacts)
