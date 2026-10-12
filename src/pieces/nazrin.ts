// Lo-fi hip hop arrangement of 小さな小さな賢将 (ZUN, 東方星蓮船), from ALFetite's piano transcription (alfetite.com/sheet-music/touhou/12-1-2).
// The 3/4 original runs two bars to one 4/4 bar here: its quarter notes become quarter-note triplets over the swung beat.
import type { LofiBar, LofiPiece } from "./types";

const Ebm9 = ["Eb4", "Gb4", "Bb4", "Db5", "F5"];
const Ebm11 = ["Eb4", "Gb4", "Bb4", "Db5", "Ab5"];
const Db69 = ["Db4", "F4", "Ab4", "Bb4", "Eb5"];
const DbOverF = ["F4", "Ab4", "Db5", "Eb5"];
const Cbmaj9 = ["Cb4", "Eb4", "Gb4", "Bb4", "Db5"];
const Bbm11 = ["Bb3", "Db4", "F4", "Ab4", "Eb5"];
const Gbmaj9 = ["Gb3", "Bb3", "Db4", "F4", "Ab4"];
const Adim7 = ["A3", "C4", "Eb4", "Gb4"];
const Bb7b13 = ["Bb3", "D4", "Gb4", "Ab4"];
const Abmaj9 = ["Ab3", "C4", "Eb4", "G4", "Bb4"];
const F9 = ["F4", "A4", "Eb5", "G5"];
const G9sus4 = ["G3", "C4", "D4", "F4", "A4"];
const Gm9 = ["G3", "Bb3", "D4", "F4", "A4"];
const Bbadd9 = ["Bb3", "D4", "F4", "C5"];
const Cm9 = ["C4", "Eb4", "G4", "Bb4", "D5"];
const Bb9 = ["Bb3", "D4", "Ab4", "C5"];

// [chord for the first 3/4 bar, chord for the second, melody of both bars in sixteenths (12 per 3/4 bar)]
type Line = [string[], string[], string];

// "E4 G4:2 -:4 ~:8" -> [note, steps]; the length defaults to one step
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the theme from the segno: four bars in E-flat minor, eight in the three-flat key, four running back into the riff
const THEME: Line[] = [
  [Ebm9, Db69, "Eb5:4 Eb5:2 Ab5:2 Bb5:4 Ab5:2 Bb5:2 Ab5:2 Gb5:2 F5:2 Db5:2"],
  [Cbmaj9, Bbm11, "Eb5:4 Eb5:2 Ab5:2 Bb5:4 Db6:4 Ab5:4 Gb5:2 F5:2"],
  [Abmaj9, F9, "Eb5:4 Eb5:2 F5:2 G5:2 Bb5:2 A5:4 G5:4 F5:4"],
  [G9sus4, Gm9, "G5:4 D5:4 C5:4 G5:12"],
  [Abmaj9, Bbadd9, "G5:4 G5:2 D6:2 Eb6:4 D6:4 Bb5:6 F5:2"],
  [Cm9, Bb9, "G5:4 G5:2 D6:2 Eb6:4 F6:4 D6:6 Bb5:2"],
  [Cbmaj9, Db69, "Cb6:2 Db6:2 Eb6:2 Gb6:2 F6:2 Db6:2 Ab5:2 Gb5:2 F5:2 Ab5 Bb5 Db6 Bb5 Ab5 Gb5"],
  [Ebm9, Ebm11, "F5:2 Gb5:2 Db6:2 Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:2 Db6:2 F5:2 Gb5:2 Db6:2"],
];

// the opening riff in octaves, over a bass that climbs E-flat, F, G-flat and turns to the dominant
const riff = (top: string, low = "Eb5", last = top) => `F5:2 Gb5:2 ${top}:2 ${low}:2 Gb5:2 ${last}:2`;
const RIFF: Line[] = [
  [Ebm9, DbOverF, `${riff("Db6")} ${riff("Db6")}`],
  [Gbmaj9, Gbmaj9, `${riff("Db6")} ${riff("Db6")}`],
  [DbOverF, Cbmaj9, `${riff("Db6")} ${riff("Db6", "Eb5", "Cb6")}`],
  [Adim7, Adim7, `${riff("A5")} ${riff("A5")}`],
  [Bb7b13, Bb7b13, `${riff("Bb5", "D5")} ${riff("Bb5", "D5")}`],
  [Bb7b13, Bb7b13, "F5:2 Gb5:2 Bb5:8 -:12"],
];

// the theme again, its notes pushed late, dropped or bent into arpeggios
const THEME2: Line[] = [
  [Ebm9, Db69, "-:2 Eb5:2 Eb5:2 Ab5:2 Bb5:4 Ab5:2 Bb5:2 -:4 F5:2 Db5:2"],
  [Cbmaj9, Bbm11, "Eb5:3 Eb5 Ab5:2 Bb5:6 Db6:6 Ab5:2 Gb5:3 F5"],
  [Abmaj9, F9, "-:4 Eb5:2 F5:2 G5:2 Bb5:2 A5:6 G5:2 F5:4"],
  [G9sus4, Gm9, "G5:2 -:2 D5:3 C5:5 G4:2 Bb4:2 D5:2 G5:6"],
  [Abmaj9, Bbadd9, "G5:4 -:2 D6:2 Eb6:4 D6:2 -:2 Bb5:6 F5:2"],
  [Cm9, Bb9, "G5:2 G5:2 G5:2 D6:2 Eb6:4 F6:3 D6:3 Bb5:4 -:2"],
  [Cbmaj9, Db69, "Cb6:2 Db6:2 Eb6:2 -:2 F6:2 Db6:2 Ab5:4 F5:2 Ab5 Bb5 Db6 -:3"],
  [Ebm9, Ebm11, "F5:2 Gb5:2 Db6:4 -:4 Bb5:2 -:2 Db6:8"],
];

// the riff thinning out onto the dominant, which the intro's E-flat minor resolves
const OUTRO: Line[] = [
  RIFF[0],
  RIFF[1],
  [Adim7, Adim7, `${riff("A5")} F5:2 Gb5:2 A5:8`],
  [Bb7b13, Bb7b13, "F5:2 Gb5:2 Bb5:8 -:12"],
];

type Flags = Omit<LofiBar, "c" | "c2" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): LofiBar[] =>
  lines.map(([c, c2, s], i) => ({ c, ...(c2 === c ? {} : { c2 }), m: m(s), ...flags(i) }));

const groove = { beat: true, bass: true };

const bars: LofiBar[] = [
  // the theme's head and its run back to E-flat minor, on keys only
  ...section([THEME[0], THEME[1], THEME[6], THEME[7]], (i) => ({ open: 0.4 + i * 0.08 })),
  ...section(THEME, (i) => ({ ...groove, crash: i === 0 })),
  ...section(RIFF, (i) => ({ ...groove, open: 0.85, crash: i === 0 })),
  ...section(THEME.slice(2, 6), (i) => ({ bass: true, open: 0.3, crash: i === 0 })),
  ...section(THEME2, (i) => ({ ...groove, crash: i === 0 })),
  ...section(OUTRO, (i) => ({ beat: i < 2, bass: i < 3, open: 0.75 - i * 0.12, crash: i === 0 })),
];

export const nazrin: LofiPiece = {
  kind: "lofi",
  slug: "nazrin",
  title: "小さな小さな賢将",
  description: "lo-fi arrange / 84 BPM",
  bpm: 84,
  visual: "danmaku",
  // night sky, the gold she dowses for, dusk, a mouse's brown
  hues: [240, 50, 265, 28],
  bars,
};
