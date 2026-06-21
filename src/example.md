# Examples

A second page, to show multi-page navigation and a data table.

```js
const cars = Array.from({length: 60}, (_, i) => ({
  hp: 50 + (i * 7) % 200,
  mpg: 15 + (i * 3) % 30,
  weight: 1500 + (i * 53) % 2500
}));
```

```js
Plot.plot({
  title: "Horsepower vs. MPG",
  grid: true,
  width,
  height: 360,
  marks: [
    Plot.dot(cars, {x: "hp", y: "mpg", r: d => d.weight / 600, fill: "weight", opacity: 0.7}),
  ]
})
```

```js
Inputs.table(cars)
```
