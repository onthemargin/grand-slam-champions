---
theme: air
toc: false
---

<style>
:root {
  --ink:#1a1a1a; --muted:#6b6b6b; --soft:#33312e;
  --accent:#E3120B; --faint:#e7e4de; --panel:#faf9f6; --paper:#fff;
}
body { background: var(--paper); }
.editorial { max-width: 1000px; margin: 0 auto; }
.hero { border-top: 4px solid var(--accent); padding-top: 1.1rem; margin: 1.2rem 0 2.2rem; }
.kicker { font: 700 12px/1.2 "Helvetica Neue",Arial,sans-serif; letter-spacing:.14em;
  text-transform:uppercase; color:var(--accent); margin-bottom:.55rem; }
.editorial h1 { font-family: Georgia,"Times New Roman",serif; font-weight:700;
  font-size: clamp(30px,5vw,50px); line-height:1.03; letter-spacing:-.01em;
  margin:.1rem 0 .6rem; color:var(--ink); }
.editorial h2 { font-family: Georgia,serif; font-weight:700;
  font-size: clamp(21px,3.1vw,30px); line-height:1.08; letter-spacing:-.005em;
  margin:.1rem 0 .4rem; color:var(--ink); }
.deck { font: 400 18px/1.55 Georgia,serif; color:var(--soft); max-width:64ch; margin:.3rem 0 1rem; }
.deck.small { font-size:16px; }
.dataline { font: 600 12.5px/1.4 "Helvetica Neue",Arial,sans-serif; color:var(--muted);
  letter-spacing:.02em; }
.viz { margin: 3.4rem 0; }
.viz-head { max-width: 72ch; }
.controls { display:flex; flex-wrap:wrap; gap:.7rem 1.5rem; align-items:flex-end;
  margin:.8rem 0 1.1rem; padding:.7rem 1rem; background:var(--panel);
  border:1px solid var(--faint); border-radius:5px; }
.controls form { margin:0 !important; }
.source { font: 600 10.5px/1.4 "Helvetica Neue",Arial,sans-serif; letter-spacing:.06em;
  text-transform:uppercase; color:var(--muted); margin-top:.8rem;
  border-top:1px solid var(--faint); padding-top:.5rem; }
.fignote { font: 400 14.5px/1.5 Georgia,serif; color:var(--muted); margin:.4rem 0 0; max-width:64ch; }
hr.rule { border:none; border-top:1px solid var(--faint); margin:0; }
.attrib { font: 400 13.5px/1.6 Georgia,serif; color:var(--muted); max-width:70ch;
  margin:2.4rem 0 1rem; }
.attrib a { color:var(--soft); }
/* scrollytelling */
.scrolly { position:relative; margin:1rem 0 1.5rem; }
.scrolly-graphic { position:sticky; top:6vh; height:82vh; }
.scrolly-steps { position:relative; margin-top:-82vh; pointer-events:none; }
.scrolly-steps .step { min-height:88vh; display:flex; align-items:center; }
.step-card { pointer-events:auto; max-width:340px; margin-left:auto;
  background:rgba(255,255,255,.94); border-left:3px solid var(--accent);
  padding:.85rem 1.1rem; box-shadow:0 2px 16px rgba(0,0,0,.09); border-radius:2px;
  font:400 17px/1.5 Georgia,serif; color:var(--soft); }
.step-card strong { color:var(--ink); font-weight:700; }
.step-card p { margin:0; }
</style>

```js
import {
  topPlayers, cumulativeByYear, titlesByPlayerSlam, titlesByPlayerSurface,
  finalsMatrix, titlesByCountry, cumulativeByCountry, yearExtent
} from "./lib/transforms.js";
import {
  INK, MUTED, FAINT, ACCENT, PLAYER_COLORS, SLAM_COLORS, SURFACE_COLORS,
  playerScale, colorForPlayer, base
} from "./lib/theme.js";
```

