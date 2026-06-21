// See https://observablehq.com/framework/config for documentation.
const SITE = "https://onthemargin.github.io/grand-slam-champions";
const DESC =
  "Every men's Grand Slam champion of the Open era (1968–2026) in five " +
  "interactive charts — the title race, rivalries, finals drama, and dynasties.";

export default {
  title: "ATP Grand Slam Champions",

  // Social cards, description, and a tennis-ball favicon (inline SVG, no file).
  head: `
<meta name="description" content="${DESC}">
<meta property="og:type" content="website">
<meta property="og:title" content="Kings of the Majors — ATP Grand Slam Champions">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITE}/">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Kings of the Majors">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8E%BE%3C/text%3E%3C/svg%3E">
`,

  // GitHub Pages serves project sites under /<repo>/, so set the base path.
  // Change this if you rename the repo.
  base: "/grand-slam-champions/",

  // Single-page site: everything lives on src/index.md, no nav chrome.
  pages: [],
  sidebar: false,
  toc: false,
  pager: false,

  // No site-wide footer — attribution lives in the in-page "About this data"
  // block at the foot of the story, so there's a single footer.
  footer: "",

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
