# Arlington Young Men site

The site is the calendar. GitHub Pages: https://pogipatrick.github.io/ArlingtonYoungMen/

- `data/events.json`: every event (the source of truth). Fields: date, start/end (24h) or allDay (+ endDate), title, details, location, type (ym, youth, sunday, temple, stake, leaders).
- `calendar.ics`: subscribable feed for phones. Rebuild after editing events: `python3 tools/build_ics.py`.
- The "This week" section is computed in the browser from events.json.
