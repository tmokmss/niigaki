// Uplifting trance arrangement of Bad Apple!! (ZUN, 東方幻想郷), from 東方ピアノEasyモード's easy score and MIDI (easypianoscore.jp).
// The original's keys stay: E-flat minor for the riff, the theme and the long-note tune, G minor for the chorus that becomes the second drop.
// The theme's first bar leaps to the upper E-flat, as the original is remembered, where the easy score keeps the lower one.
import type { TranceBar, TrancePiece } from "./types";

const Ebm = ["Eb4", "Gb4", "Bb4", "F5"];
const Ebm7 = ["Eb4", "Gb4", "Bb4", "Db5"];
const Cb = ["Cb4", "Eb4", "Gb4", "Bb4"];
const Db = ["Db4", "F4", "Ab4", "Eb5"];
const Dbsus = ["Db4", "Gb4", "Ab4", "Eb5"];
const Bb7 = ["Bb3", "D4", "F4", "Ab4"];
const Bb7D = ["D4", "F4", "Ab4", "Bb4"];
const Eb = ["Eb4", "G4", "Bb4", "D5"];
const F = ["F4", "A4", "C5", "G5"];
const Gm = ["G4", "Bb4", "D5", "F5"];

// [chord, chord for beats 3-4 or null, melody]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the sixteenth-note riff (score bars 5-8) an octave up, twice, the second time with its rests answered; the last bar climbs the dominant
const RIFF: Line[] = [
  [Ebm, null, "Bb5 Eb5 F5 Gb5 -:1 Eb5 F5 Gb5 -:4 Db6 Eb6 Ab5:2"],
  [Ebm, null, "Bb5 Eb5 F5 Gb5 -:1 Eb5 F5 Gb5 -:2 Db6 Eb6 Bb5 Ab5 F5:2"],
  [Cb, null, "Gb5:2 -:2 Cb5 Db5 Eb5 Gb5:3 -:2 Cb5 Db5 Eb5 Gb5"],
  [Cb, Bb7, "Cb5 Db5 Eb5 Gb5 -:1 Eb5 Gb5 Cb5 D5 Eb5 F5:3 Ab5 Gb5 F5"],
  [Ebm, null, "Bb5 Eb5 F5 Gb5 -:1 Eb5 F5 Gb5 Bb5:2 Gb5:2 Db6 Eb6 Ab5:2"],
  [Ebm, null, "Bb5 Eb5 F5 Gb5 -:1 Eb5 F5 Gb5 Ab5 Bb5 Db6 Eb6 Bb5 Ab5 F5:2"],
  [Cb, null, "Gb5:2 Eb5:2 Cb5 Db5 Eb5 Gb5:3 Bb5:2 Cb5 Db5 Eb5 Gb5"],
  [Cb, Bb7, "Cb5 Db5 Eb5 Gb5 -:1 Eb5 Gb5 Cb5 D5 Eb5 F5:2 Ab5 Bb5 D6:2"],
];

