// Bossa nova arrangement of 恋色マスタースパーク (ZUN, 東方永夜抄), from 東方ピアノEasyモード's MIDI (easypianoscore.jp).
// The F-sharp-minor chorus is left out: the verses in F minor step up a whole tone into the G-minor chorus.
import type { BossaBar, BossaPiece } from "./types";

// the thumb plays the first note; the fingers the rest, kept below the flute

const Fm9 = ["F2", "Ab3", "Eb4", "G4", "C5"];
const Fm11 = ["F2", "Ab3", "Eb4", "Bb4", "C5"];
const Dbmaj9 = ["Db3", "F3", "C4", "Eb4", "Ab4"];
const Eb69 = ["Eb3", "G3", "C4", "F4", "Bb4"];
const Eb9sus4 = ["Eb3", "Ab3", "Db4", "F4", "Bb4"];
const Bbm9 = ["Bb2", "Db4", "F4", "Ab4", "C5"];
const Abmaj9 = ["Ab2", "C4", "Eb4", "G4", "Bb4"];
const C7b13 = ["C3", "E3", "Bb3", "Db4", "Ab4"];
const Cm9 = ["C3", "Eb4", "G4", "Bb4", "D5"];
const D7sus4b9 = ["D3", "G3", "C4", "Eb4"];
const D7b13 = ["D3", "Gb3", "Bb3", "C4"];
const Gm9 = ["G2", "Bb3", "F4", "A4", "D5"];
const Gm69 = ["G2", "Bb3", "E4", "A4", "D5"];
const Ebmaj9 = ["Eb3", "G3", "D4", "F4", "Bb4"];
const F9 = ["F2", "A3", "Eb4", "G4", "C5"];
const F9sus4 = ["F2", "Bb3", "Eb4", "G4", "C5"];

// [chord, chord for beats 3-4 or null, melody in sixteenths]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

const section = (lines: Line[], flags: Omit<BossaBar, "c" | "c2" | "m"> = {}): BossaBar[] =>
  lines.map(([c, c2, mel], i) => ({ c, ...(c2 ? { c2 } : {}), m: m(mel), ...flags, crash: i === 0 && flags.crash }));

// the rising C F G A-flat over held chords
const INTRO: Line[] = [
  [Fm9, null, "C5:16"],
  [Dbmaj9, Bbm9, "C5:4 F5:4 G5:4 Ab5:4"],
  [Fm9, null, "C5:16"],
  [Dbmaj9, Eb9sus4, "C5:4 F5:4 G5:4 Ab5:4"],
];

const VERSE: Line[] = [
  [Fm9, null, "C5:2 Eb5:2 F5:2 -:2 C5:2 Eb5:2 F5:2 -:2"],
  [Dbmaj9, null, "C5:2 Eb5:2 F5:2 C5:2 Ab5:2 G5 Ab5 F5:2 Eb5:2"],
  [Eb69, null, "Bb4:2 C5:2 Eb5:2 -:2 Bb4:2 C5:2 Eb5:2 -:2"],
  [Fm9, null, "C5:2 Eb5:2 F5:2 C5:2 C6:2 Bb5 C6 Ab5:2 G5:2"],
  [Fm9, null, "C5:2 Eb5:2 F5:2 -:2 C5:2 Eb5:2 F5:2 -:2"],
  [Dbmaj9, null, "C5:2 Eb5:2 F5:2 C5:2 Ab5:2 G5 Ab5 F5:2 Eb5:2"],
  [Abmaj9, Eb69, "Bb4:2 C5:2 Ab4:4 G4:4 Eb4:2 -:2"],
  [Bbm9, C7b13, "F4:2 C4:2 G4:2 C4:2 Ab4:4 Ab4:2 Bb4:2"],
];

// the long notes climbing to C, and a sus chord on D lifting the key a whole tone
const BRIDGE: Line[] = [
  [Fm9, null, "C5:12 Bb4:2 Eb5:2"],
  [Dbmaj9, null, "F5:10 C5:2 G5:2 Ab5:2"],
  [Eb69, null, "G5:8 Eb5:4 F5:4"],
  [Fm9, null, "C5:12 C5:2 Eb5:2"],
  [Fm11, null, "F5:12 C5:2 Eb5:2"],
  [Dbmaj9, null, "F5:10 C5:2 G5:2 Ab5:2"],
  [Eb69, null, "G5:8 Ab5:4 Bb5:4"],
  [Cm9, D7sus4b9, "C6:8 C6:2 Bb5:2 Ab5:2 G5:2"],
];

