// City pop arrangement of ネイティブフェイス (ZUN, 東方風神録), from 東方ピアノEasyモード's MIDI (easypianoscore.jp).
// The keys follow the original: the theme in D minor, the middle tune in A and F-sharp major, the brass hits in C minor, the theme again a semitone up.
import { transpose } from "../lib/score";
import type { CityPopBar, CityPopPiece } from "./types";

// the bass root first; the electric piano voices the rest

const Dm9 = ["D3", "C4", "E4", "F4", "A4"];
const Cadd9 = ["C3", "D4", "E4", "G4"];
const C9 = ["C3", "Bb3", "D4", "E4", "G4"];
const C11 = ["C3", "Bb3", "D4", "F4", "A4"];
const Bbmaj9 = ["Bb2", "A3", "D4", "F4", "C5"];
const Fmaj9 = ["F2", "A3", "C4", "E4", "G4"];
const Gm9 = ["G2", "Bb3", "D4", "F4", "A4"];
const A7sharp9 = ["A2", "G3", "C#4", "E4", "C5"];
const A7b13 = ["A2", "G3", "C#4", "F4"];

const Dmaj9 = ["D3", "C#4", "E4", "F#4", "A4"];
const E9 = ["E2", "D4", "F#4", "G#4", "B4"];
const E9sus4 = ["E2", "D4", "F#4", "A4", "B4"];
const Csharp7b13 = ["C#3", "B3", "F4", "A4"];
const Dmaj7sharp11 = ["D3", "C#4", "F#4", "G#4", "A4"];
const Fsharpm9 = ["F#2", "A3", "C#4", "E4", "G#4"];
const Fsharpm11 = ["F#2", "A3", "B3", "E4", "G#4"];
const Fsharp69 = ["F#2", "A#3", "C#4", "D#4", "G#4"];
const Bmaj9 = ["B2", "A#3", "C#4", "D#4", "F#4"];
const Csharp9 = ["C#3", "B3", "D#4", "F4", "G#4"];
const Csharp9sus4 = ["C#3", "B3", "D#4", "F#4", "G#4"];
const Asharp7b13 = ["A#2", "G#3", "D4", "F#4"];
const Bmaj7sharp11 = ["B2", "A#3", "D#4", "F4"];
const Dsharpm9 = ["D#2", "F#3", "A#3", "C#4", "F4"];
const Dsharpm11 = ["D#2", "F#3", "G#3", "C#4", "F4"];

const Ebmaj9 = ["Eb3", "D4", "F4", "G4", "Bb4"];
const G7b13 = ["G2", "F3", "B3", "Eb4"];
const Cm9 = ["C3", "Bb3", "D4", "Eb4", "G4"];
const Abmaj9 = ["Ab2", "G3", "Bb3", "C4", "Eb4"];
const Bb69 = ["Bb2", "G3", "C4", "D4", "F4"];
const Gm7 = ["G2", "F3", "Bb3", "D4"];
const Fm9 = ["F2", "Ab3", "C4", "Eb4", "G4"];
const Bb9sus4 = ["Bb2", "Ab3", "C4", "Eb4", "F4"];
const G7b9 = ["G2", "F3", "B3", "Ab4"];
const Bb7b9 = ["Bb2", "Ab3", "B3", "D4", "F4"];

// [chord, chord for beats 3-4 or null, melody in sixteenths]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

const section = (lines: Line[], flags: Omit<CityPopBar, "c" | "c2" | "m"> = {}): CityPopBar[] =>
  lines.map(([c, c2, mel], i) => ({ c, ...(c2 ? { c2 } : {}), m: m(mel), ...flags, crash: i === 0 && flags.crash }));

// a whole section a semitone up, chords and melody
const up = (lines: Line[]): Line[] =>
  lines.map(([c, c2, mel]) => [
    c.map((n) => transpose(n, 1)),
    c2 && c2.map((n) => transpose(n, 1)),
    mel
      .split(" ")
      .map((x) => {
        const [note, n] = x.split(":");
        const moved = note === "-" || note === "~" ? note : transpose(note, 1);
        return n ? `${moved}:${n}` : moved;
      })
      .join(" "),
  ]);

// the falling F-E-D-C# over held chords, then the running figure
const INTRO: Line[] = [
  [Dm9, Cadd9, "F5:8 E5:8"],
  [Bbmaj9, A7b13, "D5:8 C#5:6 E5:2"],
  [Dm9, Cadd9, "F5:2 D5:2 A4:2 F5:2 E5:2 C5:2 G4:2 E5:2"],
  [Bbmaj9, A7b13, "D5:2 Bb4:2 F4:2 D5:2 C#5:2 A4:2 E4:4"],
];

