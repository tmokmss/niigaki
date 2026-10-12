// Uplifting trance arrangement of 竹取飛翔 ～ Lunatic Princess (ZUN, 東方永夜抄), from 東方ピアノEasyモード's hard MIDI (easypianoscore.jp),
// checked against the piano transcription in Touhou Piano Library (bloak.github.io/touhou_piano_library, th08_15).
// Everything sits in F minor: the B-flat-minor chorus of the original comes down a fourth (or up a fifth) to become the drops.
import type { TranceBar, TrancePiece } from "./types";

const Fm = ["F4", "Ab4", "C5", "G5"];
const Fm7 = ["F4", "Ab4", "C5", "Eb5"];
const Fm9 = ["F4", "Ab4", "C5", "Eb5", "G5"];
const Db = ["Db4", "F4", "Ab4", "C5"];
const Eb = ["Eb4", "G4", "Bb4", "F5"];
const Cm = ["C4", "Eb4", "G4", "Bb4"];
const Bbm = ["Bb3", "Db4", "F4", "C5"];
const C7 = ["C4", "E4", "G4", "Bb4"];
const Bb7D = ["D4", "F4", "Ab4", "Bb4"];
// the intro riff's chords over an F pedal
const FmF = ["F4", "Ab4", "C5"];
const BbmF = ["F4", "Bb4", "Db5"];
const BbF = ["F4", "Bb4", "D5"];

// [chord, chord for beats 3-4 or null, melody]
type Line = [string[], string[] | null, string];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

// the sixteenth-note riff over the F pedal (score bars 10-17), its F an octave up once the bass comes in; the last bar climbs to the theme's pickup
const RIFF: Line[] = [
  [FmF, BbmF, "F5 C6 Bb5 C6 F5 C6 Bb5 C6 F5 Db6 C6 Db6 F5 Db6 C6 Db6"],
  [BbF, BbmF, "F5 D6 Db6 D6 F5 D6 Db6 D6 F5 Db6 C6 Db6 F5 Db6 C6 Db6"],
  [FmF, BbmF, "F5 C6 Bb5 C6 F5 C6 Bb5 C6 F5 Db6 C6 Db6 F5 Db6 C6 Db6"],
  [BbF, BbmF, "F5 D6 Db6 D6 F5 D6 Db6 D6 F5 Db6 C6 Db6 F5 Db6 C6 Db6"],
  [FmF, BbmF, "F6 C6 Bb5 C6 F6 C6 Bb5 C6 F6 Db6 C6 Db6 F6 Db6 C6 Db6"],
  [BbF, BbmF, "F6 D6 Db6 D6 F6 D6 Db6 D6 F6 Db6 C6 Db6 F6 Db6 C6 Db6"],
  [FmF, BbmF, "F5 C6 Bb5 C6 F5 C6 Bb5 C6 F5 Db6 C6 Db6 F5 Db6 C6 Db6"],
  [BbF, BbmF, "F5 D6 Db6 D6 F5 D6 Db6 D6 F5 D6 Eb6 F6 F4:2 Ab4:2"],
];

// the theme (score bars 18-25), the high answer turned a little
const THEME: Line[] = [
  [Db, Eb, "Bb4:8 G4:8"],
  [Cm, Db, "Eb4:6 F4:2 F4:4 F4:2 Ab4:2"],
  [Bbm, Cm, "Bb4:4 Bb4:2 C5:2 Eb5:2 C5:2 Bb4:2 C5:2"],
  [Db, C7, "F5:4 C6:4 G5:4 F5:2 Ab5:2"],
  [Db, Eb, "Bb5:6 C6:2 G5:8"],
  [Cm, Db, "Eb5:4 G5:2 F5:2 F5:4 F5:2 Ab5:2"],
  [Bbm, Cm, "Bb5:4 Bb5:2 C6:2 Eb6:2 C6:2 Bb5:2 C6:2"],
  [Db, Eb, "F6:12 F4:2 Ab4:2"],
];

