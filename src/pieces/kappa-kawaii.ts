// Kawaii future bass arrangement of 芥川龍之介の河童 ～ Candid Friend (ZUN, 東方風神録), from the EveryonePiano piano score, sharing the chiptune version's transcription.
import type { FutureBar, FuturePiece } from "./types";
import { THEME, VERSE, tresillo } from "./kappa";

const Ebmaj9 = ["Eb4", "G4", "Bb4", "D5", "F5"];
const Eb9 = ["Eb4", "G4", "Bb4", "Db5", "F5"];
const F69 = ["F4", "A4", "C5", "D5", "G5"];
const Fmaj9 = ["F4", "A4", "C5", "E5", "G5"];
const F9 = ["F4", "A4", "C5", "Eb5", "G5"];
const Gm9 = ["G3", "Bb3", "D4", "F4", "A4"];
const Abmaj9 = ["Ab3", "C4", "Eb4", "G4", "Bb4"];
const Bbmaj9 = ["Bb3", "D4", "F4", "A4", "C5"];
const Bb9 = ["Bb3", "D4", "F4", "Ab4", "C5"];
const Am7 = ["A3", "C4", "E4", "G4"];
const A7 = ["A3", "C#4", "E4", "G4"];
const Dm9 = ["D4", "F4", "A4", "C5", "E5"];

type Note = [string, number];
type Row = [string[], Note[]];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): Note[] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the chorus's chords, one per score bar, with their 7ths and 9ths
const THEME_CHORDS = [Ebmaj9, F69, Gm9, F69, Eb9, Abmaj9, Bbmaj9, F9, Ebmaj9, F69, Gm9, F69, Ebmaj9, F69, Gm9];
// orig: a score bar on the 3+3+2 grid; bar: a reworked 4/4 bar
const orig = (i: number): Row => [THEME_CHORDS[i], tresillo(THEME[i][1])];
const bar = (c: string[], s: string): Row => [c, m(s)];

// the chorus head with its own chords, so the tune names itself
const INTRO: Row[] = [0, 1, 2, 3, 4, 5, 6, 7].map(orig);

// G-A-Bb from the chorus head, every two beats, then every beat, then every half beat
const BUILD: Row[] = [
  bar(Ebmaj9, "Eb5:4 G5 A5 Bb5:2 -:8"),
  bar(F69, "D5:4 G5 A5 Bb5:2 D5:4 G5 A5 Bb5:2"),
  bar(Gm9, "C6:2 Bb5 A5 Bb5:2 -:2 C6:2 Bb5 A5 Bb5:2 -:2"),
  bar(Abmaj9, "Eb5 Ab5 C6:2 Eb5 Ab5 C6:2 Eb5 Ab5 C6:2 Eb5 Ab5 C6:2"),
  bar(Ebmaj9, "G5 A5 Bb5:2 G5 A5 Bb5:2 G5 A5 Bb5:2 G5 A5 Bb5:2"),
  bar(F69, "A5 Bb5 C6 A5 Bb5 C6 A5 Bb5 C6 A5 Bb5 C6 D6:4"),
  bar(Gm9, "Bb5 Bb5 Bb5 Bb5 C6 C6 C6 C6 D6 D6 D6 D6 F6 F6 F6 F6"),
  bar(Bb9, "F6:2 D6:2 Bb5:2 Ab5:2 F5:4 -:4"),
];

// the chorus with its long notes restruck as bouncing sixteenths and offbeats
const DROP: Row[] = [
  orig(0),
  orig(1),
  bar(Gm9, "C6:2 C6 C6 -:2 Bb5 Bb5 -:2 Bb5:2 A5:2 Bb5:2"),
  bar(F69, "A5 A5 -:1 A5 F5:2 F5 F5 C5:2 C6:2 A5:2 F5:2"),
  bar(Eb9, "F5:3 Bb5:3 C6:2 Db6 Db6 -:1 Db6 Db6:2 C6:2"),
  bar(Abmaj9, "C6:2 C6 -:1 Ab5:2 Ab5 -:1 Eb5:2 Eb5 Eb5 Ab5:2 C6:2"),
  bar(Bbmaj9, "F5 F5 F5:2 F5 F5 Bb5:2 F5 F5 F5:2 Bb5:2 D6:2"),
  bar(F9, "A5:3 Eb6:3 C6:2 A5 C6 Eb6 C6 A5:2 F5:2"),
  orig(8),
  orig(9),
  bar(Gm9, "Bb5 Bb5 G5 G5 D5 D5 Bb5:2 -:1 Bb5 A5:2 A5 A5 A5:2"),
  bar(F69, "A5 A5 F5:2 C5 C5 F5:2 A5 A5 F5:2 C6:4"),
  bar(Ebmaj9, "Bb5:3 Bb5:3 G5:2 A5:2 Bb5:2 Bb5 Bb5 G5:2"),
  bar(F69, "A5:3 A5:3 F5:2 A5 A5 C6 C6 F6:4"),
  bar(Gm9, "G5:2 G5 G5 G5:2 G5 G5 D6:2 D6 D6 G6:4"),
  bar(F9, "A5:3 C6:3 Eb6:2 C6:2 A5:2 F5:4"),
];

