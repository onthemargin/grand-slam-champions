# observable-dataviz-test

A test of [Observable Framework](https://observablehq.com/framework/) hosted on GitHub Pages.

**Live site:** https://onthemargin.github.io/observable-dataviz-test/

## Local development

```sh
npm install
npm run dev      # preview at http://localhost:3000
npm run build    # build static site to dist/
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages.

The site is served under `/observable-dataviz-test/`, set via `base` in
`observablehq.config.js`. If you rename the repo, update that value.
