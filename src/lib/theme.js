// Editorial design system: palette + Observable Plot styling helpers.
// Tuned for an Economist / NYT feel — muted, purposeful color; thin horizontal
// gridlines; restrained type; direct labeling over legends where possible.

export const INK = "#1a1a1a";
export const MUTED = "#6b6b6b";
export const FAINT = "#e6e3dd";
export const ACCENT = "#E3120B"; // Economist red
export const PAPER = "#ffffff";

// Distinct, sophisticated categorical colors for the top-10 players,
// assigned by all-time rank so a player keeps one color across every chart.
export const PLAYER_COLORS = [
  "#1A4E8A", // navy
  "#C0392B", // brick red
  "#1E8278", // teal
  "#D98324", // ochre
  "#6D4C91", // purple
  "#4C8C2B", // olive
  "#A0522D", // sienna
  "#3C8DAD", // steel
  "#B0468A", // plum
  "#7A7A7A", // grey
];

// Surface-evocative, mutually distinct tournament colors.
export const SLAM_COLORS = {
  "Australian Open": "#2E8BC0", // hard-court blue
  "Roland Garros": "#C8623B", // clay terracotta
  "Wimbledon": "#3F7E3F", // grass green
  "US Open": "#16324F", // night-session navy
};

export const SURFACE_COLORS = {
  Hard: "#2E6FB7",
  Clay: "#C8623B",
  Grass: "#3F7E3F",
  Carpet: "#8A7E6B",
};

/** Stable {domain, range} color scale mapping players (in rank order) to colors. */
export function playerScale(players) {
  return { domain: players, range: players.map((_, i) => PLAYER_COLORS[i % PLAYER_COLORS.length]) };
}

export function colorForPlayer(players, name) {
  const i = players.indexOf(name);
  return i < 0 ? MUTED : PLAYER_COLORS[i % PLAYER_COLORS.length];
}

// Shared Plot base: clean sans, dark ink, no clutter. Spread into Plot.plot({...}).
export const base = {
  style: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "13px", color: INK, background: "transparent" },
};

export const ordinalNames = (slam) => SLAM_COLORS[slam] ?? MUTED;
