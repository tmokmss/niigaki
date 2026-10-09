import type { ChipBar, ChipPiece } from "./types";

const Am = ["A3", "C4", "E4"];
const F = ["F3", "A3", "C4"];
const C = ["C4", "E4", "G4"];
const G = ["G3", "B3", "D4"];
const Em = ["E4", "G4", "B4"];
const E = ["E4", "G#4", "B4"];

const A_PROG = [Am, F, C, G, Am, F, C, G];
const B_PROG = [F, G, Em, Am, F, G, Em, E];

const MELODY_A: [string, number][][] = [
  [["E5", 3], ["E5", 3], ["D5", 2], ["E5", 2], ["G5", 2], ["A5", 4]],
  [["C6", 3], ["A5", 3], ["G5", 2], ["F5", 2], ["E5", 2], ["F5", 4]],
  [["E5", 3], ["E5", 3], ["D5", 2], ["E5", 2], ["G5", 2], ["C6", 4]],
  [["B5", 3], ["A5", 3], ["G5", 2], ["D5", 8]],
  [["E5", 3], ["E5", 3], ["D5", 2], ["E5", 2], ["G5", 2], ["A5", 4]],
  [["C6", 3], ["D6", 3], ["C6", 2], ["A5", 2], ["C6", 2], ["E6", 4]],
  [["D6", 3], ["C6", 3], ["G5", 2], ["E5", 2], ["G5", 2], ["C6", 4]],
  [["B5", 2], ["C6", 2], ["D6", 4], ["B5", 8]],
];

const MELODY_B: [string, number][][] = [
  [["A5", 6], ["C6", 2], ["A5", 4], ["G5", 4]],
  [["B5", 6], ["D6", 2], ["B5", 4], ["G5", 4]],
  [["E6", 8], ["D6", 4], ["B5", 4]],
  [["C6", 6], ["B5", 2], ["A5", 8]],
  [["A5", 6], ["C6", 2], ["F6", 4], ["E6", 4]],
  [["D6", 6], ["B5", 2], ["G5", 4], ["D6", 4]],
  [["E6", 4], ["B5", 4], ["G5", 4], ["E6", 4]],
  [["G#5", 8], ["B5", 4], ["E6", 4]],
];

const full = { arp: true, bass: true, kick: true, snare: true };

const bars: ChipBar[] = [
  ...A_PROG.slice(0, 4).map((c) => ({ c, arp: true, hat: 8 as const })),
  ...A_PROG.slice(0, 4).map((c, i) => ({ c, arp: true, bass: true, kick: true, hat: 8 as const, roll: i === 3 })),
  ...MELODY_A.map((m, i) => ({ c: A_PROG[i], m, ...full, hat: 16 as const, crash: i === 0 })),
  ...MELODY_B.map((m, i) => ({ c: B_PROG[i], m, ...full, hat: 8 as const, crash: i === 0, roll: i === 7 })),
  ...A_PROG.slice(0, 4).map((c, i) => ({ c, arp: true, bass: true, crash: i === 0, roll: i === 3 })),
  ...MELODY_A.map((m, i) => ({ c: A_PROG[i], m, ...full, hat: 16 as const, harm: true, crash: i === 0 })),
];

export const vertex: ChipPiece = {
  kind: "chip",
  slug: "vertex",
  title: "Vertex",
  description: "pulse / triangle / noise",
  bpm: 150,
  bars,
  final: Am,
};
