import type { ChipBar, ChipPiece } from "./types";

const Dm = ["D4", "F4", "A4"];
const Gm = ["G3", "Bb3", "D4"];
const Bb = ["Bb3", "D4", "F4"];
const A = ["A3", "C#4", "E4"];
const C = ["C4", "E4", "G4"];
const Am = ["A3", "C4", "E4"];

const VERSE = [Dm, Gm, Bb, A, Dm, Gm, Bb, A];
const LIFT = [Bb, C, Am, Dm, Bb, C, A, A];

const MELODY_VERSE: [string, number][][] = [
  [["A5", 6], ["F5", 2], ["D5", 8]],
  [["D5", 4], ["Bb5", 4], ["A5", 4], ["G5", 4]],
  [["F5", 6], ["D5", 2], ["F5", 4], ["A5", 4]],
  [["E5", 12], ["C#5", 4]],
  [["A5", 6], ["F5", 2], ["D6", 8]],
  [["C6", 4], ["Bb5", 4], ["A5", 4], ["G5", 4]],
  [["F5", 4], ["G5", 4], ["A5", 4], ["Bb5", 4]],
  [["A5", 8], ["G5", 4], ["E5", 4]],
];

const MELODY_LIFT: [string, number][][] = [
  [["D6", 3], ["D6", 3], ["C6", 2], ["Bb5", 4], ["F5", 4]],
  [["E6", 3], ["E6", 3], ["D6", 2], ["C6", 4], ["G5", 4]],
  [["C6", 4], ["E6", 4], ["A6", 8]],
  [["F6", 6], ["E6", 2], ["D6", 8]],
  [["D6", 3], ["D6", 3], ["C6", 2], ["Bb5", 4], ["F5", 4]],
  [["E6", 3], ["F6", 3], ["G6", 2], ["E6", 4], ["C6", 4]],
  [["C#6", 8], ["E6", 8]],
  [["A5", 16]],
];

const ECHO: ([string, number][] | undefined)[] = [
  [["A5", 6], ["F5", 2], ["D5", 8]],
  undefined,
  [["F5", 6], ["D5", 2], ["F5", 8]],
  undefined,
];

const full = { arp: true, bass: true, kick: true, snare: true };

// the second verse ends on A and runs back into the first verse's D minor
const bars: ChipBar[] = [
  ...MELODY_VERSE.map((m, i) => ({ c: VERSE[i], m, ...full, hat: 8 as const })),
  ...MELODY_LIFT.map((m, i) => ({ c: LIFT[i], m, ...full, hat: 16 as const, harm: true, crash: i === 0, roll: i === 7 })),
  ...ECHO.map((m, i) => ({ c: VERSE[i], m, arp: true, bass: true, crash: i === 0, roll: i === 3 })),
  ...MELODY_VERSE.map((m, i) => ({ c: VERSE[i], m, ...full, hat: 16 as const, harm: true, crash: i === 0 })),
];

export const afterglow: ChipPiece = {
  kind: "chip",
  slug: "afterglow",
  title: "Afterglow",
  description: "chiptune / D minor / 128 BPM",
  bpm: 128,
  groove: "half",
  bassline: "octave",
  bars,
};
