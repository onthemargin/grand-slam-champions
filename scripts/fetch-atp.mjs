// Downloads the full ATP (men's) match history from the Tennismylife/TML-Database
// GitHub repo into data/atp/ and writes a timestamped meta.json.
//
// Run:  npm run fetch
//
// Source data is in the Jeff Sackmann schema (winner_id, surface, tourney_level, ...).
// Open-era coverage: 1968 to the current year. Re-run after each Slam to refresh.

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = "Tennismylife/TML-Database";
const BRANCH = "master";
const RAW = (file) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${file}`;
const FIRST_YEAR = 1968;
const CONCURRENCY = 8;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "data", "atp");

// The current year is the last file the repo publishes. We probe forward from
// FIRST_YEAR until a year 404s, so we never hard-code the end and always get
// whatever the latest published season is.
async function listYears() {
  const years = [];
  // Probe a generous upper bound; stop at the first missing recent year.
  for (let y = FIRST_YEAR; y <= FIRST_YEAR + 200; y++) {
    years.push(y);
    if (y > 2026 + 1) break; // safety; the HEAD checks below decide what exists
  }
  // Filter to years that actually exist via cheap HEAD requests.
  const existing = [];
  for (let i = 0; i < years.length; i += CONCURRENCY) {
    const batch = years.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (y) => {
        const res = await fetch(RAW(`${y}.csv`), { method: "HEAD" });
        return res.ok ? y : null;
      })
    );
    const found = results.filter((y) => y !== null);
    existing.push(...found);
    // If a whole batch past 2000 came back empty, we've run off the end.
    if (found.length === 0 && batch[0] > 2000) break;
  }
  return existing.sort((a, b) => a - b);
}

async function downloadYear(year) {
  const res = await fetch(RAW(`${year}.csv`));
  if (!res.ok) throw new Error(`${year}.csv -> HTTP ${res.status}`);
  const text = await res.text();
  await writeFile(join(OUT_DIR, `${year}.csv`), text);
  // Row count = non-empty lines minus the header.
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return { year, matches: Math.max(0, lines.length - 1), bytes: Buffer.byteLength(text) };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Listing available years from ${REPO}...`);
  const years = await listYears();
  console.log(`Found ${years.length} years: ${years[0]}–${years.at(-1)}`);

  const stats = [];
  for (let i = 0; i < years.length; i += CONCURRENCY) {
    const batch = years.slice(i, i + CONCURRENCY);
    const got = await Promise.all(batch.map(downloadYear));
    stats.push(...got);
    console.log(`  downloaded ${stats.length}/${years.length}`);
  }

  const totalMatches = stats.reduce((s, x) => s + x.matches, 0);
  const totalBytes = stats.reduce((s, x) => s + x.bytes, 0);

  const meta = {
    tour: "ATP",
    source: "Tennismylife/TML-Database",
    sourceUrl: `https://github.com/${REPO}`,
    license: "CC BY-NC-SA 4.0 (Jeff Sackmann schema)",
    schema: "sackmann",
    fetchedAt: new Date().toISOString(),
    years: { from: years[0], to: years.at(-1), count: years.length },
    totalMatches,
    totalBytes,
    files: stats.map((s) => `${s.year}.csv`),
  };
  await writeFile(join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log(
    `\nDone. ${years.length} files, ${totalMatches.toLocaleString()} matches, ` +
      `${(totalBytes / 1048576).toFixed(1)} MB.`
  );
  console.log(`Wrote ${OUT_DIR}/<year>.csv and meta.json (fetchedAt ${meta.fetchedAt}).`);
}

main().catch((err) => {
  console.error("fetch failed:", err.message);
  process.exit(1);
});
