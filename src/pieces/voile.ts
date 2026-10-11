// Chiptune arrangement of ヴワル魔法図書館 (ZUN, 東方紅魔郷), from the piano transcription (车万石, transcribed by 豪俊提琴) in Touhou Piano Library.
import { transpose } from "../lib/score";
import type { ChipBar, ChipPiece } from "./types";

const Am = ["A3", "C4", "E4"];
const C = ["C4", "E4", "G4"];
const D = ["D4", "F#4", "A4"];
const Dm = ["D4", "F4", "A4"];
const E = ["E4", "G#4", "B4"];
const F = ["F4", "A4", "C5"];
const G = ["G3", "B3", "D4"];

type Note = [string, number];
type Line = [string[], string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): Note[] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

const up = (s: string): Note[] => m(s).map(([note, n]) => [note === "~" || note === "-" ? note : transpose(note, 12), n]);

const THEME: Line[] = [
  [Am, "C6:2 E6:2 A6:2 E6:2 C6 B5 C6 E6 B5 C6 E5:2"],
  [C, "C6:2 E6:2 G6:2 E6:2 C6 B5 C6 E6 B5 C6 E5:2"],
  [D, "B5:2 D6:2 F#6:2 D6:2 C6 B5 C6 D6 B5 C6 F#5:2"],
  [F, "A5:2 F5:2 A5:2 D6:2 A5:2 G5:2 A5:2 D6:2"],
  [Am, "C6:2 E6:2 A6:2 E6:2 C6 B5 C6 E6 B5 C6 E5:2"],
  [C, "C6:2 E6:2 G6:2 E6:2 C6 B5 C6 E6 B5 C6 E5:2"],
  [E, "B5:2 D6:2 F#6:2 D6 B5 A5:2 B5:2 B5 C6 G#5:2"],
  [F, "A5:2 F5:2 A5:2 C6:2 A5:2 F5:2 A5:2 D6:2"],
];

// the triplet bars are squeezed into 2+1+1 sixteenths
const ANSWER: Line[] = [
  [Am, "E6:2 E6:2 E6:2 A5:2 C6:3 D6:3 A6:2"],
  [C, "E6:2 E6:2 E6:2 A5:2 B5:2 C6:2 G6:2 C6:2"],
  [D, "~:6 C6 B5 A5:2 B5:2 D5 F#5 A5 D6"],
  [F, "E6:2 A5 B5 D6:2 G5 A5 C6:2 E5 C6 B5 G5 A5 E5"],
  [Am, "~:6 A4:2 B4:3 C5 ~:2 G5:2"],
  [C, "E5:6 A4:2 B4:2 C5:2 A5:2 E5:2"],
  [D, "~:6 E4 B4 C5:2 D5:2 F#5 D5 G5 D5"],
  [F, "A5:2 F5 C5 B5:2 G5 D5 C6:2 A5 E5 D6:2 A5 D5"],
];

const SLOW = [
  "E5:6 D5:2 ~:4 C5:4",
  "B4:6 A4:2 ~:4 G4:4",
  "E4:6 D4:2 ~:2 E4:2 G#4:2 B4:2",
  "C5:6 C5:2 ~:4 C5:2 D5:2",
  "E5:6 D5:2 ~:4 G5:4",
  "A5:6 B5:2 ~:2 E5:2 C6:2 E5:2",
  "D6:6 G#5:2 ~:2 A5:2 B5:2 C6:2",
  "B5:6 A5:2 E5:8",
];
const SLOW_CHORDS = [Dm, G, E, Am, F, G, E, Am];

