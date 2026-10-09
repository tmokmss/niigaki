import type { ChipBar, ChipPiece } from "./types";

const Em = ["E3", "G3", "B3"];
const F = ["F3", "A3", "C4"];
const C = ["C3", "E3", "G3"];
const D = ["D3", "F#3", "A3"];
const B = ["B2", "D#3", "F#3"];

const RIFF = [Em, Em, F, Em, Em, Em, F, Em];
const RISE = [C, D, Em, Em, C, D, B, B];

const MELODY_RIFF: [string, number][][] = [
  [["E5", 2], ["E5", 2], ["E6", 2], ["E5", 2], ["D6", 2], ["E5", 2], ["B5", 2], ["G5", 2]],
  [["E5", 2], ["E5", 2], ["E6", 2], ["E5", 2], ["G5", 3], ["F#5", 3], ["E5", 2]],
  [["F5", 2], ["F5", 2], ["F6", 2], ["F5", 2], ["E6", 2], ["F5", 2], ["C6", 2], ["A5", 2]],
  [["B5", 6], ["G5", 2], ["E5", 8]],
  [["E5", 2], ["E5", 2], ["E6", 2], ["E5", 2], ["D6", 2], ["E5", 2], ["B5", 2], ["G5", 2]],
  [["E5", 2], ["E5", 2], ["E6", 2], ["E5", 2], ["G5", 3], ["F#5", 3], ["E5", 2]],
  [["F5", 2], ["F5", 2], ["F6", 2], ["F5", 2], ["E6", 2], ["F5", 2], ["C6", 2], ["A5", 2]],
  [["B5", 4], ["C6", 4], ["B5", 4], ["F5", 4]],
];

const MELODY_RISE: [string, number][][] = [
  [["G5", 6], ["E5", 2], ["C6", 8]],
  [["A5", 6], ["F#5", 2], ["D6", 8]],
  [["E6", 4], ["D6", 4], ["B5", 4], ["G5", 4]],
  [["E6", 16]],
  [["G6", 6], ["E6", 2], ["C6", 8]],
  [["F#6", 6], ["D6", 2], ["A5", 8]],
  [["D#6", 8], ["F#6", 8]],
  [["B5", 8], ["-", 4], ["B4", 4]],
];

const full = { arp: true, bass: true, kick: true, snare: true, hat: 16 as const };

// the breakdown's last bar rolls into the riff, which opens on a crash every time round
const bars: ChipBar[] = [
  ...MELODY_RIFF.map((m, i) => ({ c: RIFF[i], m, ...full, crash: i === 0 })),
  ...MELODY_RISE.map((m, i) => ({ c: RISE[i], m, ...full, crash: i === 0 })),
  ...MELODY_RIFF.map((m, i) => ({ c: RIFF[i], m, ...full, harm: true, crash: i === 0 })),
  ...RIFF.slice(0, 4).map((c, i) => ({ c, bass: true, kick: true, hat: 8 as const, roll: i === 3 })),
];

export const undertow: ChipPiece = {
  kind: "chip",
  slug: "undertow",
  title: "Undertow",
  description: "chiptune / E phrygian / 160 BPM",
  bpm: 160,
  groove: "break",
  bassline: "pulse",
  bars,
};
