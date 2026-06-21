import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSlam, extractChampions } from "../scripts/lib/champions.mjs";

// Minimal Sackmann-schema fixture: header + a final, a non-final, and a
// non-Slam final that must all be filtered correctly.
const HEADER =
  "tourney_name,surface,tourney_level,tourney_date,round,winner_name,winner_ioc,winner_seed,winner_age,loser_name,loser_ioc,score";
const fixture = [
  HEADER,
  "Wimbledon,Grass,G,20250630,F,Jannik Sinner,ITA,1,23.9,Carlos Alcaraz,ESP,4-6 6-4 6-4 6-4",
  "Wimbledon,Grass,G,20250630,SF,Jannik Sinner,ITA,1,23.9,Novak Djokovic,SRB,6-3 6-3 6-4",
  "Cincinnati Masters,Hard,M,20250810,F,Carlos Alcaraz,ESP,2,22.3,Jannik Sinner,ITA,5-0 RET",
].join("\n");

test("normalizeSlam folds Australian naming variants", () => {
  assert.equal(normalizeSlam("Australian Open"), "Australian Open");
  assert.equal(normalizeSlam("Australian Open-1"), "Australian Open");
  assert.equal(normalizeSlam("Australian Open-2"), "Australian Open");
  assert.equal(normalizeSlam("Australian Championships"), "Australian Open");
  assert.equal(normalizeSlam("Roland Garros"), "Roland Garros");
  assert.equal(normalizeSlam("US Open"), "US Open");
});

test("extractChampions keeps only Grand Slam finals", () => {
  const champs = extractChampions(fixture);
  assert.equal(champs.length, 1, "only the Wimbledon final should match");
  const c = champs[0];
  assert.equal(c.year, 2025);
});

test("extractChampions maps fields from the final row", () => {
  const c = extractChampions(fixture)[0];
  assert.equal(c.year, 2025);
  assert.equal(c.slam, "Wimbledon");
  assert.equal(c.surface, "Grass");
  assert.equal(c.champion, "Jannik Sinner");
  assert.equal(c.champion_ioc, "ITA");
  assert.equal(c.runner_up, "Carlos Alcaraz");
  assert.equal(c.score, "4-6 6-4 6-4 6-4");
});