```js
const {meta, champions} = await FileAttachment("data/champions.json").json();
const [minYear, maxYear] = yearExtent(champions);
const TOP = topPlayers(champions, 10);
const TOP_NAMES = TOP.map((d) => d.player);
const pScale = playerScale(TOP_NAMES);
const lastName = (n) => n.split(" ").pop();
```

<div class="editorial">

<div class="hero">
<div class="kicker">The Open Era · Men's Singles</div>

# Kings of the Majors

<div class="deck">Every men's Grand Slam champion of the Open era — who won, who they beat, and where they reigned.</div>

<div class="dataline">
${meta.championCount} champions · ${meta.years.from}–${meta.years.to} · <span style="color:var(--accent)">Updated ${new Date(meta.fetchedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</span>
</div>
</div>

<hr class="rule">

<!-- ====================== SCROLLYTELLING INTRO ====================== -->
<div class="viz-head" style="margin-bottom:0">
<div class="kicker">The Story</div>

## Fifty-eight years in one race

<div class="deck">Scroll to watch career Grand Slam titles stack up, era by era.</div>
</div>

```js
const RACE_FULL = cumulativeByYear(champions, TOP_NAMES);
const SCENES = [
  {through: 1990, focus: ["Borg", "Connors", "McEnroe", "Lendl"], anno: {year: 1981, titles: 11, text: "Borg — 11, then retires"}},
  {through: 2002, focus: ["Sampras"], anno: {year: 2002, titles: 14, text: "Sampras: 14"}},
  {through: 2010, focus: ["Federer"], anno: {year: 2009, titles: 15, text: "Federer passes Sampras"}},
  {through: 2017, focus: ["Federer", "Nadal", "Djokovic"], anno: {year: 2017, titles: 16, text: "A three-way race"}},
  {through: 2026, focus: ["Djokovic", "Nadal", "Federer"], anno: {year: 2023, titles: 24, text: "Djokovic: 24"}},
  {through: 2026, focus: ["Alcaraz"], anno: {year: 2026, titles: 7, text: "Alcaraz — 7 by age 22"}}
];
```
```js
const scrollyStep = Generators.observe((notify) => {
  let current = 0;
  notify(0);
  const steps = [...document.querySelectorAll(".scrolly .step")];
  if (!steps.length) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const n = Number(e.target.dataset.step);
          if (n !== current) { current = n; notify(n); }
        }
      }
    },
    {rootMargin: "-45% 0px -45% 0px"}
  );
  steps.forEach((el) => io.observe(el));
  return () => io.disconnect();
});
```
```js
function renderRace(width, height, step) {
  const s = SCENES[Math.max(0, Math.min(step, SCENES.length - 1))];
  // Scenes name players by surname; resolve to the full names used in the data.
  const focus = new Set(s.focus.map((f) => TOP_NAMES.find((n) => lastName(n) === f) || f));
  const vis = RACE_FULL.filter((d) => d.year <= s.through);
  const bg = vis.filter((d) => !focus.has(d.player));
  const fg = vis.filter((d) => focus.has(d.player));
  const ends = TOP_NAMES.filter((p) => focus.has(p))
    .map((p) => fg.filter((d) => d.player === p).at(-1))
    .filter((d) => d && d.titles > 0)
    .map((d) => ({...d}))
    .sort((x, y) => y.titles - x.titles);
  let prev = Infinity; // dodge tied/near labels apart on the y axis
  for (const e of ends) { e.ly = Math.min(e.titles, prev - 25 / 20); prev = e.ly; }
  const a = s.anno;
  const rightSide = a.year > 2014;
  return Plot.plot({
    ...base,
    width,
    height: Math.max(340, height - 8),
    marginTop: 20,
    marginRight: 150,
    marginLeft: 44,
    x: {label: null, tickFormat: "d", domain: [minYear, maxYear], ticks: 7},
    y: {domain: [0, 25], grid: true, label: "↑ Career Slam titles", ticks: 6},
    color: {domain: pScale.domain, range: pScale.range},
    marks: [
      Plot.ruleY([0], {stroke: FAINT}),
      Plot.line(bg, {x: "year", y: "titles", z: "player", stroke: "#dad6ce", strokeWidth: 1.2, curve: "monotone-x"}),
      Plot.line(fg, {x: "year", y: "titles", z: "player", stroke: "player", strokeWidth: 2.8, curve: "monotone-x"}),
      Plot.dot(ends, {x: "year", y: "titles", fill: "player", r: 3.4}),
      Plot.link(ends, {x1: "year", y1: "titles", x2: "year", y2: "ly", stroke: "player", strokeWidth: 0.6, strokeOpacity: 0.5}),
      Plot.text(ends, {x: "year", y: "ly", text: (d) => `${lastName(d.player)}  ${d.titles}`,
        fill: "player", dx: 8, textAnchor: "start", fontWeight: 600, fontSize: 11.5}),
      Plot.dot([a], {x: "year", y: "titles", r: 4, fill: INK, stroke: "white", strokeWidth: 1.5}),
      Plot.text([a], {x: "year", y: "titles", text: "text", dy: -14, dx: rightSide ? -8 : 8,
        textAnchor: rightSide ? "end" : "start", fontStyle: "italic", fontWeight: 600, fontSize: 13,
        fill: INK, lineWidth: 13, stroke: "white", strokeWidth: 3.5, paintOrder: "stroke"})
    ]
  });
}
```

<div class="scrolly">
<div class="scrolly-graphic">

```js
resize((w, h) => renderRace(w, h, scrollyStep))
```

</div>
<div class="scrolly-steps">
<div class="step" data-step="0"><div class="step-card">

**The long status quo.** For two decades the leaders rose together. Björn Borg walked away at 26 with 11 majors — and no one passed him for years.

</div></div>
<div class="step" data-step="1"><div class="step-card">

**Sampras raises the bar.** Through the 1990s, Pete Sampras pushed the modern record to **14** — a number that looked untouchable.

</div></div>
<div class="step" data-step="2"><div class="step-card">

**Federer changes the scale.** From 2003, Roger Federer didn't just catch Sampras — he blew past him, redrawing what greatness meant.

</div></div>
<div class="step" data-step="3"><div class="step-card">

**A three-way race.** Rafael Nadal and Novak Djokovic refused to let Federer run away. The Big Three pulled clear of everyone in history.

</div></div>
<div class="step" data-step="4"><div class="step-card">

**Djokovic on top.** When the dust settled, Djokovic stood alone at **24** — the most major titles any man has won.

</div></div>
<div class="step" data-step="5"><div class="step-card">

**The next chase.** It has already begun. By age 22, Carlos Alcaraz has **7** — and has climbed into the all-time top ten.

</div></div>
</div>
</div>

<hr class="rule">

<!-- ============================ CHART 1 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">1 · The Race</div>

## The breakaway

<div class="deck">Career Grand Slam titles, accumulating year by year for the ten most decorated men of the Open era. For three decades the leaders crept upward in lockstep — then the Big Three left the field behind.</div>
</div>

```js
const c1_slam = view(Inputs.select(["All", ...meta.slams], {label: "Tournament", value: "All"}));
```
```js
const c1_year = view(Inputs.range([minYear, maxYear], {step: 1, value: maxYear, label: "Reveal through year", format: (d) => `${d | 0}`}));
```
```js
const c1_series = cumulativeByYear(champions, TOP_NAMES, {slam: c1_slam});
const c1_visible = c1_series.filter((d) => d.year <= c1_year);
// End-of-line labels, dodged vertically so the chasing pack doesn't overlap.
const c1_ends = (() => {
  const ends = c1_series
    .filter((d) => d.year === c1_year && d.titles > 0)
    .map((d) => ({...d}))
    .sort((a, b) => b.titles - a.titles);
  const yMax = d3.max(c1_series, (d) => d.titles) || 1;
  const gap = yMax / 22; // minimum label spacing, in title units
  let prev = Infinity;
  for (const p of ends) {
    p.ly = Math.min(p.titles, prev - gap);
    prev = p.ly;
  }
  return ends;
})();
// Editorial callouts — only meaningful for the full all-Slam timeline.
const C1_ANNOTATIONS = [
  {year: 1981, titles: 11, text: "Borg walks away at 26", dx: 8, dy: -12, anchor: "start"},
  {year: 2002, titles: 14, text: "Sampras: 14, the mark to beat", dx: 6, dy: 22, anchor: "start"},
  {year: 2009, titles: 15, text: "Federer passes Sampras", dx: -8, dy: -14, anchor: "end"}
];
const c1_annos = c1_slam === "All" ? C1_ANNOTATIONS.filter((a) => a.year <= c1_year) : [];
const c1_annoMarks = [
  Plot.dot(c1_annos, {x: "year", y: "titles", r: 3.2, fill: INK, stroke: "white", strokeWidth: 1}),
  ...c1_annos.map((a) =>
    Plot.text([a], {x: "year", y: "titles", text: "text", dx: a.dx, dy: a.dy, textAnchor: a.anchor,
      fontStyle: "italic", fontWeight: 500, fontSize: 11.5, fill: INK,
      lineWidth: 12, stroke: "white", strokeWidth: 3, paintOrder: "stroke"}))
];
```
```js
Plot.plot({
  ...base,
  width,
  height: 540,
  marginTop: 16,
  marginRight: 168,
  marginLeft: 44,
  x: {label: null, tickFormat: "d", domain: [minYear, maxYear], ticks: 7},
  y: {label: "↑ Career Slam titles", grid: true, ticks: 6, nice: true},
  color: {domain: pScale.domain, range: pScale.range},
  marks: [
    Plot.ruleY([0], {stroke: FAINT}),
    Plot.line(c1_visible, {x: "year", y: "titles", z: "player", stroke: "player", strokeWidth: 2.1, curve: "monotone-x"}),
    Plot.dot(c1_ends, {x: "year", y: "titles", fill: "player", r: 3.2}),
    Plot.link(c1_ends, {x1: "year", y1: "titles", x2: "year", y2: "ly", stroke: "player", strokeWidth: 0.6, strokeOpacity: 0.5}),
    Plot.text(c1_ends, {x: "year", y: "ly", text: (d) => `${lastName(d.player)}  ${d.titles}`,
      fill: "player", dx: 8, textAnchor: "start", fontWeight: 600, fontSize: 11.5}),
    ...c1_annoMarks,
    Plot.tip(c1_visible, Plot.pointer({x: "year", y: "titles", stroke: "player",
      channels: {player: "player"},
      format: {player: true, x: (d) => `Through ${d | 0}`, y: (d) => `${d} Slam title${d === 1 ? "" : "s"}`,
        stroke: false, z: false}}))
  ]
})
```

<div class="fignote">Cumulative singles titles at the four majors. Drag the slider to reveal the race year by year; hover a line for the running total.</div>
<div class="source">Source: Official ATP Tour, via Tennis Abstract &amp; TML-Database</div>
</div>

<hr class="rule">

<!-- ============================ CHART 2 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">2 · The Map of Greatness</div>

## Where the titles came from

<div class="deck">Every champion has a home Slam. Stacked by tournament, the all-time leaders reveal themselves as either specialists or all-court conquerors — Nadal's terracotta tower at Roland Garros next to Federer's spread of green and blue.</div>
</div>

```js
const c2_by = view(Inputs.radio(["Slam", "Surface"], {label: "Colour by", value: "Slam"}));
```
```js
const c2_sort = view(Inputs.radio(["Total titles", "Alphabetical"], {label: "Sort", value: "Total titles"}));
```
```js
const c2_top = topPlayers(champions, 12);
const c2_names = c2_top.map((d) => d.player);
const c2_data = c2_by === "Slam" ? titlesByPlayerSlam(champions, c2_names) : titlesByPlayerSurface(champions, c2_names);
const c2_cat = c2_by === "Slam" ? "slam" : "surface";
const c2_palette = c2_by === "Slam" ? SLAM_COLORS : SURFACE_COLORS;
const c2_order = c2_sort === "Total titles" ? c2_names : [...c2_names].sort((a, b) => a.localeCompare(b));
const c2_totals = c2_top.map((d) => ({player: d.player, titles: d.titles}));
```
```js
Plot.plot({
  ...base,
  width,
  height: 460,
  marginLeft: 132,
  marginRight: 36,
  x: {label: "Grand Slam titles", grid: true, ticks: 6},
  y: {domain: c2_order, label: null},
  color: {domain: Object.keys(c2_palette), range: Object.values(c2_palette), legend: true},
  marks: [
    Plot.barX(c2_data, {x: "titles", y: "player", fill: c2_cat, order: Object.keys(c2_palette),
      tip: true, rx1: 0}),
    Plot.text(c2_totals, {x: "titles", y: "player", text: (d) => d.titles, dx: 8,
      textAnchor: "start", fontWeight: 700, fontSize: 12, fill: INK}),
    Plot.ruleX([0], {stroke: INK, strokeWidth: 1})
  ]
})
```

<div class="source">Source: Official ATP Tour, via Tennis Abstract &amp; TML-Database</div>
</div>

<hr class="rule">

<!-- ============================ CHART 3 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">3 · The Rivalries</div>

## Settled on the final Sunday

<div class="deck">Among the era's twelve greatest, who beat whom when a major was on the line. Each filled square is a final won — read across a row for a champion's victims, down a column for their conquerors.</div>
</div>

```js
const c3_names = topPlayers(champions, 12).map((d) => d.player);
const c3_focus = view(Inputs.select(["— none —", ...c3_names], {label: "Spotlight a player", value: "— none —"}));
```
```js
const c3_set = new Set(c3_names);
const c3_cells = finalsMatrix(champions)
  .filter((c) => c3_set.has(c.winner) && c3_set.has(c.loser))
  .map((c) => ({...c, lit: c3_focus === "— none —" ? true : c.winner === c3_focus || c.loser === c3_focus}));
```
```js
Plot.plot({
  ...base,
  width,
  height: 520,
  marginLeft: 118,
  marginTop: 40,
  marginBottom: 90,
  x: {domain: c3_names, label: "Runner-up ↓", labelAnchor: "left", tickRotate: -38},
  y: {domain: c3_names, label: "Champion"},
  color: {scheme: "reds", legend: true, label: "Finals won", domain: [0, d3.max(c3_cells, (d) => d.count)]},
  marks: [
    Plot.cell(c3_cells, {x: "loser", y: "winner", fill: "count", fillOpacity: (d) => d.lit ? 1 : 0.1,
      inset: 0.5, tip: true, channels: {champion: "winner", "lost by": "loser", finals: "count"}}),
    Plot.text(c3_cells, {x: "loser", y: "winner", text: (d) => d.count, fill: (d) => d.count > 2 ? "#fff" : INK,
      fillOpacity: (d) => d.lit ? 1 : 0.25, fontWeight: 600, fontSize: 11})
  ]
})
```

<div class="fignote">Finals meetings only — not full career head-to-head. The diagonal is blank: no one contests a final with themselves.</div>
<div class="source">Source: Official ATP Tour, via Tennis Abstract &amp; TML-Database</div>
</div>

<hr class="rule">

<!-- ============================ CHART 4 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">4 · The Geopolitics</div>

## A changing of the guard, nation by nation

<div class="deck">Grand Slam titles accumulated by country. The slopes tell the story — Australia's early command, an American surge, and the long Western-European ascendancy that followed.</div>
</div>

```js
const c4_topCountries = titlesByCountry(champions).slice(0, 8).map((d) => d.country);
const c4_set = new Set(c4_topCountries);
const c4_champs = champions.map((c) => (c4_set.has(c.champion_ioc) ? c : {...c, champion_ioc: "Other"}));
const c4_countries = [...c4_topCountries, "Other"];
const c4_data = cumulativeByCountry(c4_champs, {countries: c4_countries});
const c4_pal = d3.schemeTableau10;
```
```js
const c4_focus = view(Inputs.select(["— all —", ...c4_topCountries], {label: "Spotlight a country", value: "— all —"}));
```
```js
Plot.plot({
  ...base,
  width,
  height: 460,
  marginLeft: 44,
  marginRight: 56,
  x: {label: null, tickFormat: "d", ticks: 7},
  y: {label: "↑ Cumulative Slam titles", grid: true},
  color: {domain: c4_countries, range: [...c4_pal.slice(0, 8), "#cfcabf"], legend: true},
  marks: [
    Plot.areaY(c4_data, {x: "year", y: "titles", z: "country", fill: "country",
      order: c4_countries, fillOpacity: (d) => c4_focus === "— all —" ? 0.92 : (d.country === c4_focus ? 1 : 0.16),
      tip: true}),
    Plot.ruleY([0], {stroke: INK, strokeWidth: 1})
  ]
})
```

<div class="fignote">Top eight nations shown individually; all others pooled as “Other”. Bands are stacked, so total height is the running count of all majors played.</div>
<div class="source">Source: Official ATP Tour, via Tennis Abstract &amp; TML-Database</div>
</div>

<hr class="rule">

<!-- ============================ CHART 5 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">5 · The Dynasty Map</div>

## Who owned each major, year by year

<div class="deck">Every Grand Slam final result, laid out as a calendar. Vertical streaks are dynasties — pick a champion to watch their reign light up across the decades.</div>
</div>

```js
const c5_focus = view(Inputs.select(["— none —", ...TOP_NAMES], {label: "Spotlight a champion", value: "— none —"}));
```
```js
const c5_slamOrder = ["Australian Open", "Roland Garros", "Wimbledon", "US Open"];
const c5_topset = new Set(TOP_NAMES);
const c5_years = d3.range(maxYear, minYear - 1, -1);
const c5_cells = champions.map((c) => {
  const isTop = c5_topset.has(c.champion);
  const own = isTop ? colorForPlayer(TOP_NAMES, c.champion) : "#d8d3c9";
  let fill = own, ink = isTop ? "#fff" : "#6b6b6b";
  if (c5_focus !== "— none —") {
    if (c.champion === c5_focus) { fill = colorForPlayer(TOP_NAMES, c.champion); ink = "#fff"; }
    else { fill = "#edeae3"; ink = "#b9b4aa"; }
  }
  return {...c, _fill: fill, _ink: ink, _last: lastName(c.champion)};
});
```
```js
Plot.plot({
  ...base,
  width,
  height: Math.max(560, c5_years.length * 15.5),
  marginTop: 34,
  marginLeft: 52,
  marginRight: 12,
  x: {domain: c5_slamOrder, label: null, axis: "top", tickSize: 0},
  y: {domain: c5_years, label: null, tickFormat: "d", ticks: d3.range(1970, maxYear + 1, 5)},
  color: {type: "identity"},
  marks: [
    Plot.cell(c5_cells, {x: "slam", y: "year", fill: "_fill", inset: 0.7,
      tip: true, channels: {year: "year", slam: "slam", champion: "champion", runnerUp: "runner_up", score: "score"}}),
    Plot.text(c5_cells, {x: "slam", y: "year", text: "_last", fill: "_ink", fontSize: 9.5, fontWeight: 500})
  ]
})
```

<div class="fignote">Colour marks the ten all-time leaders; lighter cells are everyone else. Some Australian Open years are missing from the early Open era.</div>
<div class="source">Source: Official ATP Tour, via Tennis Abstract &amp; TML-Database</div>
</div>

<hr class="rule">

```js
html`<div class="attrib">
  <strong>About this data.</strong> ${meta.attribution}${meta.note ? " " + meta.note : ""}
  Sources: ${meta.sources.map((s, i) => html`${i ? html` · ` : ""}<a href=${s.url} target="_blank" rel="noopener">${s.name}</a>`)}.
  License: ${meta.license}. Updated by re-running the project's fetch step after each major.
</div>`
```

</div>
