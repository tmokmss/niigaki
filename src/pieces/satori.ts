// Synthwave arrangement of 少女さとり　～ 3rd eye (ZUN, 東方地霊殿), from ALFetite's piano transcription (alfetite.com/sheet-music/touhou/11-4-2).
import { transpose } from "../lib/score";
import type { SynthwaveBar, SynthwavePiece } from "./types";

const Bm7 = ["B3", "D4", "F#4", "A4"];
const Gmaj7 = ["G3", "B3", "D4", "F#4"];
const Cs7b9 = ["C#4", "E#4", "G#4", "B4", "D5"];
const Em7 = ["E4", "G4", "B4", "D5"];
const Fs7 = ["F#4", "A#4", "C#5", "E5"];
// E#dim7 and Em7 over the B pedal of the second tune
const EsDim7B = ["B3", "D4", "E#4", "G#4"];
const Em7B = ["B3", "E4", "G4", "D5"];
const G7 = ["G3", "B3", "D4", "F4"];

// [chord, chord for beats 3-4 or null, melody]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the original modulates up a semitone to C minor for its second half
const up = (lines: Line[]): Line[] =>
  lines.map(([c, c2, s]) => [
    c.map((n) => transpose(n, 1)),
    c2 && c2.map((n) => transpose(n, 1)),
    s
      .split(" ")
      .map((x) => {
        const [note, n] = x.split(":");
        const moved = note === "-" || note === "~" ? note : transpose(note, 1);
        return n ? `${moved}:${n}` : moved;
      })
      .join(" "),
  ]);

// the theme as written (score bars 1-8), low and creeping
const THEME: Line[] = [
  [Bm7, null, "B3:6 C#4 D4 F#4:2 B3:2 D4:2 F#4:2"],
  [Gmaj7, Bm7, "G4:2 B3:2 D4:2 G4:2 F#4:6 F#4:2"],
  [Cs7b9, Em7, "E#4:2 B3:2 C#4:2 E#4:2 E4:3 D4 ~:2 C#4:2"],
  [Fs7, null, "A#3:6 C#4 D4 F#4:2 E4 F#4 A#3:4"],
  [Bm7, null, "B3:4 C#4:2 D4 C#4 B3:3 D4 ~:2 F#4:2"],
  [Gmaj7, Bm7, "G4:2 A4:2 B4:2 G4:2 F#4:6 F#4:2"],
  [Cs7b9, null, "E#4:2 C#4:2 G#4:2 E#4:2 B4:2 E#4 G#4 B4 D5 C#5 B4"],
  [Fs7, null, "C#5:6 B4 C#5 B4 A#4 F#4:2 F#5:2 D5 C#5"],
];

// the theme an octave up (score bars 9-16), answering its held notes up the chord; the last bar is left open for the toms
const VERSE: Line[] = [
  [Bm7, null, "B4:6 C#5 D5 F#5:2 B4:2 D5:2 F#5:2"],
  [Gmaj7, Bm7, "G5:2 B4:2 D5:2 G5:2 F#5:6 F#5:2"],
  [Cs7b9, Em7, "E#5:2 B4:2 C#5:2 E#5:2 E5:4 B4 D5 E5 G5"],
  [Fs7, null, "A#4:6 C#5 D5 F#5:2 E5 F#5 C#6:2 A#5:2"],
  [Bm7, null, "B4:4 C#5:2 D5 C#5 B4:4 F#5 B5 D6:2"],
  [Gmaj7, Bm7, "G5:2 A5:2 B5:2 G5:2 F#5:4 D5 F#5 A5:2"],
  [Cs7b9, null, "E#5:2 C#5:2 G#5:2 E#5:2 B5:2 E#5 G#5 B5 D6 C#6 B5"],
  [Fs7, null, "C#6:8 A#5:2 F#5:2 -:4"],
];

// the second tune over a B pedal (score bars 26-33)
const TUNE: Line[] = [
  [Bm7, null, "F#5:8 B4:4 F#5:4"],
  [EsDim7B, null, "E#5:12 C#5:2 D5:2"],
  [Em7B, null, "E5:4 F#5:2 E5:2 D5:4 C#5:4"],
  [Bm7, null, "D5:6 C#5 C5 B4:6 F#4:2"],
  [Em7, null, "G4:4 F#4:2 G4:2 ~:4 B4:4"],
  [Fs7, null, "A#4:4 B4:2 C#5:2 ~:4 A#4:4"],
  [Bm7, Gmaj7, "B4:4 C#5:2 D5:2 ~:4 E5:4"],
  [Bm7, Fs7, "F#5:8 A#4:8"],
];

// the run up G7 into C minor (score bars 42-43), cut short for the toms
const TURN: Line = [G7, null, "G4 B4 D5 F5 G5:4 F5:2 D5:2 B4:4"];

