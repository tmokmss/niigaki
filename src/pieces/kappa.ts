// Chiptune arrangement of 芥川龍之介の河童 ～ Candid Friend (ZUN, 東方風神録), from the EveryonePiano piano score.
import { transpose } from "../lib/score";
import type { ChipBar, ChipPiece } from "./types";

const Bb = ["Bb3", "D4", "F4"];
const Bb7 = ["Bb3", "D4", "Ab4"];
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
const D7 = ["D4", "F#4", "C5"];

type Note = [string, number];
type Line = [string[], string];
type Row = [string[], Note[]];

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

// orig: a score bar unchanged on the 3+3+2 grid; bar: a reworked 4/4 bar
const orig = ([c, s]: Line): Row => [c, tresillo(s)];
const bar = (c: string[], s: string): Row => [c, m(s)];

// the chorus, bars 42-57 of the score
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

// bars 10-16
const VERSE: Line[] = [
  [Bb, "D5:4 E5:4 F5:4"],
  [Am, "A5:4 F5:4 E5:4"],
  [Gm, "D5:8 C5:4"],
  [F, "A4:8 A4:4"],
  [Bb, "D5:4 E5:4 F5:4"],
  [A, "G5:4 F5:4 E5:4"],
  [Dm, "D5:8 C5:4"],
];

// bars 25-41
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
  [D7, "C5:12"],
];

// the chorus head with its own chords, so the tune names itself
const INTRO: Row[] = THEME.slice(0, 8).map(orig);

// G-A-Bb from the chorus head, repeated every two beats, then every beat, then every half beat
const BUILD: Row[] = [
  bar(Eb, "Eb5:4 G5 A5 Bb5:2 Eb5:4 G5 A5 Bb5:2"),
  bar(F, "D5:4 G5 A5 Bb5:2 D5:2 G5 A5 Bb5:2 C6:2"),
  bar(Ab, "Eb5 Ab5 C6:2 Eb5 Ab5 C6:2 Eb5 Ab5 C6:2 Eb5 Ab5 C6:2"),
  bar(Bb7, "A5 Bb5 A5 Bb5 A5 Bb5 A5 Bb5 D6 Bb5 D6 Bb5 F6:4"),
];

// the chorus with its long notes chopped into repeated eighths, sixteenths and offbeats
const DROP1: Row[] = [
  orig(THEME[0]),
  orig(THEME[1]),
  bar(Gm, "C6:2 C6 C6 -:1 C6:2 Bb5:1 -:1 Bb5:2 Bb5:1 A5:2 Bb5:2"),
  bar(F, "A5:2 A5 A5 F5:2 F5 F5 C5:2 C5 C5 C5:4"),
  bar(Eb, "F5:3 Bb5:3 C6:2 Db6:3 Db6:3 Db6:2"),
  bar(Ab, "C6:2 C6:2 -:1 Ab5:2 Ab5:1 -:2 Eb5:2 Eb5:1 Eb5:1 Eb5:2"),
  bar(Bb, "F5 F5 F5 F5 F5:2 F5:2 F5:3 Bb5:3 Bb5:2"),
  bar(F, "A5:3 Eb6:3 C6:2 A5 A5 C6 C6 Eb6:2 C6:2"),
  orig(THEME[8]),
  orig(THEME[9]),
  bar(Gm, "Bb5 Bb5 G5 G5 D5 D5 Bb5:2 -:1 Bb5:1 A5:2 A5 A5 A5:2"),
  bar(F, "A5 A5 F5:2 C5 C5 F5:2 A5 A5 F5:2 C5:4"),
  bar(Eb, "Bb4:3 Bb4:3 G4:2 A4:2 Bb4:2 Bb4 Bb4 G4:2"),
  bar(F, "A4:3 A4:3 F4:2 A4 A4 C5 C5 F5:4"),
  bar(Gm, "G4:2 G4 G4 G4:2 G4 G4 D5:2 D5 D5 G5:4"),
  bar(G, "G5:3 G5:3 B5:2 D6:2 D6 D6 B5:4"),
];

// the verse as written, an octave lower
const BREAK: Row[] = [...VERSE, [Dm, "D5:8 A4:4"] as Line].map(([c, s]) => [c, tresillo(s).map(([n, l]) => [n === "~" || n === "-" ? n : transpose(n, -12), l])]);

// D-E-F from the verse, first with gaps, then back to back
const REBUILD: Row[] = [
  bar(Bb, "D5:2 E5:2 F5:4 -:8"),
  bar(Am, "A5:2 F5:2 E5:4 -:8"),
  bar(Gm, "D5:2 E5:2 F5:4 D5:2 E5:2 F5:4"),
  bar(F, "A5:2 F5:2 E5:2 F5:2 A5:2 F5:2 C6:4"),
  bar(Bb, "D5 E5 F5 -:1 D5 E5 F5 -:1 D5 E5 F5 -:1 D5 E5 F5 -:1"),
  bar(A, "G5 F5 E5 -:1 G5 F5 E5 -:1 G5 F5 E5 -:1 A5:4"),
  bar(Dm, "D5 E5 F5 A5 D5 E5 F5 A5 D5 E5 F5 A5 D5 E5 F5 A5"),
  bar(D, "F#5 A5 D6 F#5 A5 D6 F#5 A5 D6:8"),
];

