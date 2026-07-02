from typing import Optional, Dict, Any, List
from result import Result, Ok, Err
from helpers.ghl.common import _make_request


# ============================================================================
# CALENDAR ENDPOINTS
# ============================================================================

async def get_calendars(
        location_id: Optional[str] = None
) -> Result[Dict[str, Any], str]:
    params = {
        "locationId": location_id
    }

    return await _make_request(
        method="GET",
        endpoint="/calendars/",
        params=params
    )


async def get_calendar(
        calendar_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="GET",
        endpoint=f"/calendars/{calendar_id}"
    )


async def create_calendar(
        name: str,
        description: Optional[str] = None,
        slug: Optional[str] = None,
        location_id: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {
        "name": name,
        "locationId": location_id
    }

    if description is not None:
        data["description"] = description
    if slug is not None:
        data["slug"] = slug

    data.update(kwargs)

    return await _make_request(
        method="POST",
        endpoint="/calendars/",
        json_data=data
    )


async def update_calendar(
        calendar_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        slug: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {}

    if name is not None:
        data["name"] = name
    if description is not None:
        data["description"] = description
    if slug is not None:
        data["slug"] = slug

    data.update(kwargs)

    return await _make_request(
        method="PUT",
        endpoint=f"/calendars/{calendar_id}",
        json_data=data
    )


async def delete_calendar(
        calendar_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="DELETE",
        endpoint=f"/calendars/{calendar_id}"
    )


async def get_calendar_free_slots(
        calendar_id: str,
        start_date: str,
        end_date: str,
        timezone: Optional[str] = None,
        user_id: Optional[str] = None
) -> Result[Dict[str, Any], str]:
    params = {
        "startDate": start_date,
        "endDate": end_date
    }

    if timezone is not None:
        params["timezone"] = timezone
    if user_id is not None:
        params["userId"] = user_id

    return await _make_request(
        method="GET",
        endpoint=f"/calendars/{calendar_id}/free-slots",
        params=params
    )


# ============================================================================
# CALENDAR EVENTS / APPOINTMENTS ENDPOINTS
# ============================================================================

async def get_calendar_events(
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        calendar_id: Optional[str] = None,
        contact_id: Optional[str] = None,
        user_id: Optional[str] = None,
        location_id: Optional[str] = None
) -> Result[Dict[str, Any], str]:
    params = {
        "locationId": location_id
    }

    if start_time is not None:
        params["startTime"] = start_time
    if end_time is not None:
        params["endTime"] = end_time
    if calendar_id is not None:
        params["calendarId"] = calendar_id
    if contact_id is not None:
        params["contactId"] = contact_id
    if user_id is not None:
        params["userId"] = user_id

    return await _make_request(
        method="GET",
        endpoint="/calendars/events",
        params=params
    )


async def get_appointment(
        event_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="GET",
        endpoint=f"/calendars/events/{event_id}"
    )


async def create_appointment(
        calendar_id: str,
        contact_id: str,
        start_time: str,
        end_time: str,
        title: Optional[str] = None,
        appointment_status: Optional[str] = None,
        assigned_user_id: Optional[str] = None,
        address: Optional[str] = None,
        notes: Optional[str] = None,
        location_id: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {
        "calendarId": calendar_id,
        "contactId": contact_id,
        "startTime": start_time,
        "endTime": end_time,
        "locationId": location_id
    }

    if title is not None:
        data["title"] = title
    if appointment_status is not None:
        data["appointmentStatus"] = appointment_status
    if assigned_user_id is not None:
        data["assignedUserId"] = assigned_user_id
    if address is not None:
        data["address"] = address
    if notes is not None:
        data["notes"] = notes

    data.update(kwargs)

    return await _make_request(
        method="POST",
        endpoint="/calendars/events/appointments",
        json_data=data
    )


async def update_appointment(
        event_id: str,
        calendar_id: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        title: Optional[str] = None,
        appointment_status: Optional[str] = None,
        assigned_user_id: Optional[str] = None,
        address: Optional[str] = None,
        notes: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {}

    if calendar_id is not None:
        data["calendarId"] = calendar_id
    if start_time is not None:
        data["startTime"] = start_time
    if end_time is not None:
        data["endTime"] = end_time
    if title is not None:
        data["title"] = title
    if appointment_status is not None:
        data["appointmentStatus"] = appointment_status
    if assigned_user_id is not None:
        data["assignedUserId"] = assigned_user_id
    if address is not None:
        data["address"] = address
    if notes is not None:
        data["notes"] = notes

    data.update(kwargs)

    return await _make_request(
        method="PUT",
        endpoint=f"/calendars/events/appointments/{event_id}",
        json_data=data
    )


async def delete_appointment(
        event_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="DELETE",
        endpoint=f"/calendars/events/{event_id}"
    )


# ============================================================================
# BLOCKED SLOTS ENDPOINTS
# ============================================================================

async def get_blocked_slots(
        calendar_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        location_id: Optional[str] = None
) -> Result[Dict[str, Any], str]:
    params = {
        "locationId": location_id
    }

    if calendar_id is not None:
        params["calendarId"] = calendar_id
    if start_date is not None:
        params["startDate"] = start_date
    if end_date is not None:
        params["endDate"] = end_date

    return await _make_request(
        method="GET",
        endpoint="/calendars/events/block-slots",
        params=params
    )


async def create_block_slot(
        calendar_id: str,
        start_time: str,
        end_time: str,
        title: Optional[str] = None,
        assigned_user_id: Optional[str] = None,
        location_id: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {
        "calendarId": calendar_id,
        "startTime": start_time,
        "endTime": end_time,
        "locationId": location_id
    }

    if title is not None:
        data["title"] = title
    if assigned_user_id is not None:
        data["assignedUserId"] = assigned_user_id

    data.update(kwargs)

    return await _make_request(
        method="POST",
        endpoint="/calendars/events/block-slots",
        json_data=data
    )


async def update_block_slot(
        event_id: str,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        title: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {}

    if start_time is not None:
        data["startTime"] = start_time
    if end_time is not None:
        data["endTime"] = end_time
    if title is not None:
        data["title"] = title

    data.update(kwargs)

    return await _make_request(
        method="PUT",
        endpoint=f"/calendars/events/block-slots/{event_id}",
        json_data=data
    )


# ============================================================================
# CALENDAR GROUPS ENDPOINTS
# ============================================================================

async def get_calendar_groups(
        location_id: Optional[str] = None
) -> Result[Dict[str, Any], str]:
    params = {
        "locationId": location_id
    }

    return await _make_request(
        method="GET",
        endpoint="/calendars/groups",
        params=params
    )


async def get_calendar_group(
        group_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="GET",
        endpoint=f"/calendars/groups/{group_id}"
    )


async def create_calendar_group(
        name: str,
        description: Optional[str] = None,
        slug: Optional[str] = None,
        location_id: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {
        "name": name,
        "locationId": location_id
    }

    if description is not None:
        data["description"] = description
    if slug is not None:
        data["slug"] = slug

    data.update(kwargs)

    return await _make_request(
        method="POST",
        endpoint="/calendars/groups",
        json_data=data
    )


async def update_calendar_group(
        group_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        slug: Optional[str] = None,
        **kwargs
) -> Result[Dict[str, Any], str]:
    data = {}

    if name is not None:
        data["name"] = name
    if description is not None:
        data["description"] = description
    if slug is not None:
        data["slug"] = slug

    data.update(kwargs)

    return await _make_request(
        method="PUT",
        endpoint=f"/calendars/groups/{group_id}",
        json_data=data
    )


async def delete_calendar_group(
        group_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="DELETE",
        endpoint=f"/calendars/groups/{group_id}"
    )


# ============================================================================
# APPOINTMENT NOTES ENDPOINTS
# ============================================================================

async def get_appointment_notes(
        appointment_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="GET",
        endpoint=f"/calendars/events/appointments/{appointment_id}/notes"
    )


async def create_appointment_note(
        appointment_id: str,
        note: str,
        user_id: Optional[str] = None
) -> Result[Dict[str, Any], str]:
    data = {"note": note}

    if user_id is not None:
        data["userId"] = user_id

    return await _make_request(
        method="POST",
        endpoint=f"/calendars/events/appointments/{appointment_id}/notes",
        json_data=data
    )


async def update_appointment_note(
        appointment_id: str,
        note_id: str,
        note: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="PUT",
        endpoint=f"/calendars/events/appointments/{appointment_id}/notes/{note_id}",
        json_data={"note": note}
    )


async def delete_appointment_note(
        appointment_id: str,
        note_id: str
) -> Result[Dict[str, Any], str]:
    return await _make_request(
        method="DELETE",
        endpoint=f"/calendars/events/appointments/{appointment_id}/notes/{note_id}"
    )