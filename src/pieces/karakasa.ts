// Chiptune arrangement of 万年置き傘にご注意を (ZUN, 東方星蓮船), from 東方ピアノEasyモード's piano score (easypianoscore.jp).
import type { ChipBar, ChipPiece } from "./types";

const Gsm = ["G#3", "B3", "D#4"];
const E = ["E4", "G#4", "B4"];
const Fs = ["F#4", "A#4", "C#5"];
const Ds = ["D#4", "G4", "A#4"];
const Cs = ["C#4", "F4", "G#4"];
const Fsm = ["F#4", "A4", "C#5"];
const A = ["A3", "C#4", "E4"];
const D = ["D4", "F#4", "A4"];

type Line = [string[], string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the opening fanfare, on its own chords
const INTRO: Line[] = [
  [Gsm, "G#5:2 G#5:2 G#5:2 G#5:2 G#5:2 G#5:2 F#5:4"],
  [Gsm, "G#5:2 G#5:2 G#5:2 B5:2 A#5:2 G#5:2 F#5:4"],
  [Gsm, "D#5:4 F#5:4 C#5:4 A#4:4"],
  [Gsm, "G#4:8 B4 C#5 D#5 F#5 G#5:4"],
  [E, "G#4:6 G#4:2 G#4:6 G#4:2"],
  [E, "-:2 G#4:2 B4:2 D#5:2 C#5:2 A#4:2 F#4:4"],
  [Fs, "A#4:6 A#4:2 A#4:6 A#4:2"],
  [Ds, "A#4:8 A#4:8"],
];

// the fanfare's repeated note, tightening from quarters to sixteenths
const BUILD: Line[] = [
  [Gsm, "G#5:4 G#5:4 G#5:4 F#5:4"],
  [E, "G#5:2 G#5:2 G#5:2 G#5:2 B5:2 G#5:2 E5:4"],
  [Fs, "F#5 F#5 F#5 F#5 A#5 A#5 A#5 A#5 C#6 C#6 C#6 C#6 A#5 A#5 F#5 F#5"],
  [Ds, "D#6 D#6 D#6 D#6 A#5 A#5 A#5 A#5 G5 G5 G5 G5 A#5:4"],
];

// the chorus, chopped into repeated notes and syncopations
const DROP: Line[] = [
  [E, "G#5:12 F#5:2 G#5:2"],
  [Fs, "D#6:6 A#5:4 B5:2 A#5:2 F#5:2"],
  [Gsm, "D#5 F#5 G#5 G#5 G#5:2 G#5 G#5 B4:2 B4 C#5:2 C#5 G#4 F#4"],
  [Gsm, "B4:2 B4:2 -:1 B4:1 B4:2 B4 B4 B4:2 B4:2 C#5:2"],
  [E, "D#5:3 D#5:3 G#4:2 G#4:3 G#4:1 D#5:2 D#5:2"],
  [Fs, "C#5:4 B4:4 A#4:2 B4:2 F#5:2 G#5:2"],
  [Gsm, "~:2 C#5:2 D#5:2 D#5:2 D#5 D#5 D#5:2 D#5 D#5 D#5 D#5"],
  [Gsm, "-:2 D#5:2 -:2 D#5:2 G#4:2 B4:2 D#5:2 F#5:2"],
  [E, "G#5:2 G#5:2 G#5:1 G#5:3 G#5:2 G#5:2 F#5:2 G#5:2"],
  [Fs, "D#6:3 D#6:3 A#5:2 A#5:2 B5:2 A#5:2 F#5:2"],
  [Gsm, "D#5 F#5 G#5:6 B4:3 C#5:3 G#4 F#4"],
  [Gsm, "B4 B4 B4:2 B4 B4 B4:2 B4:2 D#5:2 B4:2 C#5:2"],
  [E, "D#5:6 G#4:6 D#5:4"],
  [Fs, "C#5:4 B4:4 A#4:2 B4:2 -:2 A#4:2"],
  [Gsm, "~:2 G#4:2 G#4:2 G#4:2 B4:2 G#4:2 D#5:2 G#4:2"],
  [Gsm, "G#4:2 G#4:2 G#4:2 G#4:2 D#5:2 F#5:2 G#5:2 A#5:2"],
];

// the verse, close to the score
const BREAK: Line[] = [
  [Cs, "G#4:6 G#4:2 G#4:6 G#4:2"],
  [Fsm, "A4:6 A4:2 A4:6 A4:2"],
  [Cs, "G#4:6 G#4:2 G#4:4 B4:4"],
  [Fsm, "A4:8 G#4:6 A4 B4"],
  [A, "C#5:8 B4:4 E5:4"],
  [D, "A4:8 G#4:3 A4:3 B4:2"],
  [A, "C#5:8 B4:4 E5:4"],
  [E, "F#5:8 G#5:8"],
];

const REBUILD: Line[] = [
  ...INTRO.slice(0, 4),
  [E, "F#5:2 G#5:6 F#5:2 G#5:6"],
  [Fs, "F#5:2 G#5:2 D#6:4 F#5:2 G#5:2 D#6:4"],
  [Ds, "A#5:2 G5:2 A#5:2 D#6:2 A#5 G5 A#5 D#6 A#5 G5 A#5 D#6"],
  [Ds, "D#6 D#6 D#6 D#6 D#6 D#6 D#6 D#6 A#5:2 G5:2 D#5:4"],
];

// the chorus, its long notes broken into chord arpeggios
const DROP2: Line[] = [
  [E, "G#5:12 F#5:2 G#5:2"],
  [Fs, "D#6:6 A#5:4 B5:2 A#5:2 F#5:2"],
  [Gsm, "D#5 F#5 G#5 D#5 B4 D#5 G#5 B5 B4 D#5 G#5 C#5 G#4 C#5 G#4 F#4"],
  [Gsm, "B4 D#5 G#5 D#5 B4 D#5 G#5 D#5 B4 G#4 D#4 G#4 B4 D#5 C#5:2"],
  [E, "D#5 B4 G#4 E4 G#4 B4 G#4 E4 G#4 B4 E5 B4 D#5:4"],
  [Fs, "C#5:4 B4:4 A#4:2 B4:2 F#5:2 G#5:2"],
  [Gsm, "~:2 C#5:2 D#5 B4 G#4 B4 D#5 G#5 D#5 B4 D#5 G#5 B5 G#5"],
  [Gsm, "G#5 D#5 B4 G#4 D#4 G#4 B4 D#5 G#4 B4 D#5 G#5 D#5:2 F#5:2"],
  [E, "G#5:2 E5 B4 G#4 B4 E5 G#5 B5 G#5 E5 B4 F#5:2 G#5:2"],
  [Fs, "D#6:2 A#5 F#5 C#5 F#5 A#5 C#6 A#5:2 B5:2 A#5:2 F#5:2"],
  [Gsm, "D#5 F#5 G#5:6 B4:3 C#5:3 G#4 F#4"],
  [Gsm, "B4 D#5 G#5 B5 G#5 D#5 B4 D#5 G#5 D#5 B4 G#4 B4:2 C#5:2"],
  [E, "D#5:6 G#4:6 D#5:4"],
  [Fs, "C#5:4 B4:4 A#4:2 B4:2 -:2 A#4:2"],
  [Gsm, "~:2 G#4:2 B4 D#5 G#5 D#5 B4 D#5 G#5 B5 G#5 D#5 B4 D#5"],
  [Gsm, "G#5 D#5 B4 G#4 B4 D#5 G#5 D#5 D#5:2 F#5:2 G#5:2 A#5:2"],
];

// the harmonised last chorus, leaping between octaves, ending on V
const DROP3: Line[] = [
  [E, "B5:12 A#5:2 B5:2"],
  [Fs, "D#6:6 A#5:4 B5:2 A#5:2 F#5:2"],
  [Gsm, "D#5 F#5 G#5:2 G#4:2 G#5:2 B4:2 B5 C#5:2 C#6 G#4 F#4"],
  [Gsm, "B4:2 B5:2 B4:2 B5:2 B4:2 B5:2 B4:2 C#5:2"],
  [E, "D#5:2 D#6:2 D#5:2 B4:2 B5:2 B4:2 D#5:2 D#6:2"],
  [Fs, "C#5:2 C#6:2 B4:2 B5:2 A#4:2 B4:2 F#5:2 G#5:2"],
  [Gsm, "~:2 C#5:2 D#5:2 D#6:2 D#5:2 G#5:2 G#4:2 G#5:2"],
  [Gsm, "F#5:6 B5:6 A#5:2 F#5:2"],
  [E, "B5:12 A#5:2 B5:2"],
  [Fs, "D#6:2 D#5:2 D#6:2 A#5:2 A#4:2 B5:2 A#5:2 F#5:2"],
  [Gsm, "D#5 F#5 G#5:6 B4:3 C#5:3 G#4 F#4"],
  [Gsm, "B4:2 B5:2 B4:2 B5:2 B4 B5 B4 B5 B4:2 C#5:2"],
  [E, "D#5:6 B4:6 D#5:4"],
  [Fs, "C#5:2 C#6:2 F#5:2 F#4:2 A#5:2 A#4:2 -:2 A#5:2"],
  [Gsm, "~:2 G#5:2 G#4:2 G#5:2 D#5:2 D#6:2 B4:2 B5:2"],
  [Ds, "D#5:2 D#6:2 A#4:2 A#5:2 G4:2 G5:2 A#5:4"],
];

type Flags = Omit<ChipBar, "c" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): ChipBar[] =>
  lines.map(([c, s], i) => ({ c, m: m(s), ...flags(i) }));

