// See https://observablehq.com/framework/config for documentation.
export default {
  title: "ATP Grand Slam Champions",

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
