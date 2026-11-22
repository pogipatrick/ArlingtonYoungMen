"""Rebuild calendar.ics from data/events.json. Run after editing events:
    python3 tools/build_ics.py
"""
import json, hashlib, os
from datetime import date, datetime, timedelta, timezone
ROOT = os.path.join(os.path.dirname(__file__), "..")
TZ = "America/Los_Angeles"
def esc(s): return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")
events = json.load(open(os.path.join(ROOT, "data", "events.json")))
L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Arlington Young Men//Calendar//EN",
     "CALSCALE:GREGORIAN", "X-WR-CALNAME:Arlington Young Men", "X-WR-TIMEZONE:" + TZ,
     "REFRESH-INTERVAL;VALUE=DURATION:PT12H", "X-PUBLISHED-TTL:PT12H",
     "BEGIN:VTIMEZONE", "TZID:" + TZ,
     "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0800", "TZOFFSETTO:-0700", "TZNAME:PDT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
     "BEGIN:STANDARD", "TZOFFSETFROM:-0700", "TZOFFSETTO:-0800", "TZNAME:PST", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD",
     "END:VTIMEZONE"]
stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
for e in events:
    uid = hashlib.sha1((e["date"] + e["title"] + e.get("start", "")).encode()).hexdigest()[:16] + "@arlingtonyoungmen"
    d = e["date"].replace("-", "")
    L += ["BEGIN:VEVENT", "UID:" + uid, "DTSTAMP:" + stamp, "SUMMARY:" + esc(e["title"])]
    if e.get("allDay"):
        end = date.fromisoformat(e.get("endDate", e["date"])) + timedelta(days=1)
        L += ["DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + end.strftime("%Y%m%d")]
    else:
        L += [f"DTSTART;TZID={TZ}:{d}T{e['start'].replace(':','')}00", f"DTEND;TZID={TZ}:{d}T{e['end'].replace(':','')}00"]
    if e.get("details"): L.append("DESCRIPTION:" + esc(e["details"]))
    if e.get("location"): L.append("LOCATION:" + esc(e["location"]))
    L.append("END:VEVENT")
L.append("END:VCALENDAR")
open(os.path.join(ROOT, "calendar.ics"), "w", newline="").write("\r\n".join(L) + "\r\n")
print(len(events), "events written to calendar.ics")
