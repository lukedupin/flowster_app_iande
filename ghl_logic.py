from typing import AsyncIterator, Dict, Any

from helpers.ghl import contact, custom_field
from result import Result, Ok, Err
import settings


async def download_object_fields( object_id: str=None ) -> Result[dict, str]:
    if object_id is None:
        object_id = settings.GHL_API['OBJECT_ID']

    return await custom_field.by_object_id( object_id )


async def get_agents( queries=None ) -> Result[list[Dict[str, Any]], str]:
    # If no queries provided, fetch from custom fields
    if queries is None:
        if (_ret := await download_object_fields()).is_err():
            return _ret

        for field in _ret.ok_value:
            if field.get('name') == 'agents_query':
                queries = [x.strip() for x in field.get('placeholder', '').split(',')]

    # Go through queries to find agents
    agents = {}
    for q in queries:
        print(f"Searching for agents with query: {q}")
        if (_ret := await contact.get_contacts( q )).is_err():
            print(_ret.err_value)
            continue

        for c in _ret.ok_value:
            # Check custom fields for 'is_agent' flag, add to agents list
            for field in c.get('customFields', []):
                if isinstance(ary := field.get('value', []), list) and 'is_agent' in ary:
                    agents[c['id']] = c
                    break

    return Ok(list(agents.values()))


# Create / update a contact profile based on provided data
async def store_contact( **profile: dict ) -> Result[str, str]:
    if profile.get('contact_id') is not None:
        if (_ret := await contact.update_contact( **profile )).is_ok():
            return Ok(profile['contact_id'])

    # Upsert
    if (_ret := await contact.upsert_contact( **profile )).is_err():
        return Err(f"Failed to create contact: {_ret.unwrap_err()}")

    # Delete the old contact
    if profile.get('contact_id') is not None:
        await contact.delete_contact( profile['contact_id'] )

    return _ret # contact ID