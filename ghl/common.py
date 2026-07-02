from result import Result, Ok, Err
import settings
import aiohttp
import asyncio
from typing import Optional, Dict, Any, List
from helpers import util
from settings import GHL_API

# Base configuration
BASE_URL = "https://services.leadconnectorhq.com"
API_VERSION = "2021-07-28"


async def _make_request(
        method: str,
        endpoint: str,
        query: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None
) -> Result[Dict[str, Any], str]:
    """
    Make an async HTTP request to the GHL API

    Args:
        token: Private integration token
        method: HTTP method (GET, POST, PUT, DELETE)
        endpoint: API endpoint path
        query: Query parameters
        json_data: JSON body data

    Returns:
        Response data as dictionary

    Raises:
        aiohttp.ClientError: For HTTP errors
    """
    url = f"{BASE_URL}{endpoint}"
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {GHL_API['KEY']}',
        'Content-Type': 'application/json',
        'Version': API_VERSION
    }

    # Default location
    query_data = None
    if query is not None:
        query_data = {util.snakeToLowerCamel(k): v for k, v in query.items()}
        if 'locationId' in query_data and (query_data['locationId'] is None or query_data['locationId'] == ''):
            query_data['locationId'] = GHL_API['LOCATION_ID']

    js_data = None
    if json_data is not None:
        js_data = {util.snakeToLowerCamel(k): v for k, v in json_data.items()}
        if 'locationId' in js_data and (js_data['locationId'] is None or js_data['locationId'] == ''):
            js_data['locationId'] = GHL_API['LOCATION_ID']

    try:
        async with aiohttp.ClientSession() as session:
            async with session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=query_data,
                    json=js_data
            ) as response:
                #response.raise_for_status()
                if response.status < 200 or response.status >= 300:
                    text = await response.text()
                    return Err(f"HTTP {response.status}: {text}")
                return Ok(await response.json())

    except aiohttp.ClientError as e:
        return Err(f"HTTP request failed: {str(e)}")

