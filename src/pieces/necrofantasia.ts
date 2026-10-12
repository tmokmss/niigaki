// Jazz piano trio arrangement of ネクロファンタジア (ZUN, 東方妖々夢), from 東方ピアノEasyモード's MIDI (easypianoscore.jp).
// Head: the C-sharp-minor theme in two, the B-flat-minor strain, the stop-time build and the A-minor chorus;
// then a piano chorus on the chorus changes, fours with the drums, the chorus again and the G-sharp-minor strain, whose G#7 turns back to the top.
import type { JazzBar, JazzPiece } from "./types";

// the bass's root first, then the left hand's rootless voicing
const Csm9 = ["C#3", "B3", "D#4", "E4", "G#4"];
const B13 = ["B2", "A3", "C#4", "D#4", "G#4"];
const Fs13 = ["F#2", "E3", "A#3", "D#4", "G#4"];
const Fs13sus = ["F#2", "E3", "G#3", "B3", "D#4"];
const Amaj7s11 = ["A2", "G#3", "B3", "C#4", "D#4"];
const Fsm9 = ["F#2", "A3", "C#4", "E4", "G#4"];
const Fsm69 = ["F#2", "E3", "A3", "C#4", "D#4"];
const Gs7b13 = ["G#2", "F#3", "C4", "E4", "A4"];
const Gs7s9 = ["G#2", "C3", "F#3", "B3", "E4"];
const Amaj9 = ["A2", "G#3", "B3", "C#4", "E4"];
const Bb7b9 = ["Bb2", "Ab3", "B3", "D4", "G4"];

const Ebm9 = ["Eb2", "Gb3", "Bb3", "Db4", "F4"];
const F7b9 = ["F2", "Eb3", "Gb3", "A3", "D4"];
const F7susb9 = ["F2", "Eb3", "Gb3", "Bb3", "Db4"];
const Gbmaj9 = ["Gb2", "F3", "Ab3", "Bb3", "Db4"];
const Ab13 = ["Ab2", "Gb3", "Bb3", "C4", "F4"];

const Gmaj9 = ["G2", "F#3", "A3", "B3", "D4"];
const A13 = ["A2", "G3", "B3", "C#4", "F#4"];
const Bm9 = ["B2", "A3", "C#4", "D4", "F#4"];
const E9 = ["E2", "D3", "F#3", "G#3", "C#4"];
const Asdim7 = ["A#2", "E3", "G3", "C#4"];
const Fs7b13 = ["A#2", "E3", "A#3", "D4"];
const C13 = ["C3", "Bb3", "D4", "E4", "A4"];

const Fmaj7s11 = ["F2", "A3", "B3", "E4", "G4"];
const Fmaj9 = ["F2", "A3", "C4", "E4", "G4"];
const G13sus = ["G2", "F3", "A3", "C4", "E4"];
const G13 = ["G2", "F3", "A3", "B3", "E4"];
const Am9 = ["A2", "G3", "B3", "C4", "E4"];
const Am11 = ["A2", "G3", "C4", "D4", "E4"];
const E7s9 = ["E2", "G#3", "D4", "G4"];
const Dm9 = ["D2", "F3", "A3", "C4", "E4"];
const Cmaj9 = ["C3", "E3", "G3", "B3", "D4"];
const Bb13 = ["Bb2", "Ab3", "C4", "D4", "G4"];
const Gm9 = ["G2", "F3", "Bb3", "D4", "A4"];

const Emaj9 = ["E2", "D#3", "F#3", "G#3", "B3"];
const Emaj7s11 = ["E2", "D#3", "F#3", "G#3", "A#3"];
const Gsm9 = ["G#2", "F#3", "A#3", "B3", "D#4"];
const Cs9 = ["C#3", "E#3", "A#3", "B3", "D#4"];
const Ds7s9 = ["D#2", "G3", "C#4", "F#4"];
const Gs9b13 = ["G#2", "F#3", "A#3", "C4", "E4"];
const Gs7b9 = ["G#2", "F#3", "A3", "C4", "E4"];

// [chord, chord for beats 3-4 or null, melody in sixteenths]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

const section = (lines: Line[], flags: Omit<JazzBar, "c" | "c2" | "m"> = {}): JazzBar[] =>
  lines.map(([c, c2, mel]) => ({ c, ...(c2 ? { c2 } : {}), m: m(mel), ...flags }));

