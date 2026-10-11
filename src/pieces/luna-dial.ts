// Lo-fi hip hop arrangement of 月時計 ～ ルナ・ダイアル (ZUN, 東方紅魔郷), from 東方ピアノEasyモード's MIDI (easypianoscore.jp)
// and the piano transcription in Touhou Piano Library (bloak.github.io/touhou_piano_library, th06_11).
// Each 4/4 bar of the original fills one bar here, its straight sixteenths swung long-short onto the triplet grid.
import type { LofiBar, LofiPiece } from "./types";

const Gm9 = ["G3", "Bb3", "D4", "F4", "A4"];
const F69 = ["F4", "A4", "D5", "G5"];
const Ebmaj9 = ["Eb4", "G4", "Bb4", "D5", "F5"];
const FoverA = ["A3", "C4", "F4", "G4"];
const Cm9 = ["C4", "Eb4", "G4", "Bb4", "D5"];
const Cm11 = ["C4", "Eb4", "G4", "Bb4", "F5"];
const Abmaj9 = ["Ab3", "C4", "Eb4", "G4", "Bb4"];
const Fm9 = ["F4", "Ab4", "C5", "Eb5", "G5"];
const G7b13 = ["G3", "B3", "F4", "Eb5"];
const D7b13 = ["D4", "F#4", "Bb4", "C5"];

// [chord, chord for beats 3-4 or the same, melody in sixteenths (16 per bar)]
type Line = [string[], string[], string];

// a sixteenth's place in a beat -> its triplet step: straight sixteenths swing long-short (2 + 1)
const SWING = [0, 2, 3, 5];
const at = (x: number) => Math.floor(x / 4) * 6 + SWING[x % 4] + (x % 1) * 2;

// "G5:2 D6:2 -:4" in sixteenths -> [note, triplet steps]
const swing = (s: string): [string, number][] => {
  let x = 0;
  return s.split(" ").map((tok) => {
    const [note, n] = tok.split(":");
    const from = at(x);
    x += Number(n ?? 1);
    return [note, at(x) - from];
  });
};

// the soldier's march in G minor: the hook and its three tails
const tail = ["C6 Bb5 A5:2", "F5:2 G5:2", "C6 D6 Eb6 F6", "C6 Bb5 A5:2"];
const hook = (end: string) => `G5:2 D6:2 C6:2 D6:2 A5 -:1 Bb5 D6 ${end}`;
const HOOK: Line[] = [
  [Gm9, Gm9, hook(tail[0])],
  [F69, F69, hook(tail[1])],
  [Ebmaj9, Ebmaj9, hook(tail[2])],
  [FoverA, FoverA, hook(tail[3])],
];

// the fourth time round the hook answers itself and lands on C for the theme (picked from the scoring lab's candidates)
const ANSWER: Line = [FoverA, FoverA, "G5:2 D6:2 C6:2 D6:2 Eb6 Eb6 D6 C6:2 C6 Bb5 C6"];

// the C minor theme over the pedal, then the climbing run that keeps falling back to the dominant
const THEME: Line[] = [
  [Cm9, Cm9, "G4:3 Eb5:3 D5:2 C5 -:1 Bb4 -:1 G4 -:1 Bb4 -:1"],
  [Abmaj9, Abmaj9, "G4:6 Eb5:2 F5 -:1 Gb5 -:1 F5 -:1 Eb5 F5"],
  [Cm9, Cm9, "G5:2 D6:2 Eb6:2 D6:2 C6 -:1 Bb5 -:1 G5 -:1 Bb5 -:1"],
  [Abmaj9, Abmaj9, "G5:6 Eb6:2 F6 -:1 Gb6 -:1 F6 -:1 Eb6 -:1"],
  [Cm9, G7b13, "C5:4 G4:2 C5:2 -:2 C5 D5 Eb5 F5 Eb5 D5"],
  [Abmaj9, G7b13, "C5:4 G4:2 C5:2 -:2 C5 D5 Eb5 F5 Eb5 D5"],
  [Fm9, G7b13, "C5:4 G4:2 C5:2 -:2 C5 D5 Eb5 F5 Eb5 D5"],
  [Cm11, G7b13, "C5:4 G4:2 C5:2 -:2 C5 D5 Eb5 F5 Eb5 D5"],
];

