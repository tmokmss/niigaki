// Liquid drum & bass arrangement of 緑眼のジェラシー (ZUN, 東方地霊殿), on the lines of the chiptune version (from ALFetite's piano transcription).
// Each 3/4 bar of the original fills one 4/4 bar, its three beats stretched to 3+3+2.
import { arpeggio, chop, CHORDS, flourish, leap, m, RUNS, THEME, THEME_END, THEME_HIGH, tresillo, type Line, type Note } from "./green-eyed";
import type { DnbBar, DnbPiece } from "./types";

const Em9 = ["E4", "G4", "B4", "D5", "F#5"];
const A9 = ["A3", "C#4", "E4", "G4", "B4"];
const Cmaj9 = ["C4", "E4", "G4", "B4", "D5"];
const Csharpm7b5 = ["C#4", "E4", "G4", "B4"];
const Gmaj9 = ["G3", "B3", "D4", "F#4", "A4"];
const B7b13 = ["B3", "D#4", "G4", "A4"];
const Dadd9 = ["D4", "F#4", "A4", "E5"];
const Am9 = ["A3", "C4", "E4", "G4", "B4"];

// the chiptune version's triads, by their notes, to the jazz chords they become
const JAZZ: Record<string, string[]> = {
  "E4 G4 B4": Em9,
  "A3 C#4 E4": A9,
  "C4 E4 G4": Cmaj9,
  "C#4 E4 G4": Csharpm7b5,
  "G3 B3 D4": Gmaj9,
  "B3 D#4 F#4": B7b13,
  "D4 F#4 A4": Dadd9,
  "A3 C4 E4": Am9,
};

// the theme's B-F#-G head, repeated ever closer; the last beat drops out before the drums come in
const BUILD: Line[] = [
  [Em9, "B4:6 F#5:6 G5:4"],
  [Em9, "B4:4 F#5:2 G5:2 B4:4 F#5:2 G5:2"],
  [Cmaj9, "B4:2 F#5 G5 B4:2 F#5 G5 B4:2 F#5 G5 B4:2 F#5 G5"],
  [B7b13, "D#5 F#5 B5 D#5 F#5 B5 D#6 F#6 B6:4 -:4"],
];

type Flags = Omit<DnbBar, "c" | "m">;
const section = (lines: Line[], toNotes: (c: string[], s: string, i: number) => Note[], flags: (i: number) => Flags): DnbBar[] =>
  lines.map(([c, s], i) => {
    const jazz = JAZZ[c.join(" ")] ?? c;
    return { c: jazz, m: toNotes(jazz, s, i), ...flags(i) };
  });

const swung = (_: string[], s: string) => tresillo(s);
const drop = { beat: true, bass: true };

// each drop keeps its first two bars as written; the last bar sits on B7(b13), which the intro's Em9 resolves
const bars: DnbBar[] = [
  ...section(THEME, swung, (i) => ({ open: 0.15 + i * 0.05, hat: i >= 4, crash: i === 0 })),
  ...section(BUILD, (_, s) => m(s), (i) => ({ open: 0.6 + i * 0.13, roll: ([4, 8, 16, 16] as const)[i] })),
  ...section(
    [...THEME, ...THEME_HIGH],
    (_, s, i) => (i < 2 || i === 8 || i === 9 ? tresillo(s) : chop(i < 8 ? 3 : 2)(tresillo(s))),
    (i) => ({ ...drop, crash: i === 0 || i === 8 }),
  ),
  ...section(CHORDS.slice(0, 8), swung, (i) => ({ open: i < 4 ? 0.3 : 0.3 + (i - 3) * 0.05, crash: i === 0 })),
  ...section(RUNS.slice(8), flourish, (i) => ({
    open: 0.5 + i * 0.07,
    hat: i < 4,
    beat: i === 4 || i === 5,
    roll: i === 6 ? 8 : i === 7 ? 16 : undefined,
  })),
  ...section(CHORDS, (c, s, i) => (i < 2 ? tresillo(s) : arpeggio(c)(tresillo(s))), (i) => ({ ...drop, crash: i === 0 || i === 8 })),
  ...section(THEME_END, (_, s, i) => (i < 2 || i >= 6 ? tresillo(s) : leap(tresillo(s))), (i) => ({ ...drop, crash: i === 0 })),
];

export const greenEyedDnb: DnbPiece = {
  kind: "dnb",
  slug: "green-eyed-dnb",
  title: "緑眼のジェラシー",
  description: "liquid drum & bass arrange / E minor / 174 BPM",
  bpm: 174,
  visual: "danmaku",
  // emerald, night blue, deep green, indigo
  hues: [155, 222, 128, 245],
  bars,
};
