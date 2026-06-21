import { test } from "node:test";
import assert from "node:assert/strict";
import {
  topPlayers,
  cumulativeByYear,
  titlesByPlayerSlam,
  finalsMatrix,
  cumulativeByCountry,
  finalsAppearances,
  finalsRecord,
  finalsBetween,
  parseScore,
  reignBlocks,
} from "../src/lib/transforms.js";

const champs = [
  { year: 2021, slam: "Australian Open", champion: "Djokovic", champion_ioc: "SRB", runner_up: "Medvedev" },
  { year: 2021, slam: "Roland Garros", champion: "Djokovic", champion_ioc: "SRB", runner_up: "Tsitsipas" },
  { year: 2021, slam: "Wimbledon", champion: "Djokovic", champion_ioc: "SRB", runner_up: "Berrettini" },
  { year: 2021, slam: "US Open", champion: "Medvedev", champion_ioc: "RUS", runner_up: "Djokovic" },
  { year: 2022, slam: "Australian Open", champion: "Nadal", champion_ioc: "ESP", runner_up: "Medvedev" },
  { year: 2022, slam: "Roland Garros", champion: "Nadal", champion_ioc: "ESP", runner_up: "Ruud" },
];

test("topPlayers ranks by total titles", () => {
  const top = topPlayers(champs, 2);
  assert.deepEqual(top, [
    { player: "Djokovic", titles: 3 },
    { player: "Nadal", titles: 2 },
  ]);
});

test("cumulativeByYear carries totals forward across the full year span", () => {
  const rows = cumulativeByYear(champs, ["Djokovic", "Nadal"]);
  const dj = rows.filter((r) => r.player === "Djokovic");
  const na = rows.filter((r) => r.player === "Nadal");
  assert.deepEqual(dj.map((r) => [r.year, r.titles]), [[2021, 3], [2022, 3]]);
  assert.deepEqual(na.map((r) => [r.year, r.titles]), [[2021, 0], [2022, 2]]);
});

test("cumulativeByYear can filter to a single Slam", () => {
  const rows = cumulativeByYear(champs, ["Djokovic"], { slam: "Wimbledon" });
  assert.deepEqual(rows.map((r) => [r.year, r.titles]), [[2021, 1], [2022, 1]]);
});

test("titlesByPlayerSlam counts titles per player per slam", () => {
  const rows = titlesByPlayerSlam(champs, ["Djokovic"]);
  const wim = rows.find((r) => r.player === "Djokovic" && r.slam === "Wimbledon");
  assert.equal(wim.titles, 1);
  const total = rows.filter((r) => r.player === "Djokovic").reduce((s, r) => s + r.titles, 0);
  assert.equal(total, 3);
});

test("finalsMatrix records head-to-head wins from finals", () => {
  const m = finalsMatrix(champs);
  const djOverMed = m.find((c) => c.winner === "Djokovic" && c.loser === "Medvedev");
  const medOverDj = m.find((c) => c.winner === "Medvedev" && c.loser === "Djokovic");
  assert.equal(djOverMed.count, 1);
  assert.equal(medOverDj.count, 1);
});

test("finalsAppearances counts champion and runner-up finals", () => {
  const a = finalsAppearances(champs);
  assert.equal(a.find((x) => x.player === "Djokovic").finals, 4); // 3 won + 1 lost
  assert.equal(a.find((x) => x.player === "Medvedev").finals, 3); // 1 won + 2 lost
});

test("finalsRecord aggregates a player's wins/losses by opponent", () => {
  const r = finalsRecord(champs, "Djokovic");
  const med = r.find((x) => x.opponent === "Medvedev");
  assert.equal(med.wins, 1);
  assert.equal(med.losses, 1);
  assert.equal(r.find((x) => x.opponent === "Tsitsipas").wins, 1);
  assert.equal(r[0].opponent, "Medvedev"); // most meetings sorts first
});

test("finalsBetween returns both meetings sorted by year", () => {
  const f = finalsBetween(champs, "Djokovic", "Medvedev");
  assert.equal(f.length, 2);
  assert.deepEqual(f.map((x) => x.winner).sort(), ["Djokovic", "Medvedev"]);
});

test("parseScore classifies sets, tiebreaks and retirements", () => {
  assert.deepEqual(parseScore("6-3 7-6(4) 6-3"), {sets: 3, tiebreaks: 1, retired: false, category: "straight"});
  assert.deepEqual(parseScore("2-6 6-2 6-3 7-5"), {sets: 4, tiebreaks: 0, retired: false, category: "four"});
  assert.deepEqual(parseScore("4-6 6-7(4) 6-4 7-6(3) 7-6(2)"), {sets: 5, tiebreaks: 3, retired: false, category: "five"});
  assert.equal(parseScore("14-12 5-7 6-3 3-6 6-3").category, "five");
  const ret = parseScore("5-0 RET");
  assert.equal(ret.retired, true);
  assert.equal(ret.category, "retired");
});

test("reignBlocks merges consecutive same-champion editions", () => {
  const fix = [
    { year: 2018, slam: "Wimbledon", date: "20180702", champion: "Djokovic" },
    { year: 2019, slam: "Wimbledon", date: "20190701", champion: "Djokovic" },
    { year: 2021, slam: "Wimbledon", date: "20210628", champion: "Djokovic" }, // 2020 not held
    { year: 2022, slam: "Wimbledon", date: "20220627", champion: "Federer" },
    { year: 1977, slam: "Australian Open", date: "19770101", champion: "Tanner" },
    { year: 1977, slam: "Australian Open", date: "19771219", champion: "Gerulaitis" }, // same year, dropped
  ];
  const b = reignBlocks(fix);
  const dj = b.find((x) => x.slam === "Wimbledon" && x.champion === "Djokovic");
  assert.deepEqual([dj.startYear, dj.endYear, dj.count], [2018, 2021, 3]);
  assert.equal(b.find((x) => x.slam === "Wimbledon" && x.champion === "Federer").count, 1);
  // earliest-by-date wins the de-dupe for the twice-held 1977 Australian Open
  const ao = b.filter((x) => x.slam === "Australian Open");
  assert.equal(ao.length, 1);
  assert.equal(ao[0].champion, "Tanner");
});

test("cumulativeByCountry accumulates titles by country over years", () => {
  const rows = cumulativeByCountry(champs);
  const esp2022 = rows.find((r) => r.country === "ESP" && r.year === 2022);
  const srb2022 = rows.find((r) => r.country === "SRB" && r.year === 2022);
  assert.equal(esp2022.titles, 2);
  assert.equal(srb2022.titles, 3);
});
