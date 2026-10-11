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

// the rebuild hands the eighth-note tune over to the theme head, chopped tighter each bar
const REBUILD: Line[] = [
  [F, "A5:2 C6:2 F6:2 -:2 A5:2 C6:2 F6:2 -:2"],
  [G, "B5:2 D6:2 G6:2 B5:2 D6:2 G6:2 B5:2 D6:2"],
  [E, "B5 E6 G#6 B5 E6 G#6 B5 E6 G#6 B5 E6 G#6 B5 E6 G#6 B6"],
  [E, "E6 G#6 B6 E6 G#6 B6 E6 G#6 B6:8"],
];
const zip = (chords: string[][], mel: string[]): Line[] => chords.map((c, i) => [c, mel[i]]);

// the head of the theme chopped and repeated, each call closer to the last
const BUILD: Line[] = [
  [Am, "C6:2 E6:2 A6:2 -:2 C6:2 E6:2 A6:2 -:2"],
  [C, "C6:2 E6:2 G6:2 C6:2 E6:2 G6:2 C6:2 E6:2"],
  [F, "A5 C6 F6 A5 C6 F6 A5 C6 F6 A5 C6 F6 A5 C6 F6 A6"],
  [E, "G#5 B5 E6 G#5 B5 E6 G#6:2 B6:8"],
];

// restruck: long notes become repeated eighths and sixteenths with offbeat pushes
const DROP1: Line[] = [
  THEME[0],
  THEME[1],
  [D, "D6:3 D6:3 F#6:2 F#6 F#6 D6:2 A5:2 D6:2"],
  [F, "A5 A5 A5:2 C6:3 A5:3 F5:2 A5 A5 C6:2"],
  [Am, "C6:2 E6:2 A6:2 C6:2 E6:2 A6:2 E6:2 A5:2"],
  [C, "E6:3 E6:3 G6:2 E6 E6 C6:2 G5:2 C6:2"],
  [E, "B5:3 B5:3 E6:2 G#6 G#6 E6:2 B5:2 G#5:2"],
  [F, "F6:3 C6:3 A5:2 C6 C6 A5 A5 F5:2 A5:2"],
  ANSWER[0],
  ANSWER[1],
  [D, "C6 C6 C6:2 -:1 C6:3 B5 A5:2 B5 D5 F#5 A5 D6"],
  [F, "C6:2 C6 C6 A5:2 A5 A5 F5:2 F5 F5 A5 C6 F6:2"],
  [Am, "A5:2 A5 A5 E5:2 A5:2 C6:3 E6:3 C6:2"],
  ANSWER[5],
  [D, "F#5:3 F#5:3 A5:2 D6 D6 A5:2 F#5 F#5 D5:2"],
  ANSWER[7],
];

// held notes broken into chord arpeggios running up and down
const DROP2: Line[] = [
  THEME[0],
  THEME[1],
  [D, "D6 F#6 A6 F#6 D6 A5 D6 F#6 A6 F#6 D6 A5 F#5 A5 D6 F#6"],
  [F, "F5 A5 C6 F6 C6 A5 F5 A5 C6 F6 A6 F6 C6 A5 C6:2"],
  [Am, "A5 C6 E6 A6 E6 C6 A5 C6 E6 A6 C7 A6 E6 C6 A5:2"],
  [C, "C6 E6 G6 C7 G6 E6 C6 E6 G6 E6 C6 G5 E5 G5 C6:2"],
  [E, "B5 E6 G#6 B6 G#6 E6 B5 E6 G#6 E6 B5 G#5 E5 G#5 B5:2"],
  THEME[7],
  ANSWER[0],
  [C, "E6 G6 E6 C6 E6 G6 E6 C6 B5:2 C6:2 G6:2 C6:2"],
  [D, "A5 D6 F#6 A6 F#6 D6 A5 D6 F#5 A5 D6 F#6 A6:4"],
  ANSWER[3],
  [Am, "A4 C5 E5 A5 C6 E6 A6 E6 C6 A5 E5 C5 E5 A5 C6 E6"],
  [C, "G5 E5 C5 E5 G5 C6 E6 G6 E6 C6 G5 E5 C6:4"],
  [D, "D5 F#5 A5 D6 F#5 A5 D6 F#6 A5 D6 F#6 A6 D6 F#6 A6 D7"],
  ANSWER[7],
];

type Flags = Omit<ChipBar, "c" | "m">;
type Bar = [string[], Note[]];
const section = (lines: Bar[], flags: (i: number) => Flags): ChipBar[] => lines.map(([c, mel], i) => ({ c, m: mel, ...flags(i) }));
const as4 = (lines: Line[]): Bar[] => lines.map(([c, s]) => [c, m(s)]);

// every other note drops an octave, so the line leaps between two registers
const leap = (notes: Note[]): Note[] => {
  let k = 0;
  return notes.map(([note, n]) => (note === "~" || note === "-" ? [note, n] : [k++ % 2 ? transpose(note, -12) : note, n]));
};

// octave leaps over the theme head, then the eighth-note tune an octave up
const DROP3: Bar[] = [
  ...as4(THEME.slice(0, 2)),
  [D, leap(m(THEME[2][1]))],
  [F, leap(m(THEME[3][1]))],
  [Am, leap(m(THEME[4][1]))],
  [C, m("C6:2 E6:2 G6:2 C6:2 E6:2 G6:2 C7:4")],
  [E, leap(m(THEME[6][1]))],
  [F, m(THEME[7][1])],
  [Dm, leap(up(EIGHTHS[0]))],
  [G, leap(up(EIGHTHS[1]))],
  [E, up(EIGHTHS[2])],
  [Am, leap(up(EIGHTHS[3]))],
  [F, leap(up(EIGHTHS[4]))],
  [G, leap(m(EIGHTHS[5]))],
  [E, m(EIGHTHS[6])],
  [E, m(EIGHTHS[7])],
];

const full = { arp: true, bass: true, kick: true, snare: true, hat: 16 as const };

// the intro names the original with its theme over its own chords; the last bar rests on E and its B steps up to the C that opens the intro
const bars: ChipBar[] = [
  ...section(as4(THEME), (i) => ({ arp: true, ...(i >= 4 && { kick: true, hat: 8 as const }) })),
  ...section(as4(BUILD), (i) => ({ arp: true, bass: true, kick: true, hat: 16, roll: i === 3 })),
  ...section(as4(DROP1), (i) => ({ ...full, crash: i === 0 || i === 8 })),
  ...section(as4(zip(SLOW_CHORDS, SLOW)), (i) => ({ arp: true, bass: true, crash: i === 0 })),
  ...section(as4([...zip(EIGHTH_CHORDS, EIGHTHS).slice(0, 4), ...REBUILD]), (i) => ({ arp: true, bass: true, kick: true, hat: i < 4 ? 8 : 16, snare: i >= 4, roll: i === 7 })),
  ...section(as4(DROP2), (i) => ({ ...full, harm: i >= 8, crash: i === 0 || i === 8, roll: i === 15 })),
  ...section(DROP3, (i) => ({ ...full, harm: true, crash: i === 0 })),
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
