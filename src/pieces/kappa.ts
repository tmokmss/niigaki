// Chiptune arrangement of 芥川龍之介の河童 ～ Candid Friend (ZUN, 東方風神録), from the EveryonePiano piano score.
import { transpose } from "../lib/score";
import type { ChipBar, ChipPiece } from "./types";

const Bb = ["Bb3", "D4", "F4"];
const Gm = ["G3", "Bb3", "D4"];
const Eb = ["Eb4", "G4", "Bb4"];
const F = ["F4", "A4", "C5"];
const Ab = ["Ab3", "C4", "Eb4"];
const G = ["G3", "B3", "D4"];
const Dm = ["D4", "F4", "A4"];
const Am = ["A3", "C4", "E4"];
const A = ["A3", "C#4", "E4"];
const C = ["C4", "E4", "G4"];
const D = ["D4", "F#4", "A4"];

type Note = [string, number];
type Line = [string[], string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): Note[] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// 3/4 bar -> 4/4 bar: the three beats become 3+3+2 (dotted quarter, dotted quarter, quarter)
const stretch = (x: number) => (x <= 4 ? x * 1.5 : x <= 8 ? 6 + (x - 4) * 1.5 : 12 + (x - 8));
const tresillo = (s: string): Note[] => {
  let x = 0;
  return m(s).map(([note, n]) => {
    const from = stretch(x);
    x += n;
    return [note, stretch(x) - from];
  });
};

// a twelve-sixteenth run plus a rising chord flourish fills a 4/4 bar
const flourish = (c: string[], s: string): Note[] => [
  ...m(s),
  [transpose(c[0], 12), 1],
  [transpose(c[1], 12), 1],
  [transpose(c[2], 12), 1],
  [transpose(c[0], 24), 1],
];

const THEME: Line[] = [
  [Eb, "Eb5:4 G5:2 A5:2 Bb5:4"],
  [F, "D5:4 G5:2 A5:2 Bb5:4"],
  [Gm, "C6:4 Bb5:4 A5:2 Bb5:2"],
  [F, "A5:4 F5:4 C5:4"],
  [Eb, "F5:4 Bb5:2 C6:2 Db6:4"],
  [Ab, "C6:4 Ab5:4 Eb5:4"],
  [Bb, "F5:8 Bb5:4"],
  [F, "A5:4 Eb6:4 C6:4"],
  [Eb, "Bb5:4 G5:2 A5:2 Bb5:4"],
  [F, "C6:4 A5:2 Bb5:2 C6:2 D6:2"],
  [Gm, "Bb5:2 G5:2 D5:2 Bb5:2 A5:4"],
  [F, "A5:2 F5:2 C5:2 F5:2 C5:4"],
  [Eb, "Bb4:4 G4:2 A4:2 Bb4:4"],
  [F, "A4:4 F4:4 A4:4"],
  [Gm, "G4:12"],
];

const VERSE: Line[] = [
  [Bb, "D5:4 E5:4 F5:4"],
  [Am, "A5:4 F5:4 E5:4"],
  [Gm, "D5:8 C5:4"],
  [F, "A4:8 A4:4"],
  [Bb, "D5:4 E5:4 F5:4"],
  [A, "G5:4 F5:4 E5:4"],
  [Dm, "D5:8 C5:4"],
];

const VERSE_LOW: Line[] = [
  [Bb, "D4:4 E4:4 F4:4"],
  [Am, "A4:4 F4:4 E4:4"],
  [Gm, "D4:8 C4:4"],
  [F, "A3:8 A3:4"],
  [Bb, "D4:4 E4:4 F4:4"],
  [A, "G4:4 F4:4 E4:4"],
  [Dm, "D4:8 C4:4"],
  [Dm, "D4:12"],
];

