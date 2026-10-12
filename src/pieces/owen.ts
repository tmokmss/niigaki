// Electro swing arrangement of U.N.オーエンは彼女なのか？ (ZUN, 東方紅魔郷), from 東方ピアノEasyモード's MIDI (easypianoscore.jp).
// The music box intro's 5/4 bars become 4/4: the falling arpeggio in triplets, then its chord struck three times.
import type { SwingBar, SwingPiece } from "./types";

// the walking bass takes the first note; the piano the rest

const Bbm = ["Bb2", "Bb3", "Db4", "F4"];
const Bbm6 = ["Bb2", "Db4", "F4", "G4"];
const AbC = ["C3", "Eb4", "Ab4", "C5"];
const Ebm6 = ["Eb3", "Gb3", "C4", "Eb4"];
const Gbmaj7 = ["Gb2", "Bb3", "Db4", "F4"];
const AbEb = ["Eb3", "Eb4", "Ab4", "C5"];
const Adim7 = ["A2", "C4", "Eb4", "Gb4"];
const Am7 = ["A2", "G3", "C4", "E4"];
const C7 = ["C3", "Bb3", "E4", "G4"];
const B7 = ["B2", "A3", "D#4", "F#4"];
const Ab7 = ["Ab2", "C4", "Eb4", "Gb4"];
const Eb7G = ["G2", "Bb3", "Db4", "Eb4"];
const Bbsus4 = ["Bb2", "Eb4", "F4", "Bb4"];
const Dm = ["D3", "D4", "F4", "A4"];
const Bbmaj7 = ["Bb2", "D4", "F4", "A4"];
const C = ["C3", "G3", "C4", "E4"];
const A7Csharp = ["C#3", "G3", "A3", "E4"];
const Faug = ["C#3", "F4", "A4", "C#5"];

type Steps = [string, number][];
// [chord, chord for beats 3-4 or null, lead, saxophone answer]
type Line = [string[], string[] | null, Steps, Steps?];

// a sixteenth's place in a beat -> its triplet step: eighths swing long-short (4 + 2)
const SWING = [0, 2, 4, 5];
const at = (x: number) => Math.floor(x / 4) * 6 + SWING[x % 4];

// "F4:2 F5:2 -:4" in sixteenths -> [note, triplet steps]
const sw = (s: string): Steps => {
  let x = 0;
  return s.split(" ").map((tok) => {
    const [note, n] = tok.split(":");
    const from = at(x);
    x += Number(n ?? 1);
    return [note, at(x) - from];
  });
};

// "Bb5:2 F5:2 Eb5:2" already in triplet steps (24 per bar)
const tr = (s: string): Steps =>
  s.split(" ").map((tok) => {
    const [note, n] = tok.split(":");
    return [note, Number(n ?? 1)];
  });

const section = (lines: Line[], flags: Omit<SwingBar, "c" | "c2" | "m" | "a"> = {}): SwingBar[] =>
  lines.map(([c, c2, m, a], i) => ({ c, ...(c2 ? { c2 } : {}), m, ...(a ? { a } : {}), ...flags, crash: i === 0 && flags.crash }));

// the music box: the falling Db-Bb-F, then its chord struck on a swung 3+3+2
const box = (top: string) => tr(`Db6:2 Bb5:2 F5:2 Db6:2 Bb5:2 F5:2 ${top}:4 ${top}:6 ${top}:2`);
const INTRO: Line[] = [
  [Bbm, AbC, box("C6")],
  [Bbm, Ebm6, box("Eb6")],
  [Bbm, AbC, box("C6")],
  [Bbm, Ebm6, box("Eb6")],
  // then the arpeggio turns upwards, falls through the diminished chord and starts to swing
  [Gbmaj7, AbEb, tr("F5:2 Bb5:2 Db6:2 F5:2 Bb5:2 Db6:2 C6:4 C6:6 C6:2")],
  [Gbmaj7, Adim7, tr("F5:2 Bb5:2 Db6:2 F5:2 Bb5:2 Db6:2 Eb6:4 C6:4 A5:4")],
  [Bbm, AbC, tr("Db6:4 Bb5:2 F5:4 Db6:2 C6:4 C6:6 C6:2")],
  [Bbm, Ebm6, tr("Db6:4 Bb5:2 F5:4 Db6:2 Eb6:4 Eb6:6 Eb6:2")],
];

