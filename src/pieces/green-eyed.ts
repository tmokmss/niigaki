// Chiptune arrangement of 緑眼のジェラシー (ZUN, 東方地霊殿), from ALFetite's piano transcription.
// Kept on a local branch for personal listening; not for publishing.
import type { ChipBar, ChipPiece } from "./types";

const Em = ["E4", "G4", "B4"];
const A = ["A3", "C#4", "E4"];
const C = ["C4", "E4", "G4"];
const Cdim = ["C#4", "E4", "G4"];
const G = ["G3", "B3", "D4"];
const B = ["B3", "D#4", "F#4"];
const D = ["D4", "F#4", "A4"];
const Am = ["A3", "C4", "E4"];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string) =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)] as [string, number];
  });

type Line = [string[], string];

const THEME: Line[] = [
  [Em, "B4:12"],
  [Em, "B4:4 F#5:4 G5:4"],
  [A, "A5:12"],
  [A, "B5:8 F#5:4"],
  [C, "G5:12"],
  [C, "B5:8 F#5:4"],
  [Cdim, "G5:12"],
  [Cdim, "B5:8 E6:4"],
];

const THEME_HIGH: Line[] = [
  [C, "E6:8 C6:2 D6:2"],
  [C, "E6:4 F#6:4 G6:4"],
  [G, "G6:8 B5:2 F#6:2"],
  [G, "G6:4 A6:4 B6:4"],
  [C, "~:12"],
  [C, "A6:4 G6:4 F#6:4"],
  [B, "E6:4 D#6:4 E6:4"],
  [B, "D#6:2 B5:2 A5:2 G5:2 F#5:2 D#5:2"],
];

const THEME_END: Line[] = [
  [C, "E6:8 B4:2 E5:2"],
  [C, "F#5:4 G5:4 B5:4"],
  [Em, "E6:8 B4:4"],
  [Em, "E5:4 F#5:4 G5:4"],
  [Am, "A5:12"],
  [Am, "G5:4 F#5:4 E5:4"],
  [B, "D#5:4 B4:2 A4:2 G4:4"],
  [B, "F#4:4 D#4:4 B3:4"],
];

const CHORDS: Line[] = [
  [C, "E5:12"],
  [C, "D5:4 A4:4 G4:4"],
  [D, "F#4:4 D4:4 A3:4"],
  [G, "B3:8 E5:4"],
  [C, "E5:12"],
  [D, "D5:4 G5:4 F#5:4"],
  [C, "E5:12"],
  [Em, "B4:8 A4:4"],
  [Em, "E6:12"],
  [Am, "C6:4 A5:4 G5:4"],
  [D, "F#5:4 D5:4 A4:4"],
  [Em, "B4:8 E6:4"],
  [C, "E6:12"],
  [D, "E6:4 G6:4 F#6:4"],
  [C, "E6:12"],
  [Em, "-:4 E5 B4 A4 G4 E4 B3 A3 G3"],
];

const RUNS: Line[] = [
  [Em, "E4 G4 A4 G4 B4 E5 G5 A5 B5 G5 B5 G5"],
  [Em, "E6 G5 B5 G5 E5 G5 A5 G5 E5 B4 A4 G4"],
  [B, "D#4 F#4 A4 B4 D#5 B4 F#5 D#5 A5 B5 E5 D#5"],
  [B, "B5 A5 G5 A5 G5 F#5 D5 B4 A4 F#4 D4 B3"],
  [G, "D4 G4 A4 D5 D5 G5 A5 D5 D6 A5 G5 D5"],
  [D, "D6 A5 F#5 D5 A5 F#5 D5 A4 D5 A4 F#4 D4"],
  [A, "C#4 E4 F#4 A4 A4 B4 C#5 E5 A4 A5 E5 C#5"],
  [A, "~ A5 E5 C#5 E5 C#5 A4 E4 -:4"],
  [C, "C4 E4 F#4 G4 E4 F#4 G4 C5 F#4 G4 C5 E5"],
  [C, "C5 E5 F#5 G5 E5 F#5 G5 A5 F#5 G5 C6 E6"],
  [Em, "G5 B5 E6 G5 B5 E6 G5 B5 E6 G5 B5:2"],
  [Em, "B5 E5 A5 E5 G5 E5 F#5:2 E5 B4 F#5:2"],
  [Am, "E5 C5 E5 B4 A4:2 E4 C4 A3 C4 E4 C4"],
  [Am, "A3 B3 C4 E4 A4 B4 C5 E5 A5 B5 C6 E6"],
  [B, "D#6 B5 F#5 D#6 B5 G5 F#5 D#5 B4 D#5 F#5:2"],
  [B, "F#5 D#5 B4 D#5 A4 B4 G4 A4 F#4:2 -:2"],
];

type Flags = Omit<ChipBar, "c" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): ChipBar[] =>
  lines.map(([c, s], i) => ({ c, m: m(s), ...flags(i) }));

const full = { arp: true, bass: true, kick: true, snare: true };

// the last run ends on B7 and resolves into the opening E minor
const bars: ChipBar[] = [
  ...section(THEME, () => ({ arp: true, bass: true, kick: true, hat: 8 })),
  ...section(THEME_HIGH, (i) => ({ ...full, hat: 8, roll: i === 7 })),
  ...section(THEME, (i) => ({ ...full, hat: 16, harm: true, crash: i === 0 })),
  ...section(THEME_END, (i) => ({ ...full, hat: 16, harm: true, roll: i === 7 })),
  ...section(CHORDS, (i) => ({ ...full, hat: 8, crash: i === 0 || i === 8 })),
  ...section(RUNS, (i) => ({ ...full, hat: 16, crash: i === 0, roll: i === 15 })),
  ...section(RUNS, (i) => ({ ...full, hat: 16, harm: true, crash: i === 0 })),
];

export const greenEyed: ChipPiece = {
  kind: "chip",
  slug: "green-eyed",
  title: "緑眼のジェラシー",
  description: "chiptune arrange / E minor / 3/4 / 172 BPM",
  bpm: 172,
  beats: 3,
  groove: "three",
  bassline: "octave",
  visual: "danmaku",
  bars,
};
