import calendar
from collections import defaultdict
from datetime import datetime

from django.utils import timezone
from fastapi import APIRouter

from iande.endpoints import _succ
from iande.models import Conversation

router = APIRouter()

MONTHS_IN_RANGE = 12


def _month_key(dt):
    return f"{dt.year}-{dt.month:02d}"


def _shift_month(dt, delta):
    month = dt.month - 1 + delta
    year = dt.year + month // 12
    month = month % 12 + 1
    return dt.replace(year=year, month=month, day=1)


@router.get("/dashboard_stats")
async def dashboard_stats():
    now = timezone.now()
    range_start = _shift_month(now.replace(day=1), -(MONTHS_IN_RANGE - 1))

    # One query across the full 12 month range -- the per-month/per-day/script/url
    # buckets below are all built from this single result set instead of querying per month.
    conversations = Conversation.objects.filter(created_on__gte=range_start)

    by_month = defaultdict(lambda: {
        'chats_by_day': defaultdict(lambda: {'chats': 0, 'qa_total': 0}),
        'script_totals': defaultdict(int),
        'url_totals': defaultdict(int),
    })

    async for convo in conversations:
        bucket = by_month[_month_key(convo.created_on)]
        bucket['chats_by_day'][convo.created_on.day]['chats'] += 1
        bucket['chats_by_day'][convo.created_on.day]['qa_total'] += convo.conversation_count

        for name, count in (convo.scripts or {}).items():
            bucket['script_totals'][name] += count

        if convo.url:
            bucket['url_totals'][convo.url] += 1

    months = []
    cursor = range_start
    for _ in range(MONTHS_IN_RANGE):
        bucket = by_month[_month_key(cursor)]
        days_in_month = calendar.monthrange(cursor.year, cursor.month)[1]

        chats_per_day = []
        for day in range(1, days_in_month + 1):
            day_bucket = bucket['chats_by_day'][day]
            chats = day_bucket['chats']
            chats_per_day.append({
                'date': datetime(cursor.year, cursor.month, day).strftime('%b %-d'),
                'chats': chats,
                'avg_qa': round(day_bucket['qa_total'] / chats, 1) if chats else 0,
            })

        script_states = [{'name': name, 'value': value} for name, value in bucket['script_totals'].items()]
        top_blogs = sorted(
            ({'url': url, 'count': count} for url, count in bucket['url_totals'].items()),
            key=lambda x: x['count'], reverse=True
        )[:5]

        months.append({
            'year': cursor.year,
            'month': cursor.month,
            'chats_per_day': chats_per_day,
            'script_states': script_states,
            'top_blogs': top_blogs,
        })

        cursor = _shift_month(cursor, 1)

    return _succ(months=months)
