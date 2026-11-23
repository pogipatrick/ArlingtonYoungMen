(function () {
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var events = [];
  var view;

  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function key(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function fmtTime(t) { if (!t) return ""; var h = +t.slice(0, 2), m = t.slice(3); return (h % 12 || 12) + (m === "00" ? "" : ":" + m) + (h < 12 ? " AM" : " PM"); }
  function when(e) { return e.allDay ? (e.endDate ? "Through " + MONTHS[parse(e.endDate).getMonth()].slice(0,3) + " " + parse(e.endDate).getDate() : "All day") : fmtTime(e.start) + (e.end ? " to " + fmtTime(e.end) : ""); }
  function el(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }
  function onDay(k) { return events.filter(function (e) { return e.date <= k && (e.endDate || e.date) >= k; }); }

  function linkify(parent, text) {
    text.split(/(https?:\/\/\S+)/).forEach(function (part, i) {
      if (i % 2) { var a = el("a", null, "Lesson link"); a.href = part; a.target = "_blank"; a.rel = "noopener"; parent.appendChild(a); }
      else if (part) parent.appendChild(document.createTextNode(part.replace(/Lesson: $/, "")));
    });
  }

  function item(e, showDate) {
    var li = el("li", "ev t-" + e.type);
    var d = parse(e.date);
    li.appendChild(el("div", "when", (showDate ? DAYS[d.getDay()] + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getDate() + " · " : "") + when(e)));
    li.appendChild(el("div", "what", e.title));
    var det = (e.details || "").split("\n").map(function (l) { return l.replace(/\s*Lesson: https?:\/\/\S+/, "").trim(); }).filter(Boolean).join("\n");
    if (det) li.appendChild(el("div", "details muted", det));
    if (e.host) li.appendChild(el("div", "host small", "Host: " + e.host));
    if (e.location) li.appendChild(el("div", "where muted small", "📍 " + e.location));
    return li;
  }

  function renderWeek() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var end = addDays(today, 6);
    document.getElementById("week-range").textContent =
      MONTHS[today.getMonth()].slice(0, 3) + " " + today.getDate() + " to " + MONTHS[end.getMonth()].slice(0, 3) + " " + end.getDate();
    var ul = document.getElementById("week-events"); ul.innerHTML = "";
    var list = events.filter(function (e) { return (e.endDate || e.date) >= key(today) && e.date <= key(end); });
    if (!list.length) ul.appendChild(el("li", "empty muted", "Nothing scheduled this week."));
    list.forEach(function (e) { ul.appendChild(item(e, true)); });
  }

  function renderLessons() {
    var today = key(new Date());
    var ul = document.getElementById("lesson-list"); ul.innerHTML = "";
    var list = events.filter(function (e) { return e.type === "sunday" && e.date >= today; }).slice(0, 4);
    if (!list.length) ul.appendChild(el("li", "empty muted", "No lessons scheduled yet."));
    list.forEach(function (e) {
      var d = parse(e.date);
      var li = el("li");
      li.appendChild(el("div", "when", DAYS[d.getDay()] + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getDate()));
      var title = e.short || e.title.replace(/^Sunday Quorum Lesson:?\s*/, "") || "Quorum lesson";
      var m = (e.details || "").match(/https?:\/\/\S+/);
      var url = m ? m[0] : "https://www.churchofjesuschrist.org/study/ftsoy/" + e.date.slice(0, 4) + "/" + e.date.slice(5, 7) + "?lang=eng";
      var a = el("a", "lesson-title", title); a.href = url; a.target = "_blank"; a.rel = "noopener";
      li.appendChild(a);
      var who = (e.details || "").split("\n").filter(function (l) { return /teaching:/i.test(l); });
      if (who.length) li.appendChild(el("div", "muted small", who.join(" · ")));
      ul.appendChild(li);
    });
  }

  function renderMonth() {
    var y = view.getFullYear(), m = view.getMonth();
    document.getElementById("month-title").textContent = MONTHS[m] + " " + y;
    var grid = document.getElementById("grid"); grid.innerHTML = "";
    DAYS.forEach(function (d) { grid.appendChild(el("div", "dow", d)); });
    var first = new Date(y, m, 1), start = addDays(first, -first.getDay());
    var todayKey = key(new Date());
    for (var i = 0; i < 42; i++) {
      var d = addDays(start, i);
      if (i >= 35 && d.getMonth() !== m) break;
      var cell = el("div", "cell" + (d.getMonth() !== m ? " other" : "") + (key(d) === todayKey ? " today" : ""));
      cell.appendChild(el("div", "num", d.getDate()));
      onDay(key(d)).forEach(function (e) {
        var c = el("div", "chip t-" + e.type, (e.allDay ? "" : fmtTime(e.start).replace(" ", "").toLowerCase() + " ") + e.title.replace(/^Sunday Quorum Lesson:?\s*/, "Lesson ").replace(/^YM\/YW Combined:\s*/, ""));
        c.title = e.title + " · " + when(e);
        cell.appendChild(c);
      });
      grid.appendChild(cell);
    }
    var ul = document.getElementById("month-list"); ul.innerHTML = "";
    var mk = y + "-" + String(m + 1).padStart(2, "0");
    var list = events.filter(function (e) { return e.date.slice(0, 7) === mk; });
    if (!list.length) ul.appendChild(el("li", "empty muted", "Nothing on the calendar this month yet."));
    list.forEach(function (e) { ul.appendChild(item(e, true)); });
  }

  document.getElementById("prev").onclick = function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderMonth(); };
  document.getElementById("next").onclick = function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderMonth(); };

  var now = new Date(); view = new Date(now.getFullYear(), now.getMonth(), 1);
  fetch("data/events.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (data) { events = data.sort(function (a, b) { return (a.date + (a.start || "")).localeCompare(b.date + (b.start || "")); }); renderWeek(); renderLessons(); renderMonth(); })
    .catch(function () { document.getElementById("week-range").textContent = "Couldn't load the calendar. Please refresh."; });

  fetch("data/supplements.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (items) {
      var box = document.getElementById("flyers"), today = key(new Date());
      items = items.filter(function (f) { return !f.until || f.until >= today; })
        .sort(function (a, b) { return (b.posted || "").localeCompare(a.posted || ""); });
      if (!items.length) { box.appendChild(el("p", "muted", "No flyers right now.")); return; }
      items.forEach(function (f) {
        var fig = el("figure", "flyer");
        var a = el("a"); a.href = f.image; a.target = "_blank"; a.rel = "noopener";
        var img = el("img"); img.src = f.image; img.alt = f.title; img.loading = "lazy";
        a.appendChild(img); fig.appendChild(a);
        var cap = el("figcaption");
        cap.appendChild(el("div", "what", f.title));
        if (f.details) cap.appendChild(el("div", "details muted", f.details));
        if (f.link) { var b = el("a", "btn small", f.linkText || "Open link"); b.href = f.link; b.target = "_blank"; b.rel = "noopener"; cap.appendChild(b); }
        fig.appendChild(cap); box.appendChild(fig);
      });
    })
    .catch(function () { document.getElementById("flyers").appendChild(el("p", "muted", "Couldn't load flyers. Please refresh.")); });
})();
