// Build-time data loader: reads the cached ATP champions CSV + meta from the
// repo's data/atp/ folder and emits a single JSON payload for the page.
// Runs at build time, so no network and fully reproducible from committed data.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "..", "data", "atp");

// Minimal CSV parser that handles double-quoted fields (RFC-4180-ish).
function parseCsv(text) {
  const rows = [];
  let field = "";
  let record = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { record.push(field); field = ""; }
    else if (c === "\n") { record.push(field); rows.push(record); record = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || record.length) { record.push(field); rows.push(record); }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

const meta = JSON.parse(readFileSync(join(dataDir, "meta.json"), "utf8"));
const rows = parseCsv(readFileSync(join(dataDir, "champions.csv"), "utf8"));
const header = rows[0];
const champions = rows.slice(1).map((r) => {
  const o = Object.fromEntries(header.map((h, i) => [h, r[i]]));
  o.year = Number(o.year);
  o.age = o.age === "" ? null : Number(o.age);
  return o;
});

process.stdout.write(JSON.stringify({ meta, champions }));
