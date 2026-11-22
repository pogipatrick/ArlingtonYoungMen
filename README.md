# Young Men site

Static site for GitHub Pages: the live calendar, this week's activities and to-dos, forms, and contacts.

- `config.js`: the public calendar ID and time zone.
- `data/week.json`: rebuilt every day by `.github/workflows/update-week.yml` from the calendar's public iCal feed (repository variable `ICS_URL`).
- To-dos: any line in an event description starting with `To-do:`, `Bring:`, `Wear:`, `Due:`, `Reminder:` or `Permission slip:`.