// written in B minor and raised to C minor below: the theme's head as written and restruck, then broken up the chords
const CHORUS: Line[] = [
  [Bm7, null, "B4:6 C#5 D5 F#5:2 B4:2 D5:2 F#5:2"],
  [Gmaj7, Bm7, "G5:2 B4:2 D5:2 G5:2 F#5:6 F#5:2"],
  [Cs7b9, Em7, "E#5:2 B4:2 C#5:2 E#5:2 E5:2 E5 D5 ~:2 C#5:2"],
  [Fs7, null, "A#4:3 A#4:3 C#5:2 F#5:2 E5 F#5 A#5:4"],
  [Bm7, null, "B4:2 B5:2 C#5:2 D5 C#5 B4:3 D5 ~:2 F#5:2"],
  [Gmaj7, Bm7, "G5:2 A5:2 B5:2 G5:2 F#5:3 F#5:3 F#5:2"],
  [Cs7b9, null, "E#5:2 C#5:2 G#5:2 E#5:2 B5:2 E#5 G#5 B5 D6 C#6 B5"],
  [Fs7, null, "C#6:6 B5 C#6 B5 A#5 F#5:2 F#5:2 D5 C#5"],
  [Bm7, null, "B4 D5 F#5 B5 F#5 D5 B4 D5 F#5 B5 D6 B5 F#5:2 D5:2"],
  [Gmaj7, Bm7, "G5:2 B4:2 D5:2 G5:2 F#5 D5 B4 D5 F#5 B5 A5 F#5"],
  [Cs7b9, Em7, "E#5 C#5 G#4 C#5 E#5 G#5 E#5 C#5 E5 B4 G4 B4 D5 E5 D5 C#5"],
  [Fs7, null, "A#4:2 C#5:2 F#5:2 E5 F#5 A#5:4 F#5:2 C#5:2"],
  [Bm7, null, "B4 D5 F#5 B5 F#5 D5 B4 D5 F#5 B5 D6 B5 A5:2 F#5:2"],
  [Gmaj7, Bm7, "G5 B5 D6 B5 G5 B5 D6 B5 F#5:6 F#5:2"],
  [Cs7b9, null, "E#5 G#5 B5 G#5 E#5 G#5 B5 D6 C#6:4 B5:4"],
  [Fs7, null, "C#6:4 A#5:2 F#5:2 E5 F#5 A#5:2 C#6:2 D5 C#5"],
];

// the head as written, then split three-three-two, then the theme an octave up with its leaps answered; the last bar runs up the tonic (score bars 76-77) and drops back to B minor
const CHORUS2: Line[] = [
  ...CHORUS.slice(0, 2),
  [Cs7b9, Em7, "E#5:3 C#5:3 B4:2 E5:3 D5:3 C#5:2"],
  [Fs7, null, "A#4:3 C#5:3 F#5:2 E5:3 C#5:3 A#4:2"],
  [Bm7, null, "B4:3 D5:3 F#5:2 B5:3 A5:3 F#5:2"],
  [Gmaj7, Bm7, "G5:3 B5:3 G5:2 F#5:3 D5:3 B4:2"],
  [Cs7b9, null, "E#5:3 G#5:3 B5:2 D6:3 C#6:3 B5:2"],
  [Fs7, null, "C#6:6 B5 C#6 B5 A#5 F#5:2 F#5:2 D5 C#5"],
  [Bm7, null, "B5:6 C#6 D6 F#5:2 B5:2 D6:2 F#5:2"],
  [Gmaj7, Bm7, "G5:2 B5:2 D6:2 G5:2 F#5:6 F#5:2"],
  [Cs7b9, Em7, "E#5:2 B5:2 C#6:2 E#5:2 E5:3 D6 ~:2 C#6:2"],
  [Fs7, null, "A#5:6 C#6 D6 F#5:2 E5 F#5 A#5:4"],
  [Bm7, null, "B5:4 C#6:2 D6 C#6 B5:3 D6 ~:2 F#5:2"],
  [Gmaj7, Bm7, "G5:2 A5:2 B5:2 G5:2 F#5:6 F#5:2"],
  [Cs7b9, null, "E#5:2 C#5:2 G#5:2 E#5:2 B5:2 E#5 G#5 B5 D6 C#6 B5"],
  [Bm7, null, "B4 C#5 D5 F#5 B5:4 F#5:2 D5:2 C#5:4"],
];

type Flags = Omit<SynthwaveBar, "c" | "c2" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): SynthwaveBar[] =>
  lines.map(([c, c2, s], i) => ({ c, ...(c2 ? { c2 } : {}), m: m(s), ...flags(i) }));

const chorus = (i: number): Flags => ({ beat: true, bass: true, arp: true, crash: i % 8 === 0, fill: i % 8 === 7 });

const bars: SynthwaveBar[] = [
  ...section(THEME, (i) => ({ arp: true, open: 0.12 + i * 0.03, crash: i === 0, hat: i >= 4, bass: i >= 4, fill: i === 7 })),
  ...section(VERSE, (i) => ({ beat: true, bass: true, arp: true, open: 0.6, crash: i === 0, fill: i === 7 })),
  ...section([...TUNE.slice(0, 7), TURN], (i) =>
    i < 4 ? { bass: true, hat: true, open: 0.45, crash: i === 0 } : { beat: true, bass: true, arp: true, open: 0.5 + (i - 3) * 0.12, fill: i === 7 },
  ),
  ...section(up(CHORUS), chorus),
  ...section(up(TUNE), (i) => ({ sax: true, open: 0.3, arp: i >= 4, hat: i >= 6, crash: i === 0, fill: i === 7 })),
  ...section(up(CHORUS2), chorus),
  ...section(THEME.slice(0, 4), (i) => ({ arp: true, open: 0.3 - i * 0.04, crash: i === 0 })),
];

export const satori: SynthwavePiece = {
  kind: "synthwave",
  slug: "satori",
  title: "少女さとり　～ 3rd eye",
  description: "synthwave arrange / 108 BPM",
  bpm: 108,
  visual: "danmaku",
  // neon pink, cyan, violet, sky
  hues: [326, 184, 296, 204],
  bars,
};
