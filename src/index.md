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
/* head-to-head panel */
.h2h { margin:1.2rem 0 0; }
.h2h-score { display:flex; align-items:center; justify-content:center; gap:1.3rem;
  font:400 19px Georgia,serif; color:var(--soft); margin-bottom:1.1rem; }
.h2h-score strong { font-size:32px; font-weight:700; color:var(--ink); font-variant-numeric:tabular-nums; }
.h2h-table { width:100%; border-collapse:collapse; font:400 14px/1.5 "Helvetica Neue",Arial,sans-serif; }
.h2h-table th { text-align:left; font:700 10.5px/1.4 "Helvetica Neue",Arial,sans-serif;
  letter-spacing:.06em; text-transform:uppercase; color:var(--muted);
  border-bottom:1px solid var(--faint); padding:.45rem .6rem; }
.h2h-table td { padding:.45rem .6rem; border-bottom:1px solid var(--faint); color:var(--soft); }
.h2h-table td.h2h-win { font-weight:700; color:var(--ink); }
.h2h-empty { text-align:center; color:var(--muted); font:400 15px Georgia,serif; padding:1.4rem; }
</style>

```js
import {
  topPlayers, cumulativeByYear, titlesByPlayerSlam, titlesByPlayerSurface,
  finalsAppearances, finalsRecord, finalsBetween, parseScore, reignBlocks,
  yearExtent
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

<div class="fignote">Cumulative singles titles at the four majors. Drag the slider to reveal the race year by year; hover a line for the running total.</div></div>

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
</div>

<hr class="rule">

<!-- ============================ CHART 3 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">3 · The Rivalries</div>

## Head-to-head on the final Sunday

<div class="deck">Pick a player to see their Grand Slam finals record against everyone they faced — wins to the right, losses to the left. Add a second player to zoom into a single rivalry, match by match.</div>
</div>

```js
const c3_finalists = finalsAppearances(champions).filter((d) => d.finals >= 2).map((d) => d.player);
const c3_p1 = view(Inputs.select(c3_finalists, {label: "Player", value: "Novak Djokovic"}));
```
```js
const c3_record = finalsRecord(champions, c3_p1);
const c3_p2 = view(Inputs.select(["— any opponent —", ...c3_record.map((r) => r.opponent)], {label: "vs", value: "— any opponent —"}));
```
```js
const c3_isPair = c3_p2 !== "— any opponent —";
const c3_p1color = TOP_NAMES.includes(c3_p1) ? colorForPlayer(TOP_NAMES, c3_p1) : "#1A4E8A";
const c3_pairFinals = c3_isPair ? finalsBetween(champions, c3_p1, c3_p2) : [];
const c3_p1wins = c3_pairFinals.filter((f) => f.winner === c3_p1).length;
```
```js
function c3_grid(record, color, width) {
  const rows = record.slice(0, 14);
  const maxv = Math.max(1, d3.max(rows, (r) => Math.max(r.wins, r.losses)));
  return Plot.plot({
    ...base, width, height: Math.max(200, rows.length * 34 + 64),
    marginLeft: 132, marginRight: 44, marginTop: 36, marginBottom: 16,
    x: {domain: [-maxv - 0.4, maxv + 0.4], label: null, ticks: []},
    y: {domain: rows.map((r) => r.opponent), label: null},
    marks: [
      Plot.barX(rows, {x: (d) => -d.losses, y: "opponent", fill: "#ccc7bd", insetTop: 7, insetBottom: 7}),
      Plot.barX(rows, {x: "wins", y: "opponent", fill: color, insetTop: 7, insetBottom: 7}),
      Plot.text(rows, {x: (d) => -d.losses, y: "opponent", text: (d) => d.losses || "", dx: -6, textAnchor: "end", fill: MUTED, fontWeight: 600, fontSize: 11.5}),
      Plot.text(rows, {x: "wins", y: "opponent", text: (d) => d.wins || "", dx: 6, textAnchor: "start", fill: color, fontWeight: 700, fontSize: 11.5}),
      Plot.ruleX([0], {stroke: INK}),
      Plot.text([{}], {frameAnchor: "top", text: ["← lost to        ·        beat →"], dy: -18, fill: MUTED, fontSize: 11.5, fontWeight: 600})
    ]
  });
}
function c3_panel(finals, a, b, aWins) {
  const bWins = finals.length - aWins;
  return html`<figure class="h2h">
    <div class="h2h-score"><span>${a}</span><strong>${aWins}&ndash;${bWins}</strong><span>${b}</span></div>
    ${finals.length === 0
      ? html`<p class="h2h-empty">These two never met in a Grand Slam final.</p>`
      : html`<table class="h2h-table">
          <thead><tr><th>Year</th><th>Tournament</th><th>Winner</th><th>Score</th></tr></thead>
          <tbody>${finals.map((f) => html`<tr><td>${f.year}</td><td>${f.slam}</td><td class="h2h-win">${f.winner}</td><td>${f.score}</td></tr>`)}</tbody>
        </table>`}
  </figure>`;
}
```
```js
c3_isPair ? c3_panel(c3_pairFinals, c3_p1, c3_p2, c3_p1wins) : c3_grid(c3_record, c3_p1color, width)
```

<div class="fignote">Grand Slam finals only — not full career head-to-head. Players with at least two final appearances are listed.</div></div>

<hr class="rule">

<!-- ============================ CHART 4 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">4 · The Drama</div>

## How the finals were won

<div class="deck">Every Grand Slam final, placed by how far it went — a straight-sets statement, a four-set grind, or a five-set epic. The red dots along the top are the classics that went the distance.</div>
</div>

```js
const C4_LABEL = {five: "Five sets", four: "Four sets", straight: "Straight sets", retired: "Unfinished"};
const C4_COLOR = {"Five sets": "#C0392B", "Four sets": "#D98324", "Straight sets": "#7C9AB0", "Unfinished": "#b3ada3"};
const C4_SLAM_DX = {"Australian Open": -0.30, "Roland Garros": -0.10, "Wimbledon": 0.10, "US Open": 0.30};
const c4_all = champions.map((c) => {
  const p = parseScore(c.score);
  return {...c, ...p, dramaLabel: C4_LABEL[p.category]};
});
```
```js
const c4_slam = view(Inputs.select(["All", ...meta.slams], {label: "Tournament", value: "All"}));
```
```js
const c4_rows = (c4_slam === "All" ? c4_all : c4_all.filter((d) => d.slam === c4_slam))
  .map((d) => ({...d, xj: d.year + (c4_slam === "All" ? (C4_SLAM_DX[d.slam] || 0) : 0)}));
