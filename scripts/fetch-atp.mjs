// Builds the ATP (men's) Grand Slam champions dataset from the
// Tennismylife/TML-Database GitHub repo (Jeff Sackmann schema).
//
// Run:  npm run fetch
//
// Downloads each year's match file in memory, extracts Grand Slam finals
// (the champions), and writes a single small data/atp/champions.csv plus a
// timestamped meta.json. The bulky match data is never committed — only the
// ~230-row winners file. Re-run after each Slam to refresh.

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extractChampions } from "./lib/champions.mjs";

const REPO = "Tennismylife/TML-Database";
const BRANCH = "master";
const RAW = (file) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${file}`;
const FIRST_YEAR = 1968;
const CONCURRENCY = 8;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "data", "atp");

const COLUMNS = [
  "year", "slam", "surface", "date", "champion", "champion_ioc",
  "seed", "age", "runner_up", "runner_up_ioc", "score",
];

async function listYears() {
  const existing = [];
  for (let y = FIRST_YEAR; y <= FIRST_YEAR + 200; y += CONCURRENCY) {
    const batch = Array.from({ length: CONCURRENCY }, (_, k) => y + k);
    const results = await Promise.all(
      batch.map(async (yr) => ((await fetch(RAW(`${yr}.csv`), { method: "HEAD" })).ok ? yr : null))
    );
    const found = results.filter((yr) => yr !== null);
    existing.push(...found);
    if (found.length === 0 && batch[0] > 2000) break;
  }
  return existing.sort((a, b) => a - b);
}

async function championsForYear(year) {
  const res = await fetch(RAW(`${year}.csv`));
  if (!res.ok) throw new Error(`${year}.csv -> HTTP ${res.status}`);
  return extractChampions(await res.text());
}

function toCsv(rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [COLUMNS.join(",")];
  for (const r of rows) lines.push(COLUMNS.map((c) => esc(r[c])).join(","));
  return lines.join("\n") + "\n";
}

// Reads optional data/atp/manual-additions.csv (same column layout as the
// output) for majors not yet in the upstream source. Returns [] if absent.
async function loadManual() {
  let text;
  try {
    text = await readFile(join(OUT_DIR, "manual-additions.csv"), "utf8");
  } catch {
    return [];
  }
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const head = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const o = {};
    head.forEach((h, i) => (o[h] = cells[i]));
    o.year = Number(o.year);
    o.age = o.age === "" || o.age == null ? "" : Number(o.age);
    return o;
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Listing available years from ${REPO}...`);
  const years = await listYears();
  console.log(`Found ${years.length} years: ${years[0]}–${years.at(-1)}`);

  const all = [];
  for (let i = 0; i < years.length; i += CONCURRENCY) {
    const batch = years.slice(i, i + CONCURRENCY);
    const got = await Promise.all(batch.map(championsForYear));
    got.forEach((c) => all.push(...c));
    console.log(`  processed ${Math.min(i + CONCURRENCY, years.length)}/${years.length} years`);
  }

  // The upstream CSV lags the live season, so merge in any hand-curated recent
  // majors it is still missing (matched on year + slam, never overwriting).
  const manual = await loadManual();
  const seen = new Set(all.map((c) => `${c.year}|${c.slam}`));
  let added = 0;
  for (const m of manual) {
    const k = `${m.year}|${m.slam}`;
    if (!seen.has(k)) { all.push(m); seen.add(k); added++; }
  }

  all.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  await writeFile(join(OUT_DIR, "champions.csv"), toCsv(all));

  const slams = [...new Set(all.map((c) => c.slam))].sort();
  const lastYear = all.reduce((m, c) => Math.max(m, c.year), years[0]);
  const sources = [
    { name: "ATP Tour", url: "https://www.atptour.com/" },
    { name: "Tennis Abstract (Jeff Sackmann)", url: "https://github.com/JeffSackmann" },
    { name: "Tennismylife / TML-Database", url: `https://github.com/${REPO}` },
  ];
  if (added > 0) sources.push({ name: "Wikipedia (current-season majors)", url: "https://en.wikipedia.org/wiki/Grand_Slam_(tennis)" });
  const meta = {
    tour: "ATP",
    title: "ATP Grand Slam champions",
    license: "Educational / non-commercial use only",
    attribution:
      "Match results from the official ATP Tour, compiled by Tennis Abstract " +
      "(Jeff Sackmann) and Tennismylife (TML-Database). Educational, " +
      "non-commercial use only.",
    note: added > 0
      ? "The current season's majors are added from official results, as the " +
        "upstream CSV database lags the live tour."
      : undefined,
    sources,
    fetchedAt: new Date().toISOString(),
    years: { from: years[0], to: lastYear },
    slams,
    championCount: all.length,
    manualAdditions: added,
  };
  await writeFile(join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log(
    `\nDone. ${all.length} Grand Slam champions ${years[0]}–${lastYear} ` +
      `across ${slams.length} events (${added} added from manual-additions.csv).`
  );
  console.log(`Wrote ${OUT_DIR}/champions.csv and meta.json (fetchedAt ${meta.fetchedAt}).`);
}

main().catch((err) => {
  console.error("fetch failed:", err.message);
  process.exit(1);
});
