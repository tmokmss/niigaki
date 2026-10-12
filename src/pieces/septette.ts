// Melodic dubstep arrangement of 亡き王女の為のセプテット (ZUN, 東方紅魔郷), from ALFetite's piano transcription (alfetite.com/sheet-music/touhou/6-6-2).
import type { DubstepBar, DubstepPiece } from "./types";

const Bmadd9 = ["B3", "D4", "F#4", "C#5"];
const Bm = ["B3", "D4", "F#4", "B4"];
const BmD = ["D4", "F#4", "A4", "B4"];
const Asus2 = ["A3", "B3", "E4", "A4"];
const A = ["A3", "C#4", "E4", "A4"];
const Gmaj9 = ["G3", "B3", "D4", "F#4", "A4"];
const Eadd9 = ["E4", "G#4", "B4", "F#5"];
const E = ["E4", "G#4", "B4", "E5"];
const Em7 = ["E4", "G4", "B4", "D5"];
const Em9 = ["E4", "G4", "B4", "D5", "F#5"];
const Fsharp7 = ["F#4", "A#4", "C#5", "E5"];
const Cadd9 = ["C4", "E4", "G4", "D5"];
const Dmaj9 = ["D4", "F#4", "A4", "C#5", "E5"];
const Fsharpm9 = ["F#4", "A4", "C#5", "E5", "G#5"];
const B7D = ["D#4", "F#4", "A4", "B4"];

// [chord, chord for beats 3-4 or null, melody]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the theme as written (score bars 9-16), its F#-B-C# pickup closing the bar before; the last bar turns G to C on the way back to B minor
const THEME: Line[] = [
  [Bmadd9, A, "D5:6 E5:2 C#5:6 D5:2"],
  [Gmaj9, null, "B4:8 -:2 F#4:2 B4:2 C#5:2"],
  [Bmadd9, A, "D5:6 E5:2 C#5:6 A5:2"],
  [Eadd9, null, "F#5:8 -:2 F#5:2 A5:2 B5:2"],
  [Em7, null, "E5:4 E5:4 -:2 E5:2 F#5:2 A5:2"],
  [BmD, null, "D5:4 D5:4 -:2 B4:2 B4:2 C#5:2"],
  [Em7, Fsharp7, "D5:6 E5:2 C#5:6 A#4:2"],
  [Gmaj9, Cadd9, "B4:8 C5:8"],
];

// the theme's F#-B-C#-D head, repeated closer and closer, then restruck up the chords to F#; the last beat drops out
const BUILD: Line[] = [
  [Bmadd9, null, "F#4:2 B4:2 C#5:2 D5:6 E5:2 C#5:2"],
  [Gmaj9, null, "B4:8 F#4:2 B4:2 C#5:2 D5:2"],
  [Bmadd9, Asus2, "F#4 B4 C#5 D5:5 F#4 B4 C#5 D5:5"],
  [Eadd9, null, "F#4 B4 C#5 D5 F#4 B4 C#5 D5 F#4 B4 C#5 D5 F#5:2 A5:2"],
  [Em7, null, "E5:4 E5:4 E5:4 E5:4"],
  [BmD, null, "D5:2 D5:2 D5:2 D5:2 E5:2 E5:2 E5:2 E5:2"],
  [Em7, Fsharp7, "F#5 F#5 F#5 F#5 F#5 F#5 F#5 F#5 E5 E5 E5 E5 C#5 C#5 C#5 C#5"],
  [Fsharp7, null, "A#4:2 C#5:2 E5:2 F#5:2 A#5:4 -:4"],
];

// the theme, then its high answer (score bars 32-40), long notes restruck; the first two bars of each half as written
const DROP: Line[] = [
  [Bmadd9, A, "D5:6 E5:2 C#5:6 D5:2"],
  [Gmaj9, null, "B4:8 -:2 F#4:2 B4:2 C#5:2"],
  [Bmadd9, A, "D5:3 D5:3 E5:2 C#5:3 C#5:3 A5:2"],
  [Eadd9, null, "F#5:3 F#5:3 F#5:2 -:2 F#5:2 A5:2 B5:2"],
  [Em7, null, "E5:2 E5 E5 E5:2 E5:2 -:2 E5:2 F#5:2 A5:2"],
  [BmD, null, "D5:3 D5:3 D5:2 -:2 B4:2 B4:2 C#5:2"],
  [Em7, Fsharp7, "D5:3 D5:3 E5:2 C#5:3 C#5:3 A#4:2"],
  [Gmaj9, Cadd9, "B4:3 B4:3 B4:2 C5:2 D5:2 D5:2 E5:2"],
  [Bm, A, "F#5:6 A5:2 E5:6 F#5:2"],
  [Gmaj9, null, "D5:8 -:2 D5:2 D5:2 E5:2"],
  [Bm, E, "F#5:3 F#5:3 A5:2 -:2 B5:2 B5:2 B5:2"],
  [E, null, "G#5:3 G#5:3 G#5:2 -:2 B5:2 C#6:2 D6:2"],
  [Em9, null, "G5:2 G5 G5 G5:2 G5:2 -:2 G5:2 A5:2 C#6:2"],
  [BmD, null, "F#5:3 F#5:3 F#5:2 -:2 D5:2 D5:2 E5:2"],
  [Em7, Fsharp7, "F#5:3 F#5:3 A5:2 E5:3 E5:3 C#5:2"],
  [Gmaj9, Fsharp7, "D5:3 D5:3 B4:2 C#5:4 A#4:4"],
];