const CHORUS: Line[] = [
  [Gm9, null, "G5:2 A5:2 Bb5:2 -:2 A5:2 G5:2 F5:2 G5:2"],
  [Gm69, null, "~:10 D5:2 G5:2 D5:2"],
  [Ebmaj9, null, "G5:2 A5:2 Bb5:2 -:2 A5:2 G5:2 F5:2 D6:2"],
  [Ebmaj9, null, "~:10 C6:2 Bb5:2 A5:2"],
  [Cm9, F9, "G5:2 A5:2 Bb5:2 -:2 A5:2 G5:2 F5:2 D6:2"],
  [F9, D7b13, "~:2 C6:2 Bb5:2 C6:2 Bb5:2 A5:2 G5:2 F5:2"],
];

// the second chorus: an octave down with answers in the held bars, then split 3+3+2
const LOW: Line[] = [
  [Gm9, null, "G4:2 A4:2 Bb4:2 -:2 A4:2 G4:2 F4:2 G4:2"],
  [Gm69, null, "~:8 Bb4:2 D5:2 F5:2 A5:2"],
  [Ebmaj9, null, "G4:2 A4:2 Bb4:2 -:2 A4:2 G4:2 F4:2 D5:2"],
  [Ebmaj9, null, "~:8 G5:2 F5:2 D5:2 Bb4:2"],
  [Cm9, F9, "G4:2 A4:2 Bb4:2 -:2 A4:2 G4:2 F4:2 D5:2"],
  [F9, D7b13, "~:2 C5:2 Bb4:2 C5:2 Bb4:2 A4:2 G4:2 F4:2"],
];

const TRESILLO: Line[] = [
  [Gm9, null, "G5:3 A5:3 Bb5:2 A5:3 G5:3 F5:2"],
  [Gm69, null, "G5:8 D5:3 G5:3 D5:2"],
  [Ebmaj9, null, "G5:3 A5:3 Bb5:2 A5:3 G5:3 D6:2"],
  [Ebmaj9, null, "~:8 C6:3 Bb5:3 A5:2"],
  [Cm9, F9, "G5:3 A5:3 Bb5:2 A5:3 G5:3 D6:2"],
  [F9, D7b13, "~:2 C6:2 Bb5:2 C6:2 Bb5:3 A5:3 F5:2"],
];

// the first chorus again, each phrase slid into from a semitone below
const APPROACH: Line[] = [
  [Gm9, null, "Gb5 G5 A5:2 Bb5:2 -:2 A5:2 G5:2 F5:2 G5:2"],
  [Gm69, null, "~:10 Db5 D5 G5:2 D5:2"],
  [Ebmaj9, null, "Gb5 G5 A5:2 Bb5:2 -:2 A5:2 G5:2 F5:2 D6:2"],
  [Ebmaj9, null, "~:10 Db6 C6 Bb5:2 A5:2"],
  [Cm9, F9, "Gb5 G5 A5:2 Bb5:2 -:2 A5:2 G5:2 Gb5 F5 D6:2"],
  [F9, D7b13, "~:2 C6:2 Bb5:2 C6:2 Bb5:2 A5:2 G5:2 F5:2"],
];

// the intro's rising figure in G minor, drums out
const INTERLUDE: Line[] = [
  [Gm9, null, "D5:16"],
  [Ebmaj9, Cm9, "D5:4 G5:4 A5:4 Bb5:4"],
  [Gm9, null, "D5:16"],
  [Ebmaj9, F9sus4, "D5:4 G5:4 A5:4 Bb5:4"],
];

// climbing to a long G, then back down through C7 to the F minor of the intro
const OUTRO: Line[] = [
  [Ebmaj9, F9sus4, "Bb5:2 C6:2 D6:2 -:2 C6:2 D6:2 F6:2 G6:2"],
  [Gm9, null, "~:16"],
  [Ebmaj9, null, "~:8 -:4 G5:2 F5:2"],
  [C7b13, null, "E5:6 Db5:2 C5:4 -:4"],
];

const full = { beat: true, bass: true, crash: true };

export const masterSpark: BossaPiece = {
  kind: "bossa",
  slug: "master-spark",
  title: "恋色マスタースパーク",
  description: "bossa nova arrange / F minor → G minor / 132 BPM",
  bpm: 132,
  visual: "danmaku",
  // star gold, the forest's yellow-green, love pink, the spark's vermilion
  hues: [48, 100, 325, 18],
  bars: [
    ...section(INTRO, { guitar: "arp" }),
    ...section(VERSE, full),
    ...section(BRIDGE, { ...full, guitar: "arp" }),
    ...section([...CHORUS, ...APPROACH], full),
    ...section(INTERLUDE, { bass: true, guitar: "arp" }),
    ...section(LOW, { ...full, guitar: "arp" }),
    ...section(TRESILLO, { beat: true, bass: true, guitar: "strum" }),
    ...section(OUTRO.slice(0, 2), { ...full, guitar: "strum" }),
    ...section(OUTRO.slice(2), { bass: true, guitar: "arp" }),
  ],
};
