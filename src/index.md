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

<div class="deck">Fifty-eight years of Grand Slam tennis, told through its champions — who won, who they beat, where they reigned, and how a sport once spread thin came to be ruled by a precious few.</div>

<div class="dataline">
${meta.championCount} champions · ${meta.years.from}–${meta.years.to} · Australian Open · Roland Garros · Wimbledon · US Open · <span style="color:var(--accent)">Data as of ${new Date(meta.fetchedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</span>
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
const c1_animate = view(Inputs.toggle({label: "Animate", value: false}));
```
```js
const c1_yearGen = (async function* () {
  if (c1_animate) {
    for (let y = minYear; y <= maxYear; y++) { yield y; await new Promise((r) => setTimeout(r, 180)); }
  }
  yield maxYear;
})();
```
```js
const c1_slider = view(Inputs.range([minYear, maxYear], {step: 1, value: maxYear, label: "Reveal through year", format: (d) => `${d | 0}`}));
```
```js
const c1_year = c1_animate ? c1_yearGen : c1_slider;
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
    Plot.tip(c1_visible, Plot.pointer({x: "year", y: "titles", stroke: "player",
      channels: {player: "player"}, format: {z: false}}))
  ]
})
```

<div class="fignote">Cumulative singles titles at the four majors. Use the slider to scrub through time, or hit <em>Animate</em> to watch the race unfold.</div>
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