// the 3+3+2 hits, on the brass
const HITS: Line[] = [
  [Dm9, Bbmaj9, "F5:3 F5:3 F5:2 D5:3 D5:3 D5:2"],
  [Cadd9, A7b13, "E5:3 E5:3 E5:2 C#5:3 C#5:3 C#5:2"],
  [Dm9, Bbmaj9, "F5:3 F5:3 F5:2 D5:3 D5:3 D5:2"],
  [Cadd9, A7b13, "E5:3 E5:3 E5:2 C#5:4 -:2 C#5 E5"],
];

// the theme; its second half closes on Bbmaj7-A7-Dm, the Just The Two Of Us turn
const THEME: Line[] = [
  [Dm9, Bbmaj9, "A5:6 C6:2 D6:6 E6 F6"],
  [C9, Fmaj9, "E6:3 C6:3 D6:2 A5:4 F5:2 G5:2"],
  [Gm9, A7sharp9, "A5:6 C6:2 G5:3 E5:3 C5:2"],
  [Bbmaj9, null, "D5:12 A4:2 C5:2"],
  [Gm9, C11, "D5:6 C5 D5 F5:3 E5:3 C5:2"],
  [A7b13, null, "C#5:3 A4:3 G4:2 F4:3 E4:3 C4:2"],
  [Bbmaj9, C11, "D4:4 A4:4 G4:3 A4:3 C5:2"],
  [Bbmaj9, C11, "D5:2 A4:2 E5:2 A4:2 F5:4 F5:2 G5:2"],
];

// the second half split 3+3+2 like the hits
const SYNC: Line[] = [
  [Dm9, Bbmaj9, "A5:3 A5:3 C6:2 D6:6 E6 F6"],
  [C9, Fmaj9, "E6:3 C6:3 D6:2 A5:3 F5:3 G5:2"],
  [Gm9, A7sharp9, "A5:3 A5:3 C6:2 G5:3 E5:3 C5:2"],
  [Bbmaj9, null, "D5:3 D5:3 F5:2 E5:3 C5:3 C5:2"],
  [Gm9, C11, "D5:6 C5 D5 F5:3 E5:3 C5:2"],
  [A7b13, null, "C#5:3 A4:3 G4:2 F4:3 E4:3 C4:2"],
  [Bbmaj9, A7sharp9, "D4:3 A4:3 A4:2 G4:3 A4:3 C5:2"],
  [Dm9, null, "D5:3 D5:3 F5:2 E5:3 C5:3 A4:2"],
];

// the second half with turns in the long notes, then an octave up
const HIGH: Line[] = [
  [Dm9, Bbmaj9, "A5:4 G5 A5 C6:2 D6:4 C6 D6 E6 F6"],
  [C9, Fmaj9, "E6:2 D6 C6:3 D6:2 A5:2 G5 A5 F5:2 G5:2"],
  [Gm9, A7sharp9, "A5:4 G5 A5 C6:2 G5:3 E5:3 C5:2"],
  [Bbmaj9, null, "D5:8 F5:2 G5:2 A5:2 C6:2"],
  [Gm9, C11, "D6:6 C6 D6 F6:3 E6:3 C6:2"],
  [A7b13, null, "C#6:3 A5:3 G5:2 F5:3 E5:3 C5:2"],
  [Bbmaj9, A7sharp9, "D5:4 A5:4 G5:3 A5:3 C6:2"],
  [Dm9, null, "D6:8 -:2 A5:2 F5:2 E5:2"],
];

// the middle tune: IVmaj7-V-iii-vi in A major, then a minor third down in F-sharp major with the answers pushed
const MIDDLE: Line[] = [
  [Dmaj9, E9, "D5:3 E5:3 F#5:2 F#5:4 E5:4"],
  [Csharp7b13, Dmaj7sharp11, "C#5:3 F5:3 A5:2 G#5:3 F#5:3 C#5:2"],
  [Dmaj9, E9, "D5:3 E5:3 F#5:2 E5:3 F#5:3 G#5:2"],
  [Fsharpm9, null, "A5:6 C#6:3 A5 F#5 C#6 A5 F#5:3"],
  [Dmaj9, E9sus4, "C#5:4 F#4:2 A4:2 B4:4 A4:2 B4:2"],
  [Fsharpm11, null, "C#5:3 F#5:3 A5:2 G#5 F#5 C#5:2 B4 A4 G#4:2"],
  [Dmaj9, E9, "F#5:3 F#5:3 F#5:2 G#5:3 G#5:3 G#5:2"],
  [Fsharp69, null, "A#4:7 -:1 A#5:2 F#5:2 D#5:2 A#4:2"],
  [Bmaj9, Csharp9, "B4:3 C#5:3 D#5:2 -:2 D#5:2 C#5:2 A#4:2"],
  [Asharp7b13, Bmaj7sharp11, "A#4:3 D5:3 F#5:2 F5:3 D#5:3 A#4:2"],
  [Bmaj9, Csharp9, "B4:3 C#5:3 D#5:2 -:2 D#5:2 F5:2 G#5:2"],
  [Dsharpm9, null, "F#5:6 A#5:3 F#5 D#5 A#5 F#5 D#5:3"],
  [Bmaj9, Csharp9sus4, "A#4:4 D#4:2 F#4:2 G#4:4 F#4:2 G#4:2"],
  [Dsharpm11, null, "A#4:3 D#5:3 F#5:2 F5:2 D#5:2 A#4:2 G#4:2"],
  [Bmaj9, Csharp9, "D#5:3 D#5:3 D#5:2 F5:3 F5:3 F5:2"],
  [Ebmaj9, G7b13, "G5:3 G5:3 G5:2 G5:8"],
];