// the theme's F-A-flat-B-flat head on the supersaw, repeated closer and closer up the chords, landing on the theme's long F
const RISE: Line[] = [
  [Db, Eb, "F4:2 Ab4:2 Bb4:4 F4:2 Ab4:2 G4:4"],
  [Cm, Db, "F4:2 Ab4:2 Bb4:4 F4:2 Ab4:2 Ab4:4"],
  [Bbm, Cm, "F4:2 Ab4:2 Bb4:4 G4:2 Bb4:2 C5:4"],
  [Db, C7, "F5:2 Ab5:2 C6:4 G5:2 Bb5:2 C6:4"],
  [Db, Eb, "F5 Ab5 Bb5:2 F5 Ab5 Bb5:2 F5 Ab5 G5:2 F5 Ab5 G5:2"],
  [Cm, Db, "F5 Ab5 Bb5:2 F5 Ab5 Bb5:2 F5 Ab5 Ab5:2 F5 Ab5 Ab5:2"],
  [Bbm, Cm, "Bb5 Db6 F6 Db6 Bb5 Db6 F6 Db6 C6 Eb6 G6 Eb6 C6 Eb6 G6 Eb6"],
  [Db, Eb, "F6:12 -:4"],
];

// the chorus (score bars 61-76), the first half up a fifth and the second down a fourth; each half opens as written, then restrikes its long notes
const DROP: Line[] = [
  [Db, Eb, "C6:4 F5:4 C6:4 F5:4"],
  [Fm, null, "F5:2 Bb5:2 C6:2 Eb6:2 C6:2 Bb5:2 F5:4"],
  [Db, Eb, "C6:2 C6 C6 F5:2 F5:2 C6:3 C6:3 Eb6:2"],
  [Fm, null, "F6:2 C6:2 Eb6:2 C6:2 Bb5:2 G5:2 Ab5:2 C6:2"],
  [Db, Eb, "C6:4 F5:2 F5 F5 C6:4 F5:2 F5 F5"],
  [Fm, null, "F5:2 Bb5:2 C6:2 Eb6:2 F6:2 Eb6:2 C6:4"],
  [Db, Eb, "C6:2 C6 C6 F5:2 F5:2 C6:3 C6:3 Eb6:2"],
  [Fm, null, "C6 Ab5 F5 Ab5 C6 Ab5 F5 Ab5 G5 Eb5 C5 Eb5 G5 F5 Eb5 C5"],
  [Db, Eb, "F5:4 C5:4 F5:4 C5:4"],
  [Fm9, null, "G5:3 Ab5:3 Bb5:2 Ab5:2 G5:2 Eb5:4"],
  [Db, Eb, "Ab5:2 Ab5 Ab5 F5:2 F5 F5 G5:2 G5 G5 Bb5:2 Bb5 Bb5"],
  [Fm, null, "C6:2 C6 C6 Ab5:2 Ab5 Ab5 G5:2 F5:2 Eb5:2 C5:2"],
  [Db, Eb, "F5:4 C5:2 C5 C5 F5:4 C5:2 C5 C5"],
  [Fm9, null, "C5:2 G5:2 Ab5:2 Bb5:2 Ab5 Ab5 G5 G5 Eb5:4"],
  [Db, Eb, "Ab5:2 Ab5 Ab5 Db6:2 C6:2 Bb5:2 Bb5 Bb5 G5:2 Bb5:2"],
  [Fm, null, "F5:8 Ab5:8"],
];

// the falling eighth-note tune (score bars 36-43)
const BREAK: Line[] = [
  [Fm7, null, "F5:2 C5:2 Eb5:2 Bb4:2 C5:2 Ab4:2 Bb4:2 G4:2"],
  [Eb, null, "F5:2 C5:2 Eb5:2 Bb4:2 C5:2 Ab4:2 Bb4:2 G4:2"],
  [Db, null, "F5:2 C5:2 Eb5:2 Bb4:2 C5:2 Ab4:2 G5:2 Ab5:2"],
  [Db, null, "~:2 C5:2 G5:2 Bb4:2 F5:2 Ab4:2 Eb5:2 G4:2"],
  [Fm7, null, "F5:2 C5:2 Eb5:2 Bb4:2 C5:2 Ab4:2 Bb4:2 G4:2"],
  [Eb, null, "F5:2 C5:2 Eb5:2 Bb4:2 C5:2 Ab4:2 Bb4:2 G4:2"],
  [Bb7D, null, "F5:2 C5:2 Eb5:2 Bb4:2 C5:2 Ab4:2 G5:2 Ab5:2"],
  [Bb7D, null, "~:2 C5:2 Bb5:2 G5:2 Ab5:2 C5:2 G5:2 Bb4:2"],
];