// the B-flat verse as written
const VERSE_CHORDS = [Bbmaj9, Am7, Gm9, Fmaj9, Bbmaj9, A7, Dm9];
const BREAK: Row[] = [
  ...VERSE.map(([, s], i): Row => [VERSE_CHORDS[i], tresillo(s)]),
  [Dm9, tresillo("D5:8 A4:4")],
];

// D-E-F from the verse, first with gaps, then back to back, onto the B-flat that leads into E-flat
const REBUILD: Row[] = [
  bar(Bbmaj9, "D5:2 E5:2 F5:4 -:8"),
  bar(Am7, "A5:2 F5:2 E5:4 -:8"),
  bar(Gm9, "D5:2 E5:2 F5:4 D5:2 E5:2 F5:4"),
  bar(Fmaj9, "A5:2 F5:2 E5:2 F5:2 A5:2 F5:2 C6:4"),
  bar(Bbmaj9, "D5 E5 F5 -:1 D5 E5 F5 -:1 D5 E5 F5 -:1 D5 E5 F5 -:1"),
  bar(A7, "G5 F5 E5 -:1 G5 F5 E5 -:1 G5 F5 E5 -:1 A5:4"),
  bar(Dm9, "D5 E5 F5 A5 D5 E5 F5 A5 D5 E5 F5 A5 D5 E5 F5 A5"),
  bar(Bb9, "F5 Bb5 D6 F5 Bb5 D6 F5 Bb5 D6:4 -:4"),
];

// the chorus again, its notes leaping between octaves; the last bar's B-flat 9 resolves into the intro's E-flat
const DROP2: Row[] = [
  orig(0),
  orig(1),
  bar(Gm9, "C6:2 C5:2 C6:2 Bb5:2 Bb4:2 Bb5:2 A5:2 Bb5:2"),
  bar(F69, "A5:2 A4:2 A5:2 F5:2 F4:2 F5:2 C6:2 C5:2"),
  bar(Eb9, "F5:2 F4:2 F5:2 Bb4 Bb5:2 C5 C6:2 Db6:2 Db5:2"),
  bar(Abmaj9, "C6:2 C5:2 C6:2 Ab5:2 Ab4:2 Ab5:2 Eb5:2 Eb6:2"),
  bar(Bbmaj9, "F5:2 F6:2 F5:2 F6:2 F5:2 F6:2 Bb5:2 Bb4:2"),
  bar(F9, "A5:2 A4:2 A5:2 Eb6:2 Eb5:2 Eb6:2 C6:2 C5:2"),
  orig(8),
  orig(9),
  bar(Gm9, "Bb5 Bb4 G5 G4 D5 D6 Bb5 Bb4 G5 G4 D5 D6 A5:2 A4:2"),
  bar(F69, "A5 A4 F5 F4 C5 C6 F5 F4 A5 A4 F5 F4 C6:2 C5:2"),
  bar(Ebmaj9, "Bb5:2 Bb4:2 Bb5:2 G5 G4 A5 A4 Bb5:2 Bb4:2 G5:2"),
  bar(F69, "A5:2 A4:2 A5:2 F5:2 F4:2 F5:2 A5:2 C6:2"),
  bar(Gm9, "G5:2 G4:2 G5:2 G6:2 D6:2 D5:2 Bb5:2 G5:2"),
  bar(Bb9, "F5:2 F6:2 D6:2 Bb5:2 Ab5:2 F5:2 D5:4"),
];

type Flags = Omit<FutureBar, "c" | "c2" | "m">;
const section = (rows: Row[], flags: (i: number) => Flags): FutureBar[] => rows.map(([c, m], i) => ({ c, m, ...flags(i) }));

const beat = { kick: true, clap: true, hat: true };
const rise = (i: number) => ({ riser: true, roll: ([4, 8, 16, 32] as const)[i - 4], open: 0.5 + (i - 3) * 0.12 });
const build = (open: number) => (i: number): Flags =>
  i < 4
    ? { ...beat, chord: "pad", open: open + i * 0.05, sparkle: true }
    : { chord: i < 7 ? "stab" : "pad", ...rise(i), chop: i < 7, gap: i === 7 };
// stabs, with the wah on every fourth bar; chops and sparkles take turns
const drop = (i: number): Flags => ({
  ...beat,
  bass: true,
  open: 1,
  chord: i % 4 === 3 ? "wobble" : "stab",
  crash: i % 8 === 0,
  chop: i % 2 === 1,
  sparkle: i % 2 === 0,
});

const bars: FutureBar[] = [
  ...section(INTRO, (i) => ({ chord: "pad", open: 0.15 + i * 0.03, kick: i >= 4, hat: i >= 4, sparkle: i >= 4 })),
  ...section(BUILD, build(0.3)),
  ...section(DROP, drop),
  ...section(BREAK, (i) => ({ chord: "pad", open: 0.35, sparkle: i >= 4 })),
  ...section(REBUILD, build(0.35)),
  ...section(DROP2, (i) => ({ ...drop(i), chord: i % 2 === 1 ? "wobble" : "stab", chop: i % 2 === 0, sparkle: i % 2 === 1 })),
];

export const kappaKawaii: FuturePiece = {
  kind: "future",
  slug: "kappa-kawaii",
  title: "芥川龍之介の河童",
  description: "kawaii future bass arrange / 160 BPM",
  bpm: 160,
  style: "kawaii",
  visual: "danmaku",
  hues: [335, 178, 150, 290],
  bars,
};