// the theme (score bars 13-20)
const THEME: Line[] = [
  [Ebm7, null, "Eb4:2 F4:2 Gb4:2 Ab4:2 Bb4:4 Eb5:2 Db5:2"],
  [Ebm7, null, "Bb4:4 Eb4:4 Bb4:2 Ab4:2 Gb4:2 F4:2"],
  [Cb, null, "Eb4:2 F4:2 Gb4:2 Ab4:2 Bb4:4 Ab4:2 Gb4:2"],
  [Db, Bb7D, "F4:2 Bb3:2 F4:2 Gb4:2 F4:2 Eb4:2 D4:2 F4:2"],
  [Ebm7, null, "Eb4:2 F4:2 Gb4:2 Ab4:2 Bb4:4 Ab4:2 Db5:2"],
  [Ebm7, null, "Eb5:4 Eb5:4 F5:4 Gb5:4"],
  [Cb, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:4 Ab5:2 Gb5:2"],
  [Db, Bb7D, "Ab5:4 F5:4 Gb5:4 Ab5:4"],
];

// the theme's rising five notes on the supersaw, closer and closer up the chords, then the dominant broken upwards
const RISE: Line[] = [
  [Ebm, null, "Eb4:2 F4:2 Gb4:2 Ab4:2 Bb4:8"],
  [Ebm, null, "Eb4:2 F4:2 Gb4:2 Ab4:2 Bb4:4 Db5:4"],
  [Cb, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:8"],
  [Db, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:4 Db6:4"],
  [Ebm, null, "Eb5 F5 Gb5 Ab5 Bb5:4 Eb5 F5 Gb5 Ab5 Bb5:4"],
  [Cb, null, "Eb5 F5 Gb5 Ab5 Bb5:2 Gb5:2 Eb5 F5 Gb5 Ab5 Bb5:2 Gb5:2"],
  [Db, Bb7D, "F5 Ab5 Db6 Ab5 F5 Ab5 Db6 Ab5 F5 Ab5 D6 Ab5 F5 Ab5 D6 Ab5"],
  [Bb7, null, "Bb5:4 D6:4 F6:4 -:4"],
];

// the theme an octave up, twice; each half opens as written, then restrikes its long notes, the second with broken chords and octave leaps
const DROP: Line[] = [
  [Ebm, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:4 Eb6:2 Db6:2"],
  [Ebm, null, "Bb5:4 Eb5:4 Bb5:2 Ab5:2 Gb5:2 F5:2"],
  [Cb, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:2 Bb5 Bb5 Ab5:2 Gb5:2"],
  [Db, Bb7D, "F5:2 Bb4:2 F5 F5 Gb5:2 F5:2 Eb5:2 D5 D5 F5:2"],
  [Ebm, null, "Eb5 Eb5 F5:2 Gb5 Gb5 Ab5:2 Bb5:4 Ab5:2 Db6:2"],
  [Ebm, null, "Eb6:2 Eb6 Eb6 Eb6:2 Eb6:2 F6:2 F6 F6 Gb6:2 Gb6:2"],
  [Cb, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:3 Ab5:3 Gb5:2"],
  [Db, Bb7D, "Ab5:3 Ab5:3 F5:2 Gb5:2 Gb5:2 Ab5:2 Ab5:2"],
  [Ebm, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:4 Eb6:2 Db6:2"],
  [Ebm, null, "Bb5:4 Eb5:4 Bb5:2 Ab5:2 Gb5:2 F5:2"],
  [Cb, null, "Eb5 Gb5 Bb5 Gb5 Eb5 F5 Gb5 Ab5 Bb5:2 Bb5:2 Ab5:2 Gb5:2"],
  [Db, Bb7D, "F5:2 Bb4:2 F5:2 Gb5:2 F5 Ab5 Eb5 F5 D5 F5 Bb5:2"],
  [Ebm, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5:2 Bb4:2 Ab5:2 Db6:2"],
  [Ebm, null, "Eb6:2 Eb5:2 Eb6:2 Eb5:2 F6:2 F5:2 Gb6:2 Gb5:2"],
  [Cb, null, "Eb5:2 F5:2 Gb5:2 Ab5:2 Bb5 Gb5 Eb5 Gb5 Ab5:2 Gb5:2"],
  [Db, Bb7D, "Ab5:2 Ab4:2 F5:2 F4:2 Gb5:2 Gb5:2 Ab5:4"],
];

// the long-note tune (score bars 21-28) an octave up
const BREAK: Line[] = [
  [Cb, null, "Eb5:8 Eb5:2 F5:2 Gb5:4"],
  [Db, null, "F5:6 Bb4:6 F5:4"],
  [Ebm7, null, "F5:6 Gb5:2 Eb5:4 Db5:4"],
  [Ebm7, null, "Db5:4 Eb5:2 Bb4:6 Eb5:4"],
  [Cb, null, "Eb5:8 Eb5:2 F5:2 Gb5:4"],
  [Db, Dbsus, "F5:6 Gb5:6 Ab5:4"],
  [Ebm7, null, "Eb5:6 Bb5:2 Bb5:8"],
  [Ebm7, Db, "~:8 Ab5:2 Bb5:2 Db6:4"],
];

// its second half (score bars 29-36), restruck ever faster down to sixteenths, falling onto the dominant before the key lifts
const BUILD2: Line[] = [
  [Cb, null, "Eb5:4 Eb5:4 Eb5:2 F5:2 Gb5:4"],
  [Db, null, "F5:3 F5:3 Bb4:3 Bb4:3 F5:4"],
  [Ebm, null, "F5:3 F5:3 Gb5:2 Eb5:4 Db5:4"],
  [Ebm, Db, "Db5:4 Eb5:2 Bb4:6 F5:4"],
  [Cb, null, "Eb5:2 Eb5:2 Eb5:2 Eb5:2 Eb5:2 F5:2 Gb5:2 Ab5:2"],
  [Db, Dbsus, "F5 F5 F5 F5 F5 F5 Gb5 Gb5 Gb5 Gb5 Gb5 Gb5 Ab5 Ab5 Ab5 Ab5"],
  [Bb7D, null, "D5 D5 D5 D5 D5 D5 Bb4 Bb4 Bb4 Bb4 Bb4 Bb4 Bb5 Bb5 Bb5 Bb5"],
  [Bb7D, null, "Ab5:4 Gb5:4 F5:4 -:4"],
];

// the G-minor chorus (score bars 37-52): each half opens as written, then leaps octaves and breaks its long notes into chords;
// the last bar turns to B-flat 7 on the way back to the riff
const DROP2: Line[] = [
  [Eb, F, "G5:2 D5:4 G5:4 Bb4:2 D5:2 F5:2"],
  [Gm, F, "G5:2 D5:2 Bb4:2 G5:4 G5:2 A5:2 Bb5:2"],
  [Eb, F, "G5:2 D5:2 D5:2 G5:2 G5:2 D5:2 G5:2 C6:2"],
  [Gm, F, "Bb5:3 Bb5:3 Bb5:2 A5:2 G5:2 F5:2 D5:2"],
  [Eb, F, "G5:2 D5:2 G4:2 G5:4 Bb4:2 D5:2 F5:2"],
  [Gm, F, "G5:2 D5:2 Bb4:2 G5:2 G4:2 G5:2 A5:2 Bb5:2"],
  [Eb, F, "G5:2 D5:4 G5:4 D5:2 G5:2 C6:2"],
  [Gm, null, "Bb5 G5 D5 G5 Bb5 G5 D5 G5 A5:4 Bb5:4"],
  [Eb, F, "G5:2 D5:4 G5:4 Bb4:2 D5:2 F5:2"],
  [Gm, F, "G5:2 D5:2 Bb4:2 G5:4 G5:2 A5:2 Bb5:2"],
  [Eb, F, "G5:2 D6:2 G5:2 D5:2 G5:2 D6:2 G5:2 C6:2"],
  [Gm, F, "Bb5:2 Bb4:2 D5:2 G5:2 A5:2 G5:2 F5:2 D5:2"],
  [Eb, F, "G5 Bb5 D6 Bb5 G5 D5 G5 Bb5 G5:2 Bb4:2 D5:2 F5:2"],
  [Gm, F, "G5:2 D5:2 Bb4:2 D5:2 G5:2 G5:2 A5:2 Bb5:2"],
  [Eb, F, "G5:2 D5:4 G5:4 D5:2 G5:2 A5:2"],
  [Gm, Bb7, "Bb5:8 Ab5:2 F5:2 D5:2 F5:2"],
];

type Flags = Omit<TranceBar, "c" | "c2" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): TranceBar[] =>
  lines.map(([c, c2, s], i) => ({ c, ...(c2 ? { c2 } : {}), m: m(s), ...flags(i) }));

const ROLLS = [4, 4, 8, 8, 16, 16, 32, 32] as const;
// eight bars of build: the snare roll tightens, the noise rises, the supersaws open, and the last beat falls silent
const build = (i: number): Flags => ({ chord: "pad", arp: i >= 2, roll: ROLLS[i], riser: true, open: 0.35 + i * 0.08, gap: i === 7 });
const drop = (i: number): Flags => ({ chord: "gate", arp: true, bass: true, kick: true, clap: true, hat: true, crash: i % 8 === 0 });

const bars: TranceBar[] = [
  ...section(RIFF, (i) => ({ lead: "pluck", chord: "pad", open: 0.15 + i * 0.03, kick: true, hat: i >= 2, clap: i >= 4, bass: i >= 4, crash: i % 4 === 0 })),
  ...section(THEME, (i) => ({ lead: "piano", chord: "pad", open: 0.25, crash: i === 0 })),
  ...section(RISE, build),
  ...section(DROP, drop),
  ...section(BREAK, (i) => ({ lead: "piano", chord: "pad", arp: i >= 4, open: 0.3, crash: i === 0 })),
  ...section(BUILD2, (i) => ({ ...build(i), kick: i < 4, bass: i < 4 })),
  ...section(DROP2, drop),
];

export const badApple: TrancePiece = {
  kind: "trance",
  slug: "bad-apple",
  title: "Bad Apple!!",
  description: "uplifting trance arrange / 138 BPM",
  bpm: 138,
  visual: "danmaku",
  // apple red, a shadow's blue-grey, crimson, moonlit indigo
  hues: [0, 215, 345, 235],
  bars,
};
