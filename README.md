# Arlington Young Men site

The site is the calendar. GitHub Pages: https://pogipatrick.github.io/ArlingtonYoungMen/

- `data/events.json`: every event (the source of truth). Fields: date, start/end (24h) or allDay (+ endDate), title, details, location, type (ym, youth, sunday, temple, stake, leaders).
- The "This week" section is computed in the browser from events.json.

## Adding a flyer (Supplements section)

1. Upload the image into the `flyers/` folder (on GitHub: open `flyers/`, Add file, Upload files). Use a simple name like `winter-dance-2027.jpg`.
2. Edit `data/supplements.json` and add an entry:

```json
{
  "title": "Winter Youth Dance",
  "details": "Fri Jan 15, 7 to 9:30 PM, Stake Center.",
  "image": "flyers/winter-dance-2027.jpg",
  "link": "https://optional-signup-link",
  "linkText": "Sign up",
  "until": "2027-01-15",
  "posted": "2026-12-01"
}
```

Only `title` and `image` are required. Newest `posted` shows first. After the `until` date the flyer hides itself, so old flyers never need to be removed by hand.