const BRIDGE: Line[] = [
  [Gm, "Bb4:8 C5:4"],
  [A, "A4:8 A4:4"],
  [Bb, "Bb4:4 C5:4 D5:4"],
  [A, "C#5:4 Bb4:4 A4:2 G4:2"],
  [Bb, "~:4 C5:4 D5:4"],
  [C, "E5:4 F5:4 G5:4"],
  [Dm, "F5:8 -:2 G5 A5"],
  [Dm, "G5 A5 G5 F5 E5 D5 C5 A4 A4:4"],
  [Bb, "F5:8 G5:4"],
  [A, "E5:8 E5:4"],
  [Bb, "F5:4 G5:4 A5:4"],
  [A, "G5:4 F5:4 E5:2 F5:2"],
  [Bb, "~:4 G5:4 A5:4"],
  [C, "G5:4 C6:4 E6:4"],
  [D, "D6:8 -:4"],
  [D, "C5:12"],
];

// the theme head chopped into a call over I-vi-IV-V, each call landing on a chord tone
const INTRO: Line[] = [
  [Bb, "D5:3 D5:3 G5:3 A5:3 Bb5:4"],
  [Gm, "-:8 D6:2 C6:2 Bb5:4"],
  [Eb, "Eb5:3 Eb5:3 G5:3 A5:3 Bb5:4"],
  [F, "-:8 C6:2 A5:2 F5:4"],
  [Bb, "D5:3 D5:3 G5:3 A5:3 Bb5:4"],
  [Gm, "-:8 G5:2 Bb5:2 D6:4"],
  [Eb, "Eb6:4 D6:4 C6:4 Bb5:4"],
  [F, "A5:4 C6:4 F5:4 C5:4"],
];

const BUILD: Line[] = [
  [Bb, "D5:2 F5:2 Bb5:2 D6:2 D5:2 F5:2 Bb5:2 D6:2"],
  [Gm, "D5:2 G5:2 Bb5:2 D6:2 D5:2 G5:2 Bb5:2 D6:2"],
  [Eb, "Eb5:2 G5:2 Bb5:2 Eb6:2 G6:2 Eb6:2 Bb5:2 G5:2"],
  [F, "A5:4 C6:4 F6:8"],
];

type Flags = Omit<ChipBar, "c" | "m">;
const section = (lines: Line[], toNotes: (c: string[], s: string, i: number) => Note[], flags: (i: number) => Flags): ChipBar[] =>
  lines.map(([c, s], i) => ({ c, m: toNotes(c, s, i), ...flags(i) }));

const as4 = (_: string[], s: string) => m(s);
const swung = (_: string[], s: string) => tresillo(s);
const full = { arp: true, bass: true, kick: true, snare: true, hat: 16 as const };

// the first drop ends on the score's G major; the last one stops on F so the loop resolves into the Bb intro
const bars: ChipBar[] = [
  ...section(INTRO, as4, (i) => ({ arp: true, bass: true, kick: i >= 4, hat: 8 })),
  ...section(BUILD, as4, (i) => ({ arp: true, bass: true, kick: true, hat: 16, roll: i === 3 })),
  ...section([...THEME, [G, "D5:12"]], swung, (i) => ({ ...full, crash: i === 0 || i === 8 })),
  ...section(VERSE_LOW, swung, (i) => ({ arp: true, bass: true, kick: true, hat: 8, crash: i === 0 })),
  ...section([...VERSE, [Dm, "D5:8 A4:4"]], swung, (i) => ({ ...full, roll: i === 7 })),
  ...section(BRIDGE, (c, s, i) => (i === 7 ? flourish(c, s) : tresillo(s)), (i) => ({ ...full, harm: i >= 8, crash: i === 0 || i === 8, roll: i === 15 })),
  ...section([...THEME, [F, "A4:4 C5:4 F5:4"]], swung, (i) => ({ ...full, harm: true, crash: i === 0 || i === 8 })),
];

export const kappa: ChipPiece = {
  kind: "chip",
  slug: "kappa",
  title: "芥川龍之介の河童",
  description: "chiptune arrange / B♭ major / 170 BPM",
  bpm: 170,
  groove: "four",
  bassline: "octave",
  visual: "danmaku",
  bars,
};