const EIGHTHS = [
  "D5:2 A4:2 A4:2 B4:2 ~:2 A4:2 C5:2 A4:2",
  "B4:2 D4:2 D4:2 A4:2 ~:2 C4:2 G4:2 B3:2",
  "E4:2 B3:2 B3:2 D4:2 ~:2 E4:2 G#4:2 B4:2",
  "C5:2 A4:2 A4:2 C5:2 ~:2 A4:2 C5:2 D5:2",
  "E5:2 A4:2 A4:2 D5:2 ~:2 A4:2 G5:4",
  "A5:2 E5:2 E5:2 B5:2 ~:2 E5:2 C6:2 E5:2",
  "D6:2 G#5:2 G#5:2 D6:2 G#6:2 D6:2 C6 E6 A5 C6",
  "C6:6 B5:2 ~:4 G#5:2 B5:2",
];
const EIGHTH_CHORDS = [Dm, G, E, Am, F, G, E, E];

// the opening motif C-E-A-E chopped into a call over i-VI-VII-V, each call landing on a chord tone
const INTRO: Line[] = [
  [Am, "C6:3 E6:3 A6:2 E6:3 C6:5"],
  [F, "-:8 F6:2 C6:2 A5:4"],
  [G, "B5:3 D6:3 G6:2 D6:3 B5:5"],
  [E, "-:8 E6:2 B5:2 G#5:4"],
  [Am, "C6:3 E6:3 A6:2 E6:3 C6:5"],
  [F, "-:8 A5:2 C6:2 F6:4"],
  [G, "G6:4 D6:4 B5:4 G5:4"],
  [E, "G#6:4 E6:4 B5:4 G#5:4"],
];

const BUILD: Line[] = [
  [Am, "A5:2 C6:2 E6:2 A6:2 A5:2 C6:2 E6:2 A6:2"],
  [F, "A5:2 C6:2 F6:2 A6:2 A5:2 C6:2 F6:2 A6:2"],
  [E, "G#6:2 E6:2 B5:2 G#5:2 B5:4 D6:4"],
  [E, "E6:4 G#6:4 B6:8"],
];

type Flags = Omit<ChipBar, "c" | "m">;
const section = (lines: Line[], toNotes: (s: string, i: number) => Note[], flags: (i: number) => Flags): ChipBar[] =>
  lines.map(([c, s], i) => ({ c, m: toNotes(s, i), ...flags(i) }));
const zip = (chords: string[][], mel: string[]): Line[] => chords.map((c, i) => [c, mel[i]]);

const full = { arp: true, bass: true, kick: true, snare: true, hat: 16 as const };

// the slow middle tune breathes in the break and returns an octave up in the last drop;
// the last bar rests on E and its B steps up to the C that opens the intro
const bars: ChipBar[] = [
  ...section(INTRO, m, (i) => ({ arp: true, bass: true, kick: i >= 4, hat: 8 })),
  ...section(BUILD, m, (i) => ({ arp: true, bass: true, kick: true, hat: 16, roll: i === 3 })),
  ...section([...THEME, ...ANSWER], m, (i) => ({ ...full, crash: i === 0 || i === 8 })),
  ...section(zip(SLOW_CHORDS, SLOW), m, (i) => ({ arp: true, bass: true, kick: true, hat: 8, crash: i === 0 })),
  ...section(zip(EIGHTH_CHORDS, EIGHTHS), m, (i) => ({ ...full, roll: i === 7 })),
  ...section([...THEME, ...ANSWER], m, (i) => ({ ...full, harm: i >= 8, crash: i === 0 || i === 8, roll: i === 15 })),
  ...section(zip(SLOW_CHORDS, SLOW), up, (i) => ({ ...full, harm: true, crash: i === 0 })),
  ...section(zip(EIGHTH_CHORDS, EIGHTHS), (s, i) => (i < 5 ? up(s) : m(s)), (i) => ({ ...full, harm: true, crash: i === 0 })),
];

export const voile: ChipPiece = {
  kind: "chip",
  slug: "voile",
  title: "ヴワル魔法図書館",
  description: "chiptune arrange / A minor / 160 BPM",
  bpm: 160,
  groove: "four",
  bassline: "octave",
  visual: "danmaku",
  bars,
};