// the same tune again (score bars 44-51): broken chords answer its first beats, then sixteenth restrikes, the F-E-flat trill and a climb onto C7
const BUILD2: Line[] = [
  [Db, null, "F5:2 C5:2 Eb5:2 Bb4:2 Db5 F5 Ab5 C6 Ab5 F5 Db5 F5"],
  [Eb, null, "F5:2 C5:2 Eb5:2 Bb4:2 Eb5 G5 Bb5 F6 Bb5 G5 Eb5 G5"],
  [Fm7, null, "F5:2 C5:2 Eb5:2 Bb4:2 C5:2 Ab4:2 G5:2 Ab5:2"],
  [Fm7, null, "~:2 C5:2 G5:2 Bb4:2 F5:2 Ab4:2 Eb5:2 G4:2"],
  [Db, null, "F5 F5 C5 C5 Eb5 Eb5 Bb4 Bb4 C5 C5 Ab4 Ab4 Bb4 Bb4 G4 G4"],
  [Eb, null, "F5 F5 C5 C5 Eb5 Eb5 Bb4 Bb4 C5 C5 Ab4 Ab4 Bb4 Bb4 G4 G4"],
  [Fm7, null, "F5 Eb5 F5 Eb5 F5 Eb5 F5 Eb5 F5 Eb5 F5 Eb5 F5 Eb5 F5 Eb5"],
  [Fm, C7, "F5:4 F5:4 E5 G5 Bb5 C6 -:4"],
];

// the chorus with octave leaps and broken chords; the last bar turns to C7 on the way back to the riff
const DROP2: Line[] = [
  [Db, Eb, "C6:4 F5:4 C6:4 F5:4"],
  [Fm, null, "F5:2 Bb5:2 C6:2 Eb6:2 C6:2 Bb5:2 F5:4"],
  [Db, Eb, "C6:2 C5:2 F5:2 F6:2 C6:4 F5:2 Eb6:2"],
  [Fm, null, "F6:2 C6:2 Eb6:2 C6:2 Bb5:2 G5:2 Ab5:2 C6:2"],
  [Db, Eb, "C6:2 C5:2 F5:2 F6:2 C6:4 F5:4"],
  [Fm, null, "F5:2 Bb5:2 C6:2 Eb6:2 F6:2 Eb6:2 C6:4"],
  [Db, Eb, "C6:2 C5:2 F5:2 F6:2 C6:4 F5:2 Eb6:2"],
  [Fm, null, "C6 Ab5 F5 Ab5 C6 Ab5 F5 Ab5 G5 Eb5 C5 Eb5 G5 F5 Eb5 C5"],
  [Db, Eb, "F5:4 C5:4 F5:4 C5:4"],
  [Fm9, null, "G5:3 Ab5:3 Bb5:2 Ab5:2 G5:2 Eb5:4"],
  [Db, Eb, "Ab5:2 Ab4:2 Db5:2 Db6:2 Eb5:2 Eb6:2 Bb5:2 G5:2"],
  [Fm, null, "F5:2 F6:2 C6:2 Ab5:2 F5:2 C5:2 Ab4:2 C5:2"],
  [Db, Eb, "F5:2 F6:2 C6:2 F5:2 F5:2 F6:2 C6:2 F5:2"],
  [Fm9, null, "G5:3 Ab5:3 Bb5:2 Ab5:2 G5:2 Eb5:4"],
  [Db, Eb, "Ab5:2 Ab4:2 Db5:2 Db6:2 Eb5:2 Eb6:2 Bb5:2 G5:2"],
  [Fm, C7, "F5:8 E5:4 G5:4"],
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

export const lunaticPrincess: TrancePiece = {
  kind: "trance",
  slug: "lunatic-princess",
  title: "竹取飛翔 ～ Lunatic Princess",
  description: "uplifting trance arrange / 138 BPM",
  bpm: 138,
  visual: "danmaku",
  // bamboo green, moonlit yellow-green, amber, crimson
  hues: [118, 58, 228, 92],
  bars,
};