// the bridge with its long notes broken into chord arpeggios
const DROP2: Row[] = [
  orig(BRIDGE[0]),
  orig(BRIDGE[1]),
  bar(Bb, "Bb4 D5 F5 Bb5 F5 D5 C5 F5 Bb5 D6 Bb5 F5 D5 F5 Bb5 D6"),
  bar(A, "C#5 E5 A5 C#6 A5 E5 Bb4 C#5 E5 A5 E5 C#5 A4:2 G4:2"),
  bar(Bb, "G4 Bb4 D5 F5 Bb5 F5 C5 D5 F5 Bb5 F5 D5 D5 F5 Bb5 D6"),
  bar(C, "E5 G5 C6 E6 C6 G5 F5 G5 C6 E6 C6 G5 G5 C6 E6 C6"),
  bar(Dm, "F5 A5 D6 A5 F5 D5 F5 A5 D6 A5 F5 D5 -:2 G5 A5"),
  [Dm, flourish(Dm, BRIDGE[7][1])],
  orig(BRIDGE[8]),
  orig(BRIDGE[9]),
  bar(Bb, "F5 Bb5 D6 Bb5 F5 D5 G5 Bb5 D6 Bb5 G5 F5 A5 D6 F6 D6"),
  bar(A, "G5 A5 C#6 A5 G5 E5 F5 A5 C#6 A5 F5 E5 E5:2 F5:2"),
  bar(Bb, "F5:2 G5 A5 F5:2 G5 A5 F5:2 G5 A5 G5:2 A5:2"),
  bar(C, "G5 C6 E6 C6 G5 E5 C6 E6 G6 E6 C6 G5 E6 C6 G5 E6"),
  bar(D, "D6 A5 F#5 A5 D6 A5 F#5 A5 D6 F#6 D6 A5 -:4"),
  bar(D7, "C5 D5 F#5 A5 C6 A5 F#5 D5 C5 D5 F#5 A5 C6:4"),
];

// the chorus again, its notes leaping between octaves; the last bar is the head's dominant
const DROP3: Row[] = [
  orig(THEME[0]),
  orig(THEME[1]),
  bar(Gm, "C6:2 C5:2 C6:2 Bb5:2 Bb4:2 Bb5:2 A4:2 Bb5:2"),
  bar(F, "A5:2 A4:2 A5:2 F5:2 F4:2 F5:2 C6:2 C5:2"),
  bar(Eb, "F5:2 F4:2 F5:2 Bb4 Bb5:2 C5 C6:2 Db6:2 Db5:2"),
  bar(Ab, "C6:2 C5:2 C6:2 Ab5:2 Ab4:2 Ab5:2 Eb5:2 Eb6:2"),
  bar(Bb, "F5:2 F6:2 F5:2 F6:2 F5:2 F6:2 Bb5:2 Bb4:2"),
  bar(F, "A5:2 A4:2 A5:2 Eb6:2 Eb5:2 Eb6:2 C6:2 C5:2"),
  orig(THEME[8]),
  orig(THEME[9]),
  bar(Gm, "Bb5 Bb4 G5 G4 D5 D6 Bb5 Bb4 G5 G4 D5 D6 A5:2 A4:2"),
  bar(F, "A5 A4 F5 F4 C5 C6 F5 F4 A5 A4 F5 F4 C6:2 C5:2"),
  bar(Eb, "Bb4:2 Bb5:2 Bb4:2 G5 G4 A5 A4 Bb5:2 Bb4:2 G5:2"),
  bar(F, "A4:2 A5:2 A4:2 F5:2 F4:2 F5:2 A5:2 C6:2"),
  bar(Gm, "G4:2 G5:2 G4:2 G5:2 D5:2 D6:2 Bb5:2 G5:2"),
  bar(Bb7, "F5:2 F6:2 D6:2 Bb5:2 Ab5:2 F5:2 D5:4"),
];

type Flags = Omit<ChipBar, "c" | "m">;
const section = (rows: Row[], flags: (i: number) => Flags): ChipBar[] => rows.map(([c, m], i) => ({ c, m, ...flags(i) }));
const full = { arp: true, bass: true, kick: true, snare: true, hat: 16 as const };

// the last bar's Bb7 and its D resolve into the Eb and Eb that open the intro
const bars: ChipBar[] = [
  ...section(INTRO, (i) => ({ arp: true, kick: i >= 4, hat: i >= 4 ? 8 : undefined })),
  ...section(BUILD, (i) => ({ arp: true, bass: true, kick: true, hat: 16, roll: i === 3 })),
  ...section(DROP1, (i) => ({ ...full, crash: i === 0 || i === 8 })),
  ...section(BREAK, () => ({ arp: true })),
  ...section(REBUILD, (i) => ({ arp: true, bass: true, kick: true, snare: i >= 4, hat: i >= 4 ? 16 : 8, roll: i === 7 })),
  ...section(DROP2, (i) => ({ ...full, harm: i >= 8, crash: i === 0 || i === 8 })),
  ...section(DROP3, (i) => ({ ...full, harm: true, crash: i === 0 || i === 8 })),
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