// the C-sharp-minor theme
const THEME: Line[] = [
  [Csm9, B13, "C#5:2 E5:2 G#5:2 D#5:4 F#5:2 B5:2 G#5:2"],
  [Fs13, Amaj7s11, "~:2 F#5:2 E5:2 D#5:4 E5:2 D#5:2 B4:2"],
  [Fsm9, Gs7b13, "G#4:2 C#5:2 E5:2 C5:4 D#5:2 G#5:2 E5:2"],
  [Amaj7s11, B13, "~:2 C#5:2 A4:2 E5:2 D#5 E5 D#5:2 C#5:2 D#5:2"],
  [Csm9, B13, "E5:2 F#5:2 G#5:2 F#5:4 B5:2 C#6:2 G#5:2"],
  [Fs13sus, Amaj7s11, "~:2 B5:2 F#5:2 G#5:2 E5:2 G#4:2 D#5:2 F#4:2"],
  [Fsm69, Gs7s9, "G#4:2 C#5:2 E5:2 D#5:4 B4:2 F#4:2 G#4:2"],
  [Amaj9, Bb7b9, "~:16"],
];

// the B-flat-minor strain, its chords pushed by the melody on the and of 2
const STRAIN: Line[] = [
  [Ebm9, F7b9, "F5:16"],
  [Gbmaj9, Ab13, "F5:12 Ab5:4"],
  [Ebm9, F7b9, "Bb5:6 A5:10"],
  [Gbmaj9, Ab13, "Db6:6 C6:6 Bb5:4"],
  [Ebm9, F7susb9, "Bb5:6 Ab5:6 Bb5:4"],
  [Gbmaj9, Ab13, "F5:4 Ab5:4 Eb5:4 C5:4"],
  [Ebm9, F7b9, "Db5:6 C5:10"],
  [Gbmaj9, Ab13, "F5:16"],
];

// stop-time on the build, then a bar for the drums
const BUILD: Line[] = [
  [Gmaj9, null, "D5:4 D5:2 D5:4 D5:2 D5:4"],
  [A13, null, "C#5:4 C#5:2 E5:4 E5:2 F#5:4"],
  [Bm9, E9, "D5:6 C#5:6 D5:4"],
  [E9, null, "~:16"],
  [Gmaj9, null, "B4:4 B4:2 B4:4 B4:2 B4:4"],
  [A13, null, "C#5:4 C#5:2 C#5:4 C#5:2 C#5:4"],
  [Asdim7, null, "C#5:4 C#5:2 C#5:4 C#5:2 C#5:4"],
  [Fs7b13, null, "F#5:6 F#5:6 F#5:4"],
];

// the A-minor chorus: F G Am Am, its second half moving to Dm9 and Cmaj9, ending on A major and a ii-V back to F
const CHORUS: Line[] = [
  [Fmaj7s11, null, "E5:4 C6:4 B5:4 D5:2 E5:2"],
  [G13sus, null, "~:4 B4:4 C5:4 D5:2 E5:2"],
  [Am9, null, "~:4 D6:4 C6:4 B5:2 C6:2"],
  [Am9, E7s9, "~:4 B5:4 A5:4 G5:2 A5:2"],
  [Fmaj9, null, "~:4 G5:4 E5:4 G5:2 A5:2"],
  [G13, null, "~:4 G5:4 E5:4 G5:2 E5:2"],
  [Am11, null, "~:4 D5:4 E5:4 G5:2 E5:2"],
  [Am9, C13, "~:14 E5:2"],
  [Dm9, null, "~:4 C6:2 A5:2 B5:4 D5:2 E5:2"],
  [G13sus, null, "~:4 B4:2 A4:2 C5:4 D5:2 E5:2"],
  [Cmaj9, null, "~:4 E6:2 D6:2 C6:4 B5:2 C6:2"],
  [Am9, Bb13, "~:4 B5:2 C6:2 A5:2 G#5:2 G5:2 A5:2"],
  [Fmaj9, null, "~:4 G5:4 E5:4 G5:2 A5:2"],
  [G13, null, "~:4 G5:4 E5:4 G5:2 A5:2"],
  [Amaj9, null, "~:8 -:2 C#6:2 E6:2 C#6:2"],
  [Gm9, C13, "Bb5:2 A5:2 F5:2 D5:2 E5:4 G5:2 A5:2"],
];

