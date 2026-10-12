// Future bass arrangement of 神々が恋した幻想郷 (ZUN, 東方風神録), from ALFetite's piano transcription (alfetite.com/sheet-music/touhou/10-3-1).
import type { FutureBar, FuturePiece } from "./types";

const Bbmaj9 = ["Bb3", "D4", "F4", "A4", "C5"];
const Bbmaj7 = ["Bb3", "D4", "F4", "A4"];
const Fmaj9 = ["F4", "A4", "C5", "E5", "G5"];
const Gm9 = ["G3", "Bb3", "D4", "F4", "A4"];
const Am9 = ["A3", "C4", "E4", "G4", "B4"];
const Cadd9 = ["C4", "E4", "G4", "D5"];
const D7sus4 = ["D4", "G4", "A4", "C5"];
const D7 = ["D4", "F#4", "A4", "C5"];
const Dadd9 = ["D4", "F#4", "A4", "E5"];
const Dm9 = ["D4", "F4", "A4", "C5", "E5"];
const Ebmaj9 = ["Eb4", "G4", "Bb4", "D5", "F5"];
const Fadd9 = ["F4", "A4", "C5", "G5"];
const F7 = ["F4", "A4", "C5", "Eb5"];

// [chord, chord for beats 3-4 or null, melody]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the chorus head, on the score's own chords
const INTRO: Line[] = [
  [Bbmaj9, null, "D6:6 C6 D6 C6:2 A5:2 G5:2 C6:2"],
  [Fmaj9, null, "A5:12 A5:2 C6:2"],
  [Gm9, Am9, "D6:6 C6 D6 F6:2 E6:2 D6:2 C6:2"],
  [D7sus4, D7, "D6:8 -:2 C6 D6 C6:2 A5:2"],
  [Bbmaj7, Cadd9, "G5:8 E5:2 C6 D6 C6:2 G5:2"],
  [Dm9, null, "F5:12 D5:2 E5:2"],
  [Bbmaj7, Cadd9, "F5:6 G5:2 E5:6 D5:2"],
  [Dadd9, null, "D5:4 F#4 A4 D5 F#5 A5 F#5 D5 F#5 D5:2 A4:2"],
];

// the chorus's C6 D6 C6 A5, repeated closer and closer
const BUILD: Line[] = [
  [Bbmaj9, null, "C6 D6 C6:2 A5:4 -:8"],
  [Fmaj9, null, "C6 D6 C6:2 A5:4 C6 D6 C6:2 A5:4"],
  [Gm9, Am9, "C6 D6 C6:2 A5:2 -:2 C6 D6 C6:2 A5:2 -:2"],
  [D7sus4, D7, "C6 D6 C6 A5 C6 D6 C6 A5 C6 D6 C6 A5 C6 D6 C6 A5"],
  [Bbmaj9, null, "D6:4 D6:4 D6:4 D6:4"],
  [Cadd9, null, "D6:2 D6:2 D6:2 D6:2 E6:2 E6:2 E6:2 E6:2"],
  [Dm9, null, "D6 D6 D6 D6 E6 E6 E6 E6 F6 F6 F6 F6 G6 G6 G6 G6"],
  [Cadd9, null, "E6:2 E6:2 E6 E6 E6 E6 G6:4 -:4"],
];

// the chorus twice, its long notes restruck as syncopations; the second time takes the score's second ending
const DROP: Line[] = [
  [Bbmaj9, null, "D6:3 D6:3 C6 D6 C6:2 A5:2 G5:2 C6:2"],
  [Fmaj9, null, "A5:3 A5:3 A5:2 C6:2 A5:2 -:2 C6:2"],
  [Bbmaj7, Cadd9, "D6:2 C6 D6 D6:2 C6 D6 F6:2 E6:2 D6:2 C6:2"],
  [D7sus4, D7, "D6 D6 -:1 D6 -:2 C6 D6 C6:2 A5:2 C6 D6 C6:2"],
  [Bbmaj7, Cadd9, "G5:3 G5:3 E5:2 C6 D6 C6:2 G5:2 E5:2"],
  [Dm9, null, "F5:3 F5:3 D5:2 F5 F5 D5:2 E5:2 F5:2"],
  [Bbmaj9, null, "F5:2 F5 G5 -:2 G5:2 A5:2 A5 Bb5 -:2 Bb5:2"],
  [Am9, null, "A5 G5 A5 C6 A5:2 A5 A5 -:2 A5:2 A5:2 C6:2"],
  [Bbmaj9, null, "D6:2 C6 D6 D6:2 C6 D6 D6:2 C6 D6 C6:2 A5:2"],
  [Fmaj9, null, "A5:2 C6:2 A5:2 C6:2 A5:2 C6:2 F6:4"],
  [Bbmaj7, Cadd9, "D6:3 C6:3 D6:2 F6:3 E6:3 D6 C6"],
  [D7sus4, D7, "D6:2 D6:2 C6 D6 C6:2 D6:2 D6:2 C6 D6 A5:2"],
  [Bbmaj7, Cadd9, "G5 G5 G5:2 F5:2 G5:2 C6 D6 C6:2 D6:2 E6:2"],
  [Dm9, null, "F5:3 F5:3 D5:2 D5:2 D5:2 E5:2 F5:2"],
  [Bbmaj7, Cadd9, "F5:3 F5:3 G5:2 E5:3 E5:3 D5:2"],
  [D7, null, "D6:4 C6:2 A5:2 F#5:2 D5:2 -:4"],
];

