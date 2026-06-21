// Extracts Grand Slam champions (final winners) from TML/Sackmann-schema CSV text.
// A champion is the winner of a match with tourney_level === "G" and round === "F".

export function normalizeSlam(name) {
  if (/^Australian/i.test(name)) return "Australian Open";
  return name;
}

// Header-driven parse so a minimal column subset works in tests and the full
// Sackmann header works in production. Naive comma split is safe for this
// dataset (no quoted/embedded commas in the fields we read).
export function extractChampions(csvText) {
  const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const cols = lines[0].split(",");
  const idx = Object.fromEntries(cols.map((name, i) => [name, i]));
  const get = (row, name) => (idx[name] != null ? row[idx[name]] : undefined);

  const champions = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (get(row, "tourney_level") !== "G" || get(row, "round") !== "F") continue;
    const date = get(row, "tourney_date") ?? "";
    const age = get(row, "winner_age");
    champions.push({
      year: Number(String(date).slice(0, 4)),
      date,
      slam: normalizeSlam(get(row, "tourney_name") ?? ""),
      surface: get(row, "surface") ?? "",
      champion: get(row, "winner_name") ?? "",
      champion_ioc: get(row, "winner_ioc") ?? "",
      seed: get(row, "winner_seed") ?? "",
      age: age ? Math.floor(Number(age)) : "",
      runner_up: get(row, "loser_name") ?? "",
      runner_up_ioc: get(row, "loser_ioc") ?? "",
      score: get(row, "score") ?? "",
    });
  }
  return champions;
}
