(function () {
  var cfg = window.SITE_CONFIG || {};
  if (cfg.calendarId) {
    var id = encodeURIComponent(cfg.calendarId);
    var tz = encodeURIComponent(cfg.timeZone || "America/Los_Angeles");
    document.getElementById("cal-frame").src =
      "https://calendar.google.com/calendar/embed?src=" + id + "&ctz=" + tz +
      "&mode=MONTH&showPrint=0&showTabs=1&showCalendars=0&showTz=0";
    document.getElementById("cal-subscribe").href =
      "https://calendar.google.com/calendar/render?cid=" + id;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  fetch("data/week.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (w) {
      document.getElementById("week-range").textContent = w.range || "";
      var list = document.getElementById("week-events");
      if (!w.events || !w.events.length) {
        list.appendChild(el("li", "empty", "No activities scheduled this week."));
      }
      (w.events || []).forEach(function (e) {
        var li = el("li");
        li.appendChild(el("div", "when", e.day + " · " + e.time));
        li.appendChild(el("div", "what", e.title));
        if (e.location) li.appendChild(el("div", "where muted", e.location));
        list.appendChild(li);
      });
      if (w.todos && w.todos.length) {
        document.getElementById("week-todos-wrap").hidden = false;
        var t = document.getElementById("week-todos");
        w.todos.forEach(function (x) {
          var li = el("li");
          li.appendChild(el("span", "todo-event", x.event + ": "));
          li.appendChild(document.createTextNode(x.text));
          t.appendChild(li);
        });
      }
      if (w.updated) document.getElementById("week-updated").textContent = "Last updated " + w.updated;
    })
    .catch(function () {
      document.getElementById("week-range").textContent = "Couldn't load this week's activities. See the full calendar below.";
    });
})();