// the C-minor hits: first sung by the lead, then hit by the brass an octave up
const CLIMB: Line[] = [
  [Cm9, Abmaj9, "Eb5:6 G5:2 C5:8"],
  [Bb69, Gm7, "D5:6 F5:2 Bb4:8"],
  [Fm9, Gm7, "Ab4:6 C5:2 Bb4:8"],
  [Abmaj9, null, "C5:3 Eb5:3 G5:2 C5:8"],
  [Abmaj9, Bb9sus4, "C5:6 Eb5:2 D5:8"],
  [G7b9, null, "B4:6 D5:2 F5:8"],
  [Abmaj9, Bb9sus4, "C5:6 Eb5:2 D5:8"],
  [Cm9, null, "Eb5:8 C5:4 G4:4"],
  [Cm9, Abmaj9, "Eb5:3 Eb5:3 Eb5:2 C5:3 C5:3 C5:2"],
  [Bb69, Gm7, "D5:3 D5:3 D5:2 Bb4:3 Bb4:3 Bb4:2"],
  [Fm9, Gm7, "Ab4:3 Ab4:3 Ab4:2 Bb4:3 Bb4:3 Bb4:2"],
  [Abmaj9, null, "C5:3 C5:3 C5:2 C5:8"],
  [Abmaj9, Bb9sus4, "C5:3 C5:3 C5:2 D5:3 D5:3 D5:2"],
  [G7b9, null, "B4:3 B4:3 B4:2 D5:3 D5:3 D5:2"],
  [Abmaj9, Bb9sus4, "C5:3 C5:3 C5:2 D5:3 D5:3 D5:2"],
  [Fm9, Bb7b9, "Ab5:3 A5:3 Bb5:2 B5:3 C6:3 Db6:2"],
];

// the falling major sevenths B-Bb-A back to the D minor of the intro
const OUTRO: Line[] = [
  [Bmaj9, Bbmaj9, "F#5:3 F#5:3 F#5:2 F5:3 F5:3 F5:2"],
  [A7b13, null, "E5:3 E5:3 E5:2 C#5:6 -:2"],
];

const band = { beat: true, bass: true, guitar: true };

export const nativeFaith: CityPopPiece = {
  kind: "citypop",
  slug: "native-faith",
  title: "ネイティブフェイス",
  description: "city pop arrange / 112 BPM",
  bpm: 112,
  visual: "danmaku",
  // the frog's yellow-green, the lake's blue, a sunset red, the iron ring's green
  hues: [81, 197, 8, 118],
  bars: [
    ...section(INTRO.slice(0, 2)),
    ...section(INTRO.slice(2), { bass: true }),
    ...section(HITS, { ...band, brass: true, crash: true }),
    ...section(THEME, { ...band, crash: true }),
    ...section(SYNC, { ...band, crash: true }),
    ...section(MIDDLE.slice(0, 6), { ...band, crash: true }),
    ...section(MIDDLE.slice(6, 7), { ...band, brass: true }),
    ...section(MIDDLE.slice(7, 8), band),
    ...section(MIDDLE.slice(8, 14), { ...band, crash: true }),
    ...section(MIDDLE.slice(14), { ...band, brass: true }),
    ...section(CLIMB.slice(0, 8), { ...band, crash: true }),
    ...section(CLIMB.slice(8), { ...band, brass: true, crash: true }),
    ...section(up(THEME), { ...band, crash: true }),
    ...section(up(HIGH), { ...band, crash: true }),
    ...section(OUTRO, { ...band, brass: true }),
  ],
};