// the chromatic riff over Bb-A-C-B, an octave down for the trumpet: octaves first (low to high here), then low notes against high ones
const RIFF: Line[] = [
  [Bbm6, Am7, sw("Db4:4 Db5:4 C4:4 C5:4")],
  [C7, B7, sw("E4:4 E5:4 Eb4:4 Eb5:4")],
  [Bbm6, Am7, sw("F4:2 F5:2 Db4:2 F5:2 E4:2 E5:2 C4:2 E5:2")],
  [C7, B7, sw("G4:2 G5:2 E4:2 G5:2 Eb4:2 F#5:2 F#4:2 F#5:2")],
  // the high notes alone, chopped into stutters
  [Bbm6, Am7, sw("F5:2 F5:2 F5:2 F5:2 E5:2 E5:2 E5:4")],
  [C7, B7, sw("G5:2 G5:2 G5:2 G5:2 F#5:2 F#5:2 F#5:4")],
  [Bbm6, Am7, sw("F5:2 F5:2 F5:2 F5:2 E5:2 E5:2 E5:4")],
  [C7, B7, sw("G5:2 G5:2 G5:2 G5:2 F#5:2 F#5:2 -:4")],
];

// the Bb minor theme (score bars 17-24)
const THEME: Line[] = [
  [Gbmaj7, Ab7, sw("Bb4:4 F5:4 C5:4 F5:4")],
  [Bbm, Eb7G, sw("Db5:4 Eb5:2 F5:2 Eb5:4 G5:4")],
  [Gbmaj7, Ab7, sw("Bb5:2 F5:2 C6:2 Db6:2 C6:2 Db6 C6 Bb5:2 Ab5:2")],
  [Bbm6, null, sw("F5:2 Ab5:2 Eb5:2 F5:2 Db5:8"), sw("-:8 F4:2 Ab4:2 Bb4:2 Db5:2")],
  [Gbmaj7, Ab7, sw("Bb4:4 F5:4 C5:4 F5:4")],
  [Bbm, Eb7G, sw("Db5:4 Eb5:2 F5:2 Eb5:4 G5:4")],
  [Gbmaj7, Ab7, sw("Bb5:2 F5:2 C6:2 Db6:2 C6:2 Bb5:2 Ab5:2 F5:2")],
  [Bbm6, null, sw("Bb5:4 Ab5:2 F5:2 Db5:2 C5:2 Bb4:4")],
];

// the theme again on the Charleston rhythm, then an octave down with the saxophone answering in the gaps (picked with the scoring lab)
const THEME2: Line[] = [
  [Gbmaj7, Ab7, sw("Bb4:6 F5:2 -:4 C5:2 F5:2")],
  [Bbm, Eb7G, sw("Db5:6 Eb5:2 F5:4 G5:4")],
  [Gbmaj7, Ab7, sw("Bb5:2 F5:2 C6:2 Db6:2 C6:2 Db6 C6 Bb5:2 Ab5:2")],
  [Bbm6, null, sw("F5:2 Ab5:2 Eb5:2 F5:2 Db5:4 F4:2 Ab4:2")],
  [Gbmaj7, Ab7, sw("Bb4:4 -:4 C5:4 -:4"), sw("-:4 Db5:2 F5:2 -:4 Eb5:2 F5:2")],
  [Bbm, Eb7G, sw("Db5:4 -:4 Eb5:4 G4:4"), sw("-:4 F5:2 Ab5:2 -:8")],
  [Gbmaj7, Ab7, sw("Bb4:2 F4:2 C5:2 Db5:2 C5:2 Bb4:2 Ab4:2 F4:2")],
  [Bbm6, null, sw("Bb4:4 -:4 Bb4:2 Bb4:2 -:4")],
];

// D minor: the arpeggios in triplets (score bars 33-44) on the clarinet
const trip = (a: string, b: string) => tr(`${a} ${a} ${b} ${b}`.replace(/(\S+)/g, "$1:2"));
const BRIDGE: Line[] = [
  [Bbsus4, null, trip("Bb5 F5 Eb5", "Bb5 F5 Eb5")],
  // every second bar answers itself in swung eighths (picked with the scoring lab)
  [Bbsus4, null, tr("Bb5:2 F5:2 Eb5:2 Bb5:2 F5:2 Eb5:2 F5:4 Eb5:2 C5:4 Bb4:2")],
  [Dm, null, trip("A5 F5 D5", "A5 F5 D5")],
  [Dm, null, tr("A5:2 F5:2 D5:2 A5:2 F5:2 D5:2 E5:4 F5:2 G5:4 A5:2")],
  [Bbmaj7, C, trip("A5 F5 D5", "G5 E5 C5")],
  [Dm, null, tr("F5:2 D5:2 A4:2 E5:2 F5:2 G5:2 D5:6 -:4 A4 C5")],
  [Bbmaj7, C, trip("D5 A4 F4", "E5 C5 G4")],
  [A7Csharp, Dm, tr("E5:2 C#5:2 A4:2 E5:2 F5:2 G5:2 A5:12")],
  [Bbmaj7, C, trip("A5 F5 D5", "G5 E5 C5")],
  [Dm, null, tr("F5:2 D5:2 A4:2 E5:2 F5:2 G5:2 D5:6 -:4 A4 C5")],
  [Bbmaj7, C, trip("D5 A4 F4", "E5 C5 G4")],
  [A7Csharp, Faug, tr("E5:2 C#5:2 G4:2 E5:2 C#5:2 G4:2 A5:5 A5:5 A5:2")],
];

