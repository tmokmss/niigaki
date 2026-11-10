// Lo-fi hip hop arrangement of 緑眼のジェラシー (ZUN, 東方地霊殿), on the lines of the chiptune version (from ALFetite's piano transcription).
// The 3/4 original runs two bars to one 4/4 bar here: its quarter notes become quarter-note triplets over the swung beat.
import { transpose } from "../lib/score";
import { CHORDS, m, THEME, THEME_END, THEME_HIGH, type Line, type Note } from "./green-eyed";
import type { LofiBar, LofiPiece } from "./types";

const Em9 = ["E4", "G4", "B4", "D5", "F#5"];
const Em11 = ["E4", "G4", "B4", "D5", "A5"];
const A9 = ["A3", "C#4", "E4", "G4", "B4"];
const A69 = ["A3", "C#4", "E4", "F#4", "B4"];
const Cmaj9 = ["C4", "E4", "G4", "B4", "D5"];
const C69 = ["C4", "E4", "G4", "A4", "D5"];
const Csharpm7b5 = ["C#4", "E4", "G4", "B4"];
const G69 = ["G3", "B3", "D4", "E4", "A4"];
const B7sus4 = ["B3", "E4", "F#4", "A4"];
const B7b13 = ["B3", "D#4", "G4", "A4"];
const D9 = ["D4", "F#4", "A4", "C5", "E5"];
const D9sus4 = ["D4", "G4", "A4", "C5", "E5"];
const Am9 = ["A3", "C4", "E4", "G4", "B4"];

// [chord for the first 3/4 bar, chord for the second, melody of both bars in sixteenths (12 per 3/4 bar)]
type Pair = [string[], string[], Note[]];

const shift = (ns: Note[], semis: number): Note[] => ns.map(([p, n]) => [p === "~" || p === "-" ? p : transpose(p, semis), n]);
// two 3/4 bars of the chiptune version's lines as one bar, under new chords
const pairs = (lines: Line[], chords: [string[], string[]][], semis = 0): Pair[] =>
  chords.map(([c, c2], k) => [c, c2, shift([...m(lines[2 * k][1]), ...m(lines[2 * k + 1][1])], semis)]);
const written = (c: string[], c2: string[], s: string): Pair => [c, c2, m(s)];

const THEME_CHORDS: [string[], string[]][] = [[Em9, Em9], [A9, A69], [Cmaj9, C69], [Csharpm7b5, Csharpm7b5]];
const HIGH_CHORDS: [string[], string[]][] = [[Cmaj9, Cmaj9], [G69, G69], [Cmaj9, C69], [B7sus4, B7b13]];

const A_THEME = pairs(THEME, THEME_CHORDS);
// the high strain comes down an octave to sit with the keys
const A_HIGH = pairs(THEME_HIGH, HIGH_CHORDS, -12);
const END = pairs(THEME_END, [[Cmaj9, Cmaj9], [Em9, Em11], [Am9, Am9], [B7b13, B7b13]]);

// the falling line and its answer; the first half goes up an octave to stay above the chords
const B = [
  ...pairs(CHORDS.slice(0, 8), [[Cmaj9, Cmaj9], [D9, G69], [Cmaj9, D9sus4], [Cmaj9, Em9]], 12),
  ...pairs(CHORDS.slice(8), [[Em9, Am9], [D9, Em9], [Cmaj9, D9sus4], [Cmaj9, Em11]]),
];

// the theme again: its long notes fall through the chord, the high strain's are struck again and answered, the last run stops short
const A2: Pair[] = [
  written(Em9, Em9, "B4:4 E5:4 G5:4 B4:4 F#5:4 G5:4"),
  written(A9, A69, "A5:4 E5:4 C#5:4 B5:8 F#5:4"),
  written(Cmaj9, C69, "G5:4 E5:4 C5:4 B5:8 F#5:4"),
  written(Csharpm7b5, Csharpm7b5, "G5:4 E5:4 C#5:4 B5:8 E6:4"),
  written(Cmaj9, Cmaj9, "E5:6 E5:2 C5:2 D5:2 E5:4 F#5:4 G5:4"),
  written(G69, G69, "G5:6 D5:2 B4:2 F#5:2 G5:4 A5:4 B5:4"),
  written(Cmaj9, C69, "~:8 G5:2 E5:2 A5:4 G5:4 F#5:4"),
  written(B7sus4, B7b13, "E5:4 D#5:4 E5:4 D#5:2 B4:2 A4:2 G4:2 F#4:2 -:2"),
];

// the theme's head thinning out onto the dominant, which the intro's E minor resolves
const OUTRO: Pair[] = [
  A_THEME[0],
  A_THEME[1],
  written(Am9, Am9, "A5:12 G5:4 F#5:4 E5:4"),
  written(B7sus4, B7b13, "D#5:4 B4:8 -:12"),
];

type Flags = Omit<LofiBar, "c" | "c2" | "m">;
const section = (ps: Pair[], flags: (i: number) => Flags): LofiBar[] =>
  ps.map(([c, c2, notes], i) => ({ c, ...(c2 === c ? {} : { c2 }), m: notes, ...flags(i) }));

const groove = { beat: true, bass: true };

const bars: LofiBar[] = [
  // the theme's head and the cadence back to E minor, on keys only
  ...section([A_THEME[0], A_THEME[1], END[2], END[3]], (i) => ({ open: 0.4 + i * 0.08 })),
  ...section([...A_THEME, ...A_HIGH], (i) => ({ ...groove, crash: i === 0 })),
  ...section(B, (i) => ({ ...groove, open: 0.85, crash: i === 0 })),
  ...section(END, (i) => ({ bass: true, open: 0.3, crash: i === 0 })),
  ...section(A2, (i) => ({ ...groove, crash: i === 0 })),
  ...section(OUTRO, (i) => ({ beat: i < 2, bass: i < 3, open: 0.75 - i * 0.12, crash: i === 0 })),
];

export const greenEyedLofi: LofiPiece = {
  kind: "lofi",
  slug: "green-eyed-lofi",
  title: "緑眼のジェラシー",
  description: "lo-fi arrange / 80 BPM",
  bpm: 80,
  visual: "danmaku",
  // moss on the bridge, lantern yellow-green, the underground river, old brass
  hues: [132, 84, 162, 64],
  bars,
};