// the B-flat verse, close to the score
const BREAK: Line[] = [
  [Ebmaj9, null, "G5:16"],
  [Ebmaj9, Fadd9, "G5:8 F5:8"],
  [Gm9, null, "G5:12 Bb5:4"],
  [Gm9, Fadd9, "A5:6 G5:6 F5:4"],
  [Ebmaj9, null, "G5:8 C6:8"],
  [Fadd9, null, "Bb5:4 A5:4 G5:4 A5:4"],
  [Gm9, null, "Bb5:6 C6:6 D6:4"],
  [Gm9, Fadd9, "D6:4 C6:4 Bb5:4 A5:4"],
];

// the verse's second half, then its rising figure tightened onto F7
const REBUILD: Line[] = [
  ...BREAK.slice(0, 4),
  [Ebmaj9, null, "G5:4 D5:2 F5:2 ~:2 G5:2 D5:4"],
  [Fadd9, null, "C5:8 D5:4 F5:4"],
  [Gm9, null, "G5 A5 Bb5:2 G5 A5 Bb5:2 G5 A5 Bb5:2 D6:4"],
  [F7, null, "C6 C6 C6 C6 C6 C6 C6 C6 A5:2 C6:2 -:4"],
];

// the chorus twice with octave leaps and repeated cells, back to Am so the loop lands on the intro's B-flat as the score repeats
const DROP2: Line[] = [
  [Bbmaj9, null, "D6:3 D5:3 C6 D6 C6:2 A5:2 G5:2 C6:2"],
  [Fmaj9, null, "A5:3 A4:3 A5:2 C6:2 C5:2 A5:2 C6:2"],
  [Bbmaj7, Cadd9, "D6:2 D5:2 C6 D6 F6:2 E6:2 E5:2 D6:2 C6:2"],
  [D7sus4, D7, "D6:2 D5:2 D6:2 -:2 C6 D6 C6:2 A5:2 A4:2"],
  [Bbmaj7, Cadd9, "G5:3 G4:3 G5:2 E5:2 C6 D6 C6:2 C5:2"],
  [Dm9, null, "F5:3 F4:3 F5:2 D5:2 D6:2 E5:2 E6:2"],
  [Bbmaj9, null, "F5:2 F4:2 -:2 G5:2 G4:2 A5:2 A4:2 Bb5:2"],
  [Am9, null, "A5 G5 A5 C6 A5:2 A4:2 -:2 A5:2 A5:2 C6:2"],
  [Bbmaj9, null, "D6 C6 D6 C6 D6 C6 D6:2 C6 D6 C6:2 A5:2 G5:2"],
  [Fmaj9, null, "A5:2 C6:2 F6:2 C6:2 A5:2 C6:2 F6:2 C6:2"],
  [Bbmaj7, Cadd9, "D6:2 D5:2 F5:2 D6:2 E6:2 E5:2 G5:2 C6:2"],
  [D7sus4, D7, "D6 D6 D6:2 D5:2 C6 D6 C6:2 F#5:2 A5:2 C6:2"],
  [Bbmaj7, Cadd9, "G5:2 G4:2 G5:2 F5:2 E5:2 E6:2 C6:2 G5:2"],
  [Dm9, null, "F5:2 F4:2 F5:2 D5:2 E5:2 E6:2 D6:2 A5:2"],
  [Bbmaj9, null, "F5:3 G5:3 A5:2 Bb5:3 A5:3 G5:2"],
  [Am9, null, "A5 G5 A5 C6 A5:4 -:2 A5:2 A5:2 C6:2"],
];

type Flags = Omit<FutureBar, "c" | "c2" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): FutureBar[] =>
  lines.map(([c, c2, s], i) => ({ c, ...(c2 ? { c2 } : {}), m: m(s), ...flags(i) }));

const beat = { kick: true, clap: true, hat: true };
const rise = (i: number) => ({ riser: true, roll: ([4, 8, 16, 32] as const)[i - 4], open: 0.5 + (i - 3) * 0.12 });
// stabs, with the wah on the bars that hold a dominant or the turnaround
const drop = (i: number): Flags => ({ ...beat, bass: true, open: 1, chord: i % 4 === 3 ? "wobble" : "stab", crash: i % 8 === 0 });

const bars: FutureBar[] = [
  ...section(INTRO, (i) => ({ chord: "pad", open: 0.15 + i * 0.02, kick: i >= 4, hat: i >= 4 })),
  ...section(BUILD, (i) =>
    i < 4 ? { ...beat, chord: "pad", open: 0.3 + i * 0.05 } : { chord: i < 7 ? "stab" : "pad", ...rise(i), gap: i === 7 },
  ),
  ...section(DROP, drop),
  ...section(BREAK, () => ({ chord: "pad", open: 0.35 })),
  ...section(REBUILD, (i) =>
    i < 4 ? { ...beat, chord: "pad", open: 0.35 + i * 0.03 } : { chord: i < 7 ? "stab" : "pad", ...rise(i), gap: i === 7 },
  ),
  ...section(DROP2, (i) => ({ ...drop(i), chord: i % 2 === 1 ? "wobble" : "stab" })),
];

export const kamigami: FuturePiece = {
  kind: "future",
  slug: "kamigami",
  title: "神々が恋した幻想郷",
  description: "future bass arrange / 150 BPM",
  bpm: 150,
  visual: "danmaku",
  hues: [15, 40, 355, 55],
  bars,
};