const c4_fives = c4_rows.filter((d) => d.category === "five").length;
```
```js
Plot.plot({
  ...base,
  width,
  height: 380,
  marginLeft: 98,
  marginTop: 30,
  marginRight: 20,
  x: {label: null, tickFormat: "d", domain: [minYear - 1, maxYear + 1], ticks: 7},
  y: {domain: ["Five sets", "Four sets", "Straight sets", "Unfinished"], label: null},
  color: {domain: Object.keys(C4_COLOR), range: Object.values(C4_COLOR), legend: true, label: "How the final went"},
  marks: [
    Plot.dot(c4_rows, {x: "xj", y: "dramaLabel", fill: "dramaLabel", r: 4.4, fillOpacity: 0.9,
      stroke: (d) => d.tiebreaks > 0 ? "#1a1a1a" : "white", strokeWidth: (d) => d.tiebreaks > 0 ? 0.9 : 0.6,
      tip: true, channels: {champion: "champion", runnerUp: "runner_up", slam: "slam", year: "year", score: "score", tiebreaks: "tiebreaks"}})
  ]
})
```

<div class="fignote">Each dot is one men's Grand Slam final, placed by the number of sets the champion needed. Dots ringed in black had at least one tiebreak. ${c4_fives} of these finals went the full five sets.</div></div>

<hr class="rule">

<!-- ============================ CHART 5 ============================ -->
<div class="viz">
<div class="viz-head">
<div class="kicker">5 · The Dynasty Map</div>

## Reigns at the four majors

<div class="deck">The four majors as parallel timelines, 1968 to today. Back-to-back wins by the same champion merge into one reign — the long colour streaks are the dynasties. Pick a champion to trace theirs.</div>
</div>

```js
const c5_spot = view(Inputs.select(
  ["— none —", ...[...new Set(champions.map((c) => c.champion))].sort()],
  {label: "Spotlight a champion", value: "— none —"}
));
```
```js
const c5_slamOrder = ["Australian Open", "Roland Garros", "Wimbledon", "US Open"];
const c5_topset = new Set(TOP_NAMES);
// Piecewise-linear x: years after the break get ~2.4x the width per year, so the
// dense modern era gets room to breathe. Continuous (no gap) — a block spanning
// the break just widens; the break is flagged on the axis.
const c5_break = 2000;
const c5_post = 2.1;
const c5_warp = (year) => (year <= c5_break ? year - minYear : (c5_break - minYear) + (year - c5_break) * c5_post);
const c5_warpMax = c5_warp(maxYear + 1);
const c5_ticks = [1970, 1980, 1990, 2000, 2005, 2010, 2015, 2020, 2025]
  .filter((y) => y >= minYear && y <= maxYear + 1)
  .map((y) => ({y, w: c5_warp(y)}));
