"""Build data/week.json from the calendar's public iCal feed.

Run by the GitHub Action. Needs repository variable ICS_URL
(Google Calendar settings > Integrate calendar > Public address in iCal format)
and optional TIME_ZONE (default America/Los_Angeles).
"""
import json, os, re, sys, urllib.request
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo

import icalendar
import recurring_ical_events

TODO = re.compile(r"^\s*(to-?do|bring|wear|due|reminder|permission slip)\s*:\s*(.+)$", re.I)

def main():
    url = os.environ.get("ICS_URL")
    if not url:
        print("ICS_URL not set; skipping"); return
    tz = ZoneInfo(os.environ.get("TIME_ZONE") or "America/Los_Angeles")
    cal = icalendar.Calendar.from_ical(urllib.request.urlopen(url, timeout=30).read())
    now = datetime.now(tz)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=7)
    events, todos = [], []
    for ev in sorted(recurring_ical_events.of(cal).between(start, end), key=lambda e: _start(e, tz)):
        s = ev.get("DTSTART").dt
        e = ev.get("DTEND").dt if ev.get("DTEND") else s
        title = str(ev.get("SUMMARY", "Untitled"))
        if isinstance(s, datetime):
            s, e = s.astimezone(tz), e.astimezone(tz)
            time = f"{_t(s)} to {_t(e)}"
        else:
            time = "All day"
        events.append({"day": s.strftime("%a %b ") + str(s.day), "time": time,
                       "title": title, "location": str(ev.get("LOCATION", "") or "")})
        desc = re.sub(r"<[^>]+>", "\n", str(ev.get("DESCRIPTION", "") or ""))
        for line in desc.splitlines():
            m = TODO.match(line)
            if m:
                kw = m.group(1).strip()
                text = m.group(2).strip()
                if not re.match(r"to-?do", kw, re.I):
                    text = kw.capitalize() + " " + text
                todos.append({"event": title, "text": text})
    last = end - timedelta(days=1)
    out = {"range": f"{start:%b} {start.day} to {last:%b} {last.day}",
           "events": events, "todos": todos,
           "updated": f"{now:%a %b} {now.day}, {_t(now)}"}
    path = os.path.join(os.path.dirname(__file__), "..", "data", "week.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=1)
    print(json.dumps(out, indent=1))

def _start(ev, tz):
    s = ev.get("DTSTART").dt
    if not isinstance(s, datetime):
        s = datetime(s.year, s.month, s.day, tzinfo=tz)
    return s.astimezone(tz)

def _t(d):
    return d.strftime("%I:%M %p").lstrip("0")

if __name__ == "__main__":
    main()