const full = { arp: true, bass: true, kick: true, snare: true, hat: 16 as const };

const bars: ChipBar[] = [
  ...section(INTRO, (i) => ({ arp: true, kick: i >= 4, hat: i >= 4 ? 8 : undefined })),
  ...section(BUILD, (i) => ({ arp: true, bass: true, kick: true, hat: 16, roll: i === 3 })),
  ...section(DROP, (i) => ({ ...full, crash: i === 0 || i === 8 })),
  ...section(BREAK, () => ({ arp: true })),
  ...section(REBUILD, (i) => ({ arp: true, bass: true, kick: true, hat: i >= 4 ? 16 : 8, roll: i === 7 })),
  ...section(DROP2, (i) => ({ ...full, harm: i >= 8, crash: i === 0 || i === 8 })),
  ...section(DROP3, (i) => ({ ...full, harm: true, crash: i === 0 || i === 8 })),
];

export const karakasa: ChipPiece = {
  kind: "chip",
  slug: "karakasa",
  title: "万年置き傘にご注意を",
  description: "chiptune arrange / G# minor / 160 BPM",
  bpm: 160,
  groove: "four",
  bassline: "octave",
  timbre: "pluck",
  visual: "danmaku",
  hues: [280, 310, 220, 330],
  bars,
};