// back to Bb minor on the riff's bass line, long notes over the horn hits
const TURN: Line[] = [
  [Bbm6, Am7, sw("Db5:8 C5:8")],
  [C7, B7, sw("E5:8 Eb5:8")],
];

// the riff's second form (score bars 47-52), one low note against two high ones; the trumpet alone over the stop-time hits first
const RIFF2: Line[] = [
  [Bbm6, Am7, sw("Db4:2 F5:2 -:2 F5:2 C4:2 E5:2 -:2 E5:2")],
  [C7, B7, sw("E4:2 G5:2 -:2 G5:2 Eb4:2 F#5:2 -:2 F#5:2")],
  [Bbm6, Am7, sw("Db4:2 F5:2 -:2 F5:2 C4:2 E5:2 -:2 E5:2")],
  [C7, B7, sw("E4:2 G5:2 -:2 G5:2 Eb4:2 F#5:2 -:2 F#5:2")],
  [Bbm6, Am7, sw("F4:2 F5:2 Db4:2 F5:2 -:8"), sw("-:8 E4:2 E5:2 C4:2 E5:2")],
  [C7, B7, sw("-:8 Eb4:2 F#5:2 F#4:2 F#5:2"), sw("G4:2 G5:2 E4:2 G5:2 -:8")],
  [Bbm6, Am7, sw("F4:2 F5:2 Db4:2 F5:2 E4:2 E5:2 C4:2 E5:2")],
  [C7, B7, sw("G4:2 G5:2 E4:2 G5:2 Eb4:2 F#5:2 -:4")],
];

// the riff's octaves once more, then the music box over the riff's chords as the gramophone closes; B7 leans into the intro's Bb minor
const OUTRO: Line[] = [
  [Bbm6, Am7, sw("Db4:4 Db5:4 C4:4 C5:4")],
  [C7, B7, sw("E4:4 E5:4 Eb4:4 Eb5:4")],
  [Bbm6, Am7, box("C6")],
  [C7, B7, tr("E6:2 C6:2 G5:2 E6:2 C6:2 G5:2 Eb6:4 Eb6:6 Eb6:2")],
];

const band = { beat: true, bass: true };

export const owen: SwingPiece = {
  kind: "swing",
  slug: "owen",
  title: "U.N.オーエンは彼女なのか？",
  description: "electro swing arrange / 124 BPM",
  bpm: 124,
  visual: "danmaku",
  // Flandre's crimson, the yellow and violet of her wing crystals, the candlelit cellar
  hues: [8, 72, 296, 34],
  bars: [
    ...section(INTRO.slice(0, 4), { lead: "piano", open: 0.2 }),
    ...section(INTRO.slice(4, 6), { lead: "piano", bass: true, open: 0.35 }),
    ...section(INTRO.slice(6, 7), { lead: "piano", ...band, open: 0.6 }),
    ...section(INTRO.slice(7), { lead: "piano", ...band, fill: true, open: 1 }),
    ...section(RIFF.slice(0, 2), { ...band, stab: "charleston", crash: true }),
    ...section(RIFF.slice(2, 6), band),
    ...section(RIFF.slice(6, 7), { ...band, stab: "chop" }),
    ...section(RIFF.slice(7), { ...band, fill: true }),
    ...section(THEME.slice(0, 3), { ...band, crash: true }),
    ...section(THEME.slice(3, 4), { ...band, stab: "charleston" }),
    ...section(THEME.slice(4, 7), band),
    ...section(THEME.slice(7), { ...band, stab: "chop" }),
    ...section(THEME2.slice(0, 3), { ...band, stab: "charleston", crash: true }),
    ...section(THEME2.slice(3, 7), band),
    ...section(THEME2.slice(7), { ...band, stop: true }),
    ...section(BRIDGE.slice(0, 4), { lead: "clarinet", ...band, stop: true, crash: true }),
    ...section(BRIDGE.slice(4, 11), { lead: "clarinet", ...band, crash: true }),
    ...section(BRIDGE.slice(11), { lead: "clarinet", ...band, stab: "chop", fill: true }),
    ...section(TURN, { ...band, stab: "charleston", crash: true }),
    ...section(RIFF2.slice(0, 2), { ...band, stop: true, crash: true }),
    ...section(RIFF2.slice(2, 4), { ...band, stab: "charleston" }),
    ...section(RIFF2.slice(4, 7), band),
    ...section(RIFF2.slice(7), { ...band, fill: true }),
    ...section(THEME.slice(0, 3), { ...band, stab: "charleston", crash: true }),
    ...section(THEME.slice(3, 7), band),
    ...section(THEME2.slice(7), { ...band, stab: "chop" }),
    ...section(OUTRO.slice(0, 2), { ...band, crash: true, open: 0.7 }),
    ...section(OUTRO.slice(2), { lead: "piano", bass: true, open: 0.25 }),
  ],
};
