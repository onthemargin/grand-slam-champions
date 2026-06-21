# Observable Dataviz Test

Welcome to a test of the [Observable Framework](https://observablehq.com/framework/), a static site generator for data apps, dashboards, and reports.

This page is hosted on GitHub Pages and built from Markdown + JavaScript.

## A live chart

```js
const data = Array.from({length: 200}, (_, i) => ({
  x: i,
  y: Math.sin(i / 10) + (i / 200)
}));
```

```js
Plot.plot({
  title: "A sine wave with drift",
  width,
  height: 300,
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(data, {x: "x", y: "y", stroke: "steelblue"})
  ]
})
```

## An interactive input

```js
const n = view(Inputs.range([1, 50], {label: "Points", step: 1, value: 12}));
```

```js
Plot.plot({
  width,
  height: 300,
  marks: [
    Plot.barY(
      Array.from({length: n}, (_, i) => ({letter: String(i + 1), value: (i * 37) % n + 1})),
      {x: "letter", y: "value", fill: "steelblue", sort: {x: "y", reverse: true}}
    )
  ]
})
```

See the [examples page](./example) for more.
