# ATP Grand Slam Champions

```js
const {meta, champions} = await FileAttachment("data/champions.json").json();
```

<div class="card" style="margin: 1rem 0; padding: 0.5rem 1rem;">
  Data as of <strong>${new Date(meta.fetchedAt).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})}</strong>
  · ${meta.championCount} champions · ${meta.years.from}–${meta.years.to} ·
  ${meta.slams.join(" · ")}
</div>

Every men's Grand Slam singles champion of the Open era. Filter by tournament, then explore who won the most.

```js
const slam = view(Inputs.select(["All", ...meta.slams], {label: "Tournament"}));
```

```js
const filtered = slam === "All" ? champions : champions.filter((d) => d.slam === slam);
```

## Most titles

```js
const byPlayer = d3.rollups(filtered, (v) => v.length, (d) => d.champion)
  .map(([champion, titles]) => ({champion, titles}))
  .sort((a, b) => d3.descending(a.titles, b.titles))
  .slice(0, 20);
```

```js
Plot.plot({
  width,
  height: 520,
  marginLeft: 140,
  x: {label: "Titles", grid: true},
  y: {label: null},
  marks: [
    Plot.barX(byPlayer, {x: "titles", y: "champion", fill: "steelblue", sort: {y: "x", reverse: true}}),
    Plot.text(byPlayer, {x: "titles", y: "champion", text: "titles", dx: 10, fontWeight: "bold"}),
    Plot.ruleX([0])
  ]
})
```

## Champions over time

```js
Plot.plot({
  width,
  height: 360,
  marginLeft: 60,
  x: {label: "Year", tickFormat: "d"},
  y: {label: "Champion age", grid: true},
  color: {legend: true},
  marks: [
    Plot.dot(filtered, {x: "year", y: "age", fill: "slam", tip: true, r: 4,
      channels: {champion: "champion", runnerUp: "runner_up"}}),
  ]
})
```

## All champions

```js
Inputs.table(filtered.slice().reverse(), {
  columns: ["year", "slam", "surface", "champion", "champion_ioc", "runner_up", "score"],
  header: {year: "Year", slam: "Slam", surface: "Surface", champion: "Champion",
    champion_ioc: "Country", runner_up: "Runner-up", score: "Score"},
  rows: 18,
  width: {score: 200}
})
```

<div class="small note" style="margin-top: 2rem;">
  <strong>Data &amp; attribution.</strong> ${meta.attribution}
  Sources: ${meta.sources.map((s) => `<a href="${s.url}">${s.name}</a>`).join(" · ")}.
  License: ${meta.license}.
</div>
