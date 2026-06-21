# observable-dataviz-test

An interactive look at **ATP men's Grand Slam champions** (Open era, 1968–present),
built with [Observable Framework](https://observablehq.com/framework/) and hosted
on GitHub Pages.

**Live site:** https://onthemargin.github.io/observable-dataviz-test/

## Data & attribution

Match results are from the **official ATP Tour**, compiled by
**Tennis Abstract (Jeff Sackmann)** and **[Tennismylife / TML-Database](https://github.com/Tennismylife/TML-Database)**.

**Educational / non-commercial use only.** Per the source's terms, the raw
database may not be redistributed or used commercially without permission, and
the sources must be acknowledged. This project is a personal, non-commercial
demo and attributes the sources on every page.

## How the data works

- `npm run fetch` (`scripts/fetch-atp.mjs`) downloads each season's match file
  from TML in memory, extracts the Grand Slam finals (the champions), and writes
  a small cached **`data/atp/champions.csv`** plus a timestamped **`meta.json`**.
  Only the ~230-row winners file is committed — never the full match data.
- The site reads that cached file at build time via the loader
  `src/data/champions.json.js`, so builds are offline and reproducible, and the
  page shows a "Data as of …" timestamp from `meta.json`.
- To refresh after a Slam: `npm run fetch`, then commit the changed files.

## Local development

```sh
npm install
npm run fetch    # refresh the cached champions data (optional)
npm test         # unit tests for the champions extraction
npm run dev      # preview at http://localhost:3000
npm run build    # build static site to dist/
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages. The site is served under
`/observable-dataviz-test/` (set via `base` in `observablehq.config.js`).