// a piano chorus on the same changes: the theme's E-C-B and D-C-B-C turned into swung eighths, enclosures and chord-tone landings
const SOLO: Line[] = [
  [Fmaj7s11, null, "E5:2 C6:2 B5:2 D5:2 E5:2 G5:2 B5:2 D6:2"],
  [G13sus, null, "C6:2 A5:2 F5:2 D5:2 E5:2 G5:2 A5:2 C6:2"],
  [Am9, null, "B5:2 D6:2 C6:2 A5:2 G5:2 E5:2 C5:2 E5:2"],
  [Am9, E7s9, "G5:2 F#5:2 E5:2 C5:2 B4:2 D5:2 G#5:2 B5:2"],
  [Fmaj9, null, "A5:2 G5:2 E5:2 C5:2 A4:4 -:2 C6:2"],
  [G13, null, "B5:2 A5:2 G5:2 F5:2 E5:2 D5:2 B4:2 D5:2"],
  [Am11, null, "E5:2 G5:2 C6:2 B5:2 A5:2 G5:2 E5:2 D5:2"],
  [Am9, C13, "C5:2 E5:2 G5:2 B5:2 Bb5:2 G5:2 E5:2 C5:2"],
  [Dm9, null, "D5:2 F5:2 A5:2 C6:2 E6:4 D6:2 C6:2"],
  [G13sus, null, "A5:4 F5:2 D5:2 E5:2 G5:2 A5:2 C6:2"],
  [Cmaj9, null, "E6:2 D6:2 C6:2 B5:2 G5:2 E5:2 G5:2 B5:2"],
  [Am9, Bb13, "D6:2 C6:2 B5:2 A5:2 Ab5:2 G5:2 F5:2 D5:2"],
  [Fmaj9, null, "E5:2 G5:2 A5:2 C6:2 E6:2 G6:2 E6:2 C6:2"],
  [G13, null, "D6:2 B5:2 G5:2 E5:2 F5:2 A5:2 B5:2 C#6:2"],
  [Amaj9, null, "E6:4 C#6:2 B5:2 A5:2 G#5:2 E5:2 C#5:2"],
  [Gm9, C13, "D5:2 F5:2 A5:2 Bb5:2 C6:2 Bb5:2 G5:2 A5:2"],
];

// fours: the piano, then the drums alone
const FOURS: Line[] = [
  [Fmaj7s11, null, "C6:2 B5:2 A5:2 G5:2 E5:2 G5:2 B5:2 D6:2"],
  [G13sus, null, "C6:4 A5:2 F5:2 D5:2 F5:2 A5:2 C6:2"],
  [Am9, null, "E6:2 D6:2 C6:2 B5:2 A5:2 G5:2 E5:2 G5:2"],
  [Am9, E7s9, "A5:4 -:4 G#5:2 B5:2 D6:2 -:2"],
];

// the G-sharp-minor strain: E F# G#m G#m, ending on G#7 with the theme's pickup
const LAST: Line[] = [
  [Emaj9, null, "G#4:14 G#4:2"],
  [Fs13sus, null, "~:4 A#4:4 B4:4 C#5:2 D#5:2"],
  [Gsm9, null, "~:14 D#5:2"],
  [Gsm9, Cs9, "~:4 C#5:4 B4:4 C#5:2 B4:2"],
  [Emaj7s11, null, "~:4 A#4:4 G#4:4 A#4:2 B4:2"],
  [Fs13sus, null, "~:4 A#4:4 G#4:4 A#4:2 B4:2"],
  [Gsm9, null, "~:4 C#5:4 D#5:4 C#5:2 D#5:2"],
  [Gsm9, Ds7s9, "~:16"],
  [Emaj9, null, "D#5:14 G#5:2"],
  [Fs13sus, null, "~:4 A#5:4 B5:4 A#5:2 B5:2"],
  [Gsm9, null, "~:4 A#5:4 G#5:4 F#5:2 G#5:2"],
  [Gsm9, Cs9, "~:14 B5:2"],
  [Emaj7s11, null, "~:4 A#5:4 G#5:4 A#5:2 B5:2"],
  [Fs13sus, Gs9b13, "~:4 A#5:4 G#5:4 A#5:2 C6:2"],
  [Gs9b13, null, "~:16"],
  [Gs7b9, null, "~:12 C#5 G#5 E5 D#5"],
];

const swing = { bass: "walk", comp: true, drums: "ride" } as const;
const first = (bars: JazzBar[]) => bars.map((b, i) => (i ? b : { ...b, crash: true }));
const fill = (bars: JazzBar[], ...at: number[]) => bars.map((b, i) => (at.includes(i) ? { ...b, fill: true } : b));

export const necrofantasia: JazzPiece = {
  kind: "jazz",
  slug: "necrofantasia",
  title: "ネクロファンタジア",
  description: "jazz piano trio arrange / 152 BPM",
  bpm: 152,
  visual: "danmaku",
  // the gap's violet, parasol gold, dusk indigo, amber
  hues: [292, 46, 258, 34],
  bars: [
    ...first(section(THEME, { bass: "two", comp: true, drums: "brush" })),
    ...section(STRAIN, { bass: "walk", comp: true, drums: "brush" }),
    ...fill(section(BUILD, { hits: true }), 3),
    { c: C13, drums: "solo", fill: true },
    ...first(fill(section(CHORUS, swing), 7, 15)),
    ...first(fill(section(SOLO, swing), 15)),
    ...section(FOURS, swing),
    ...fill(
      [Fmaj9, G13, Am11, Gm9].map((c): JazzBar => ({ c, drums: "solo" })),
      3,
    ),
    ...first(fill(section([...CHORUS.slice(0, 4), ...CHORUS.slice(12, 15), [Fsm9, B13, "~:16"]], { ...swing, oct: true }), 7)),
    ...first(fill(section(LAST, swing), 7)),
  ],
};