// the clock: Eb-D-Eb ticking, then the chromatic wobble an octave up
const CLOCK: Line[] = [
  [Cm9, Cm9, "-:8 Eb5:3 D5:3 Eb5:2"],
  [Abmaj9, Abmaj9, "-:6 Eb5:2 F5 -:1 Gb5 -:1 F5 -:1 Eb5 -:1"],
  [Cm9, Cm9, "-:8 Eb5:3 D5:3 Eb5:2"],
  [Cm11, D7b13, "-:6 Eb6:2 F6 -:1 Gb6 -:1 F6 -:1 Eb6 -:1"],
];

// the hook again, pushed late, thinned and run up through the chord
const HOOK2: Line[] = [
  [Gm9, Gm9, "-:2 G5:2 D6:2 C6:2 D6:2 Bb5 D6 C6 Bb5 A5:2"],
  [F69, F69, "G5:2 -:2 C6:2 D6:2 A5:4 F5:2 G5:2"],
  [Ebmaj9, Ebmaj9, "-:2 D6:2 C6:2 D6:2 A5 -:1 Bb5 D6 C6 D6 Eb6 F6"],
  [FoverA, FoverA, "G6:4 F6:2 D6:2 C6:4 A5:4"],
  [Gm9, Gm9, "G5:2 D6:2 -:4 A5:2 Bb5 D6 C6:2 A5:2"],
  [F69, F69, "G5:2 D6:2 C6:2 -:2 A5:2 G5:2 F5:2 G5:2"],
  [Ebmaj9, Ebmaj9, "G5 Bb5 D6 F6 Eb6:2 D6:2 Bb5:2 G5:2 C6 D6 Eb6 F6"],
  [FoverA, D7b13, "G6:6 F6:2 D6:4 C6:4"],
];

// the hook thinning out onto D7, which the intro's G minor resolves
const OUTRO: Line[] = [
  HOOK[0],
  HOOK[1],
  [Ebmaj9, Ebmaj9, "G5:2 D6:2 C6:2 D6:2 A5:8"],
  [D7b13, D7b13, "F#5:4 A5:4 D6:8"],
];

type Flags = Omit<LofiBar, "c" | "c2" | "m">;
const section = (lines: Line[], flags: (i: number) => Flags): LofiBar[] =>
  lines.map(([c, c2, s], i) => ({ c, ...(c2 === c ? {} : { c2 }), m: swing(s), ...flags(i) }));

const groove = { beat: true, bass: true };

const bars: LofiBar[] = [
  ...section(HOOK, (i) => ({ open: 0.4 + i * 0.08 })),
  ...section([...HOOK, ...HOOK.slice(0, 3), ANSWER], (i) => ({ ...groove, crash: i === 0 })),
  ...section(THEME, (i) => ({ ...groove, crash: i === 0 })),
  ...section(CLOCK, (i) => ({ bass: true, open: 0.3, crash: i === 0 })),
  ...section(HOOK2, (i) => ({ ...groove, crash: i === 0 })),
  ...section(OUTRO, (i) => ({ beat: i < 2, bass: i < 3, open: 0.75 - i * 0.12, crash: i === 0 })),
];

export const lunaDial: LofiPiece = {
  kind: "lofi",
  slug: "luna-dial",
  title: "月時計 ～ ルナ・ダイアル",
  description: "lo-fi arrange / G minor / 82 BPM",
  bpm: 82,
  visual: "danmaku",
  // moonlit steel, the mansion's crimson, the pocket watch's brass, dusk
  hues: [205, 2, 62, 318],
  bars,
};
