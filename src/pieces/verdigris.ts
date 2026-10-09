import type { ChipBar, ChipPiece } from "./types";

const Em = ["E4", "G4", "B4"];
const C = ["C4", "E4", "G4"];
const D = ["D4", "F#4", "A4"];
const B = ["B3", "D#4", "F#4"];
const Am = ["A3", "C4", "E4"];
const G = ["G3", "B3", "D4"];

const INTRO = [Em, C, D, B, Em, C, Am, B];
const VERSE = [Am, D, G, Em, Am, B, Em, Em];
const PRE = [C, D, B, B];
const CHORUS = [C, D, B, Em, Am, B, Em, B];

const RUN_EM: [string, number][] = [["E5", 1], ["F#5", 1], ["G5", 1], ["B5", 1], ["E6", 2], ["D6", 2], ["B5", 2], ["G5", 2], ["A5", 2], ["B5", 2]];
const RUN_C: [string, number][] = [["C6", 3], ["B5", 1], ["A5", 2], ["G5", 2], ["E5", 4], ["G5", 2], ["A5", 2]];

const MELODY_INTRO: [string, number][][] = [
  RUN_EM,
  RUN_C,
  [["D6", 1], ["C6", 1], ["B5", 1], ["A5", 1], ["B5", 2], ["A5", 2], ["F#5", 2], ["D5", 2], ["F#5", 2], ["A5", 2]],
  [["D#6", 6], ["B5", 2], ["F#5", 4], ["D#5", 4]],
  RUN_EM,
  RUN_C,
  [["C6", 1], ["B5", 1], ["A5", 1], ["G5", 1], ["A5", 2], ["C6", 2], ["E6", 4], ["D6", 2], ["C6", 2]],
  [["B5", 8], ["D#6", 4], ["F#6", 4]],
];

const MELODY_VERSE: [string, number][][] = [
  [["E5", 2], ["A5", 2], ["B5", 2], ["C6", 4], ["B5", 2], ["A5", 2], ["B5", 2]],
  [["A5", 4], ["F#5", 2], ["D5", 2], ["F#5", 4], ["A5", 4]],
  [["B5", 2], ["D6", 2], ["B5", 2], ["G5", 4], ["A5", 2], ["B5", 2], ["D6", 2]],
  [["E6", 6], ["D6", 2], ["B5", 8]],
  [["E5", 2], ["A5", 2], ["B5", 2], ["C6", 4], ["B5", 2], ["A5", 2], ["B5", 2]],
  [["F#5", 2], ["A5", 2], ["B5", 2], ["D#6", 4], ["C6", 2], ["B5", 2], ["A5", 2]],
  [["G5", 4], ["F#5", 4], ["E5", 4], ["B4", 4]],
  [["E5", 8], ["-", 8]],
];

const MELODY_PRE: [string, number][][] = [
  [["E5", 2], ["G5", 2], ["C6", 2], ["E6", 2], ["D6", 4], ["C6", 4]],
  [["F#5", 2], ["A5", 2], ["D6", 2], ["F#6", 2], ["E6", 4], ["D6", 4]],
  [["D#6", 4], ["E6", 4], ["F#6", 4], ["A6", 4]],
  [["B6", 8], ["A6", 2], ["G6", 2], ["F#6", 2], ["D#6", 2]],
];

const MELODY_CHORUS: [string, number][][] = [
  [["E6", 3], ["D6", 3], ["E6", 2], ["G6", 4], ["E6", 4]],
  [["F#6", 3], ["E6", 3], ["D6", 2], ["A5", 4], ["D6", 4]],
  [["D#6", 3], ["E6", 3], ["F#6", 2], ["B6", 8]],
  [["G6", 4], ["F#6", 2], ["E6", 2], ["B5", 8]],
  [["C6", 3], ["B5", 3], ["C6", 2], ["E6", 4], ["A6", 4]],
  [["F#6", 3], ["E6", 3], ["D#6", 2], ["F#6", 4], ["B5", 4]],
  [["E6", 2], ["F#6", 2], ["G6", 2], ["B6", 2], ["A6", 2], ["G6", 2], ["F#6", 2], ["E6", 2]],
  [["D#6", 4], ["F#6", 4], ["B6", 8]],
];

const full = { arp: true, bass: true, kick: true, snare: true };

// the chorus ends on B, the dominant, and drops straight back into the intro's E minor run
const bars: ChipBar[] = [
  ...MELODY_INTRO.map((m, i) => ({ c: INTRO[i], m, ...full, hat: 16 as const, crash: i === 0 })),
  ...MELODY_VERSE.map((m, i) => ({ c: VERSE[i], m, ...full, hat: 8 as const, crash: i === 0 })),
  ...MELODY_PRE.map((m, i) => ({ c: PRE[i], m, ...full, hat: 16 as const, harm: true, roll: i === 3 })),
  ...MELODY_CHORUS.map((m, i) => ({ c: CHORUS[i], m, ...full, hat: 16 as const, harm: true, crash: i === 0 })),
];

export const verdigris: ChipPiece = {
  kind: "chip",
  slug: "verdigris",
  title: "Verdigris",
  description: "chiptune / E minor / 155 BPM",
  bpm: 155,
  groove: "four",
  bassline: "octave",
  bars,
};
