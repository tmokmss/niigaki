import type { ChipBar, ChipPiece } from "./types";

const C = ["C4", "E4", "G4"];
const G = ["G3", "B3", "D4"];
const Am = ["A3", "C4", "E4"];
const F = ["F3", "A3", "C4"];
const Em = ["E4", "G4", "B4"];

const VERSE = [C, G, Am, F, C, G, Am, F];
const CHORUS = [F, G, Em, Am, F, G, C, C];
const BREAK = [C, G, Am, F];

const MELODY_VERSE: [string, number][][] = [
  [["G5", 2], ["-", 1], ["G5", 1], ["E5", 2], ["G5", 2], ["C6", 3], ["-", 1], ["B5", 2], ["A5", 2]],
  [["G5", 2], ["-", 1], ["G5", 1], ["D5", 2], ["G5", 2], ["B5", 3], ["-", 1], ["A5", 2], ["G5", 2]],
  [["E5", 2], ["-", 1], ["E5", 1], ["C5", 2], ["E5", 2], ["A5", 3], ["-", 1], ["G5", 2], ["E5", 2]],
  [["F5", 2], ["G5", 2], ["A5", 2], ["C6", 2], ["D6", 4], ["C6", 4]],
  [["G5", 2], ["-", 1], ["G5", 1], ["E5", 2], ["G5", 2], ["C6", 3], ["-", 1], ["B5", 2], ["A5", 2]],
  [["G5", 2], ["-", 1], ["G5", 1], ["D5", 2], ["G5", 2], ["B5", 3], ["-", 1], ["A5", 2], ["G5", 2]],
  [["A5", 2], ["-", 1], ["A5", 1], ["C6", 2], ["E6", 2], ["D6", 3], ["-", 1], ["C6", 2], ["B5", 2]],
  [["A5", 4], ["G5", 4], ["F5", 4], ["G5", 4]],
];

const MELODY_CHORUS: [string, number][][] = [
  [["C6", 6], ["A5", 2], ["C6", 4], ["F6", 4]],
  [["D6", 6], ["B5", 2], ["D6", 4], ["G6", 4]],
  [["E6", 4], ["D6", 4], ["B5", 4], ["G5", 4]],
  [["A5", 6], ["B5", 2], ["C6", 8]],
  [["C6", 6], ["A5", 2], ["C6", 4], ["F6", 4]],
  [["G6", 4], ["F6", 4], ["E6", 4], ["D6", 4]],
  [["E6", 16]],
  [["-", 8], ["G5", 2], ["A5", 2], ["B5", 4]],
];

const full = { arp: true, bass: true, kick: true, snare: true, hat: 16 as const };

// the second chorus ends with a G-A-B pickup into the first verse's G
const bars: ChipBar[] = [
  ...MELODY_VERSE.map((m, i) => ({ c: VERSE[i], m, ...full, crash: i === 0 })),
  ...MELODY_CHORUS.map((m, i) => ({ c: CHORUS[i], m, ...full, crash: i === 0 })),
  ...BREAK.map((c, i) => ({ c, arp: true, bass: true, crash: i === 0, roll: i === 3 })),
  ...MELODY_VERSE.map((m, i) => ({ c: VERSE[i], m, ...full, harm: true, crash: i === 0 })),
  ...MELODY_CHORUS.map((m, i) => ({ c: CHORUS[i], m, ...full, harm: true, crash: i === 0 })),
];

export const sugarRush: ChipPiece = {
  kind: "chip",
  slug: "sugar-rush",
  title: "Sugar Rush",
  description: "chiptune / C major / 172 BPM",
  bpm: 172,
  groove: "four",
  bassline: "fifth",
  bars,
};