const c5_tickMap = new Map(c5_ticks.map((d) => [d.w, d.y]));
const c5_blocks = reignBlocks(champions).map((b) => {
  const isTop = c5_topset.has(b.champion);
  let fill = isTop ? colorForPlayer(TOP_NAMES, b.champion) : "#dad5cb";
  let ink = isTop ? "#fff" : "#615c54";
  if (c5_spot !== "— none —") {
    if (b.champion === c5_spot) { fill = isTop ? colorForPlayer(TOP_NAMES, b.champion) : "#1a1a1a"; ink = "#fff"; }
    else { fill = "#eeebe5"; ink = "#c2bdb3"; }
  }
  // Default: label every reign. Spotlight: label only the chosen champion.
  const labelled = c5_spot === "— none —" ? b.count >= 2 : b.champion === c5_spot;
  const x1w = c5_warp(b.startYear), x2w = c5_warp(b.endYear + 1);
  return {...b, _fill: fill, _ink: ink, _label: labelled ? lastName(b.champion) : "", x1w, x2w, cxw: (x1w + x2w) / 2};
});
```
```js
Plot.plot({
  ...base,
  width,
  height: 296,
  marginTop: 36,
  marginLeft: 112,
  marginRight: 16,
  x: {label: null, domain: [0, c5_warpMax], axis: null},
  y: {domain: c5_slamOrder, label: null, tickSize: 0},
  color: {type: "identity"},
  marks: [
    Plot.axisX(c5_ticks.map((d) => d.w), {tickFormat: (w) => String(c5_tickMap.get(w)), tickSize: 0, fontSize: 11}),
    Plot.barX(c5_blocks, {x1: "x1w", x2: "x2w", y: "slam", fill: "_fill",
      stroke: "white", strokeWidth: 1.4, insetTop: 6, insetBottom: 6,
      tip: true, channels: {champion: "champion",
        reign: (d) => d.startYear === d.endYear ? `${d.startYear}` : `${d.startYear}–${d.endYear}`,
        "titles in a row": "count"}}),
    Plot.text(c5_blocks, {x: "cxw", y: "slam", text: "_label", fill: "_ink", fontSize: 10, fontWeight: 600}),
    Plot.ruleX([c5_warp(c5_break)], {stroke: "#8d877c", strokeWidth: 1, strokeDasharray: "4 3"}),
    Plot.text([{w: c5_warp(c5_break), t: `${c5_break} — wider scale →`, slam: c5_slamOrder[0]}],
      {x: "w", y: "slam", dy: -25, dx: 6, textAnchor: "start", text: "t", fontSize: 10.5, fontStyle: "italic", fill: "#8b857b"})
  ]
})
```

<div class="fignote">One champion per tournament per year; consecutive titles merge into a reign, labelled when two or more. Years after 2000 are drawn wider. Hover any block for details.</div></div>

<hr class="rule">

```js
html`<div class="attrib">Data: official ATP results via <a href="https://github.com/JeffSackmann" target="_blank" rel="noopener">Tennis Abstract</a> &amp; <a href="https://github.com/Tennismylife/TML-Database" target="_blank" rel="noopener">TML&#8209;Database</a>. Non-commercial use.</div>`
```

</div>