// the F-sharp minor tune (score bars 50-57), close to the score, ending on F#7 with the theme's pickup
const BREAK: Line[] = [
  [Dmaj9, null, "B4:6 A4:2 G#4:3 E4 ~:2 F#4:2"],
  [Dmaj9, Eadd9, "~:12 F#4:2 C#5:2"],
  [Fsharpm9, null, "B4:6 A4:2 G#4:3 E5 ~:2 C#5:2"],
  [Fsharpm9, null, "~:12 F#4:2 C#5:2"],
  [B7D, null, "B4:6 A4:2 G#4:3 E4 ~:2 F#4:2"],
  [B7D, null, "~:12 F#4:2 G#4:2"],
  [Dmaj9, Eadd9, "A4:2 G#4:2 E4:2 F#4:10"],
  [Fsharp7, null, "F#4:8 -:2 F#4:2 B4:2 C#5:2"],
];

// the theme and its answer with octave leaps and broken chords; the last bar holds F#7 and picks up into the intro
const DROP2: Line[] = [
  [Bmadd9, A, "D5:6 E5:2 C#5:6 D5:2"],
  [Gmaj9, null, "B4:8 -:2 F#4:2 B4:2 C#5:2"],
  [Bmadd9, A, "D6:2 D5:2 D6:2 E6:2 C#6:2 C#5:2 C#6:2 A5:2"],
  [Eadd9, null, "F#5:2 F#6:2 F#5:2 E5:2 -:2 F#5:2 A5:2 B5:2"],
  [Em7, null, "E5 G5 B5 G5 E5 G5 B5 G5 -:2 E5:2 F#5:2 A5:2"],
  [BmD, null, "D5 F#5 B5 F#5 D5 F#5 B5 F#5 -:2 B4:2 B4:2 C#5:2"],
  [Em7, Fsharp7, "D6:2 D5:2 D6:2 E6:2 C#6:2 C#5:2 C#6:2 A#5:2"],
  [Gmaj9, Cadd9, "B5:2 B4:2 B5:2 B4:2 C5:2 D5:2 D5:2 E5:2"],
  [Bm, A, "F#5:6 A5:2 E5:6 F#5:2"],
  [Gmaj9, null, "D6:2 D5:2 D6:2 B5:2 -:2 D5:2 D5:2 E5:2"],
  [Bm, E, "F#5 B5 D6 B5 F#5 B5 A5:2 -:2 B5:2 B5:2 B5:2"],
  [E, null, "G#5:2 G#6:2 G#5:2 E5:2 -:2 B5:2 C#6:2 D6:2"],
  [Em9, null, "G5 B5 E6 B5 G5 B5 E6 B5 -:2 G5:2 A5:2 C#6:2"],
  [BmD, null, "F#5:2 F#6:2 F#5:2 D5:2 -:2 D5:2 D6:2 E6:2"],
  [Em7, Fsharp7, "F#5:3 A5:3 B5:2 A#5:3 F#5:3 C#6:2"],
  [Gmaj9, Fsharp7, "D6:4 B5:2 A#5:2 -:2 F#4:2 B4:2 C#5:2"],
];

type Flags = Omit<DubstepBar, "c" | "c2" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): DubstepBar[] =>
  lines.map(([c, c2, s], i) => ({ c, ...(c2 ? { c2 } : {}), m: m(s), ...flags(i) }));

// the second half of a build: riser, a tightening snare roll, the supersaw lead swelling, and silence on the last beat
const rise = (i: number): Flags => ({ riser: true, saw: 0.6 + (i - 4) * 0.1, roll: ([4, 8, 16, 32] as const)[i - 4], open: 0.55 + (i - 3) * 0.1, gap: i === 7 });
// heavy quarter-note wobbles, eighths every other bar, triplets on the turnaround
const drop = (rates: (4 | 8 | 12)[]) => (i: number): Flags => ({ beat: true, saw: 1, wobble: rates[i % 4], crash: i % 8 === 0 });

const bars: DubstepBar[] = [
  ...section(THEME, (i) => ({ open: 0.12 + i * 0.02, hat: i >= 4, crash: i === 0 })),
  ...section(BUILD, (i) => (i < 4 ? { beat: true, open: 0.3 + i * 0.05, saw: [0, 0, 0.2, 0.35][i] } : rise(i))),
  ...section(DROP, drop([4, 8, 4, 12])),
  ...section(BREAK, (i) => ({ open: 0.3, crash: i === 0 })),
  ...section(THEME.slice(0, 4), (i) => ({ open: 0.35 + i * 0.04, hat: i < 2, beat: i >= 2, saw: [0, 0.2, 0.3, 0.45][i] })),
  ...section(BUILD.slice(4), (i) => rise(i + 4)),
  ...section(DROP2, drop([8, 4, 8, 12])),
];

export const septette: DubstepPiece = {
  kind: "dubstep",
  slug: "septette",
  title: "亡き王女の為のセプテット",
  description: "melodic dubstep arrange / 145 BPM",
  bpm: 145,
  visual: "danmaku",
  // scarlet, deep crimson, night violet, moonlit magenta
  hues: [352, 338, 262, 312],
  bars,
};
