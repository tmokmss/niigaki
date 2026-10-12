// Orchestral arrangement of 幽雅に咲かせ、墨染の桜　～ Border of Life (ZUN, 東方妖々夢), from 東方ピアノEasyモード's score and MIDI (easypianoscore.jp).
// The B-flat-minor introduction on harp and flute; the C-sharp-minor theme on flute, then violins, then a build with horns;
// the D-minor climax (the running eighths, then the theme on the brass); a cello interlude on the introduction's figure;
// the theme's high strain in D minor for the full orchestra; a coda through G-flat to F, the introduction's own chords, back to the top.
import type { OrchestraBar, OrchestraPiece } from "./types";

// the cellos' root first, then the upper strings
const Gbmaj7 = ["Gb2", "Bb3", "Db4", "F4"];
const F7 = ["F2", "A3", "C4", "Eb4"];
const Gs7 = ["G#2", "G#3", "C4", "F#4"];

const Csm = ["C#3", "G#3", "C#4", "E4"];
const CsmB = ["B2", "G#3", "C#4", "E4"];
const A = ["A2", "A3", "C#4", "E4"];
const B = ["B2", "B3", "D#4", "F#4"];
const Fsm7 = ["F#2", "A3", "C#4", "E4"];
const Gsm7 = ["G#2", "B3", "D#4", "F#4"];
const A7 = ["A2", "G3", "C#4", "E4"];

const Dm = ["D3", "A3", "D4", "F4"];
const DmC = ["C3", "A3", "D4", "F4"];
const FC = ["C3", "A3", "C4", "F4"];
const Bb = ["Bb2", "Bb3", "D4", "F4"];
const C = ["C3", "G3", "C4", "E4"];
const Gm = ["G2", "Bb3", "D4", "G4"];
const Gm7 = ["G2", "Bb3", "D4", "F4"];
const Am = ["A2", "A3", "C4", "E4"];
const Am7 = ["A2", "G3", "C4", "E4"];
const Bbmaj7 = ["Bb2", "F3", "A3", "D4"];
const Gm9 = ["G2", "Bb3", "D4", "F4", "A4"];
const A7low = ["A2", "E3", "G3", "C#4"];

// [chord, chord for beats 3-4 or null, melody in sixteenths, countermelody]
type Line = [string[], string[] | null, string, string?];

// "E4 G4:2 -:4 ~:8" -> [note, sixteenths]; the length defaults to one sixteenth
const m = (s: string): [string, number][] =>
  s.split(" ").map((x) => {
    const [note, n] = x.split(":");
    return [note, Number(n ?? 1)];
  });

const section = (lines: Line[], flags: Omit<OrchestraBar, "c" | "c2" | "m" | "a"> = {}): OrchestraBar[] =>
  lines.map(([c, c2, mel, a]) => ({ c, ...(c2 ? { c2 } : {}), m: m(mel), ...(a ? { a: m(a) } : {}), ...flags }));
// per-bar settings on top of a section's
const at = (bars: OrchestraBar[], changes: Record<number, Partial<OrchestraBar>>) => bars.map((b, i) => ({ ...b, ...changes[i] }));

// the introduction: the harp's sixteenths over G-flat and F, then the flute's figure
const INTRO: Line[] = [
  [Gbmaj7, F7, "Gb4 Bb4 Db5 F5 Bb5 Db6 C6 A5 F5 Bb5 A5 F5 C5 A4 Gb4 Bb4"],
  [Gbmaj7, F7, "Db5 Gb5 Bb5 Db6 Bb5 Db6 Eb6 C6 A5 Db6 C6 A5 Eb5 F5 Db5 C5"],
  [Gbmaj7, F7, "Bb4 Gb4 Db5 Gb4 Ab5 Bb5 C6 Eb5 C6 Bb5 Db5 Bb5 A5 C5 A5 Ab5"],
  [Gbmaj7, F7, "Gb5 Eb5 Gb5 F5 Bb4 F5 Eb5 Ab4 Eb5 Db5 C5 Bb4 C5 Ab4 -:2"],
  [Gbmaj7, F7, "F5:2 Db5:2 Bb4:2 Eb5:2 C5:2 A4:4 F5:2"],
  [Gbmaj7, F7, "~:2 Db5:2 Bb4:2 Eb5:2 C5:2 A4:4 Gb5:2"],
  [Gbmaj7, F7, "F5:2 Db5:2 Bb4:2 Eb5:2 C5:2 A4:4 F5:2"],
  [Gbmaj7, Gs7, "~:2 Db5:2 Bb4:2 Gb5:2 Eb5:2 C5:4 -:2", "-:12 E4:2 F#4:2"],
];

// the C-sharp-minor theme, an octave up on the flute
const THEME_FLUTE: Line[] = [
  [Csm, null, "G#5:6 C#6:6 D#6:4"],
  [CsmB, null, "G#5:6 C#6:6 D#6:4"],
  [A, B, "E6:4 C#6:4 D#6:4 B5:4"],
  [Csm, null, "C#6:16"],
  [Fsm7, null, "G#5:6 B5:6 C#6:4"],
  [Gsm7, null, "F#5:6 B5:6 C#6:4"],
  [A, B, "E5:4 C#5:4 D#5:4 B4:4"],
  [Csm, null, "C#5:16", "-:12 E4:2 F#4:2"],
];

// its high strain on the violins, the cellos answering below
const STRAIN: Line[] = [
  [Csm, null, "G#4:6 C#5:6 D#5:4", "E4:6 C#4:6 B3:4"],
  [CsmB, null, "G#4:6 C#5:6 D#5:4", "G#3:12 A3:2 B3:2"],
  [A, B, "E5:4 F#5:4 G#5:4 B5:4", "C#4:8 D#4:8"],
  [Csm, null, "G#5:16", "E4:4 D#4:2 C#4:2 B3:4 G#3:4"],
  [Fsm7, null, "G#5:6 C#5:6 G#5:4", "A3:12 G#3:4"],
  [Gsm7, null, "G#5:6 C#5:6 G#5:4", "B3:12 A#3:4"],
  [A, B, "C#5:4 D#5:4 G#5:4 B5:4", "C#4:8 D#4:8"],
  [Csm, null, "C#6:16", "E4:4 D#4:4 C#4:8"],
];

// the theme again on the violins in octaves, the horns' countermelody under it
const BUILD: Line[] = [
  [Csm, null, "G#5:6 C#6:6 D#6:4", "E4:6 G#4:6 F#4:4"],
  [CsmB, null, "G#5:6 C#6:6 D#6:4", "E4:6 D#4:6 E4:4"],
  [A, B, "E6:4 C#6:4 D#6:4 B5:4", "C#4:8 D#4:8"],
  [Csm, null, "C#6:8 B5:2 C#6:2 E6:2 D#6:2", "E4:4 F#4:4 G#4:8"],
  [Fsm7, null, "G#5:6 B5:6 C#6:4", "C#4:8 E4:8"],
  [Gsm7, null, "F#5:6 B5:6 C#6:4", "D#4:8 B3:8"],
  [A, B, "E5:4 C#5:4 D#5:4 B4:4", "A4:8 B4:8"],
  [Csm, null, "C#5:12 E4:2 F#4:2", "G#4:12 -:4"],
  [Csm, null, "G#4:6 C#5:6 D#5:4", "E4:6 G#4:6 F#4:4"],
  [CsmB, null, "G#4:6 C#5:6 D#5:4", "E4:6 D#4:6 E4:4"],
  [A, B, "E5:4 F#5:4 G#5:4 B5:4", "C#4:8 D#4:8"],
  [Csm, null, "G#5:8 F#5:2 E5:2 F#5:2 G#5:2", "E4:4 F#4:4 G#4:8"],
  [Fsm7, null, "G#5:6 C#5:6 G#5:4", "A4:12 G#4:4"],
  [Gsm7, null, "G#5:6 C#5:6 G#5:4", "B4:12 A#4:4"],
  [A, B, "C#5:4 D#5:4 G#5:4 B5:4", "E4:8 F#4:8"],
  [Csm, A7, "C#6:12 E5:2 G5:2", "G#4:8 G4:8"],
];

// the D-minor climax: the running eighths on violins and flutes
const RUN: Line[] = [
  [Dm, null, "A5:2 G5:2 F5:2 G5:2 A5:2 G5:2 F5:2 G5:2"],
  [FC, null, "A5:2 G5:2 F5:2 G5:2 A5:2 G5:2 F5:2 G5:2"],
  [Bb, C, "D6:2 A5:2 D6:2 A5:2 C6 G5 E5 C6 G5 E5 C6 E5"],
  [Dm, null, "A5:2 G5:2 F5:2 E5:2 F5 E5 D5 C5 A4:2 G4:2"],
  [Gm, null, "D5:2 A4:2 D5:2 A4:2 G4 A4 E4 F4 D4:2 C4:2"],
  [Am, null, "E5:2 A4:2 E5:2 A4:2 E5:2 F5 G5:2 G5 F5 E5"],
  [Bb, C, "F5 D5 A4 F5 D5 A4 F5 A4 G5 E5 C5 G5 E5 C5 G5 C5"],
  [Dm, null, "F5:2 D6:2 F5:2 E6:2 F5:2 F6:3 E6 D6 C6"],
];

// the theme on horns and trumpets, trombones an octave down, the violins running above
const BRASS: Line[] = [
  [Dm, null, "A4:6 D5:6 E5:4", "A5:2 G5:2 F5:2 G5:2 A5:2 G5:2 F5:2 G5:2"],
  [DmC, null, "A4:6 D5:6 E5:4", "A5:2 G5:2 F5:2 G5:2 A5:2 G5:2 F5:2 G5:2"],
  [Bb, C, "F5:4 D5:4 E5:4 C5:4", "D6:2 A5:2 D6:2 A5:2 C6:2 G5:2 C6:2 G5:2"],
  [Dm, null, "D5:16", "A5:2 G5:2 F5:2 E5:2 F5 E5 D5 C5 A4:2 G4:2"],
  [Gm7, null, "A4:6 C5:6 D5:4", "D5:2 A4:2 D5:2 A4:2 D5:2 A4:2 D5:2 A4:2"],
  [Am7, null, "G4:6 C5:6 D5:4", "E5:2 A4:2 E5:2 A4:2 E5:2 F5 G5:3 F5 E5"],
  [Bb, C, "F4:4 D4:4 E4:4 C4:4", "F5:2 A4:2 F5:2 A4:2 G5:2 C5:2 G5:2 C5:2"],
  [Dm, null, "D4:16", "F5:2 D6:2 F5:2 E6:2 F5:2 F6:3 E6 D6 C6"],
];

// the introduction's figure in D minor: the solo cello, then the clarinet over the cello
const INTERLUDE: Line[] = [
  [Bbmaj7, A7low, "A4:2 F4:2 D4:2 G4:2 E4:2 C#4:4 A4:2"],
  [Bbmaj7, A7low, "~:2 F4:2 D4:2 G4:2 E4:2 C#4:4 Bb4:2"],
  [Gm9, A7low, "A4:2 F4:2 D4:2 Bb4:2 G4:2 E4:4 A4:2"],
  [Dm, A7low, "~:2 F4:2 D4:2 Bb4:2 G4:2 E4:2 -:4"],
  [Bbmaj7, A7low, "A5:2 F5:2 D5:2 G5:2 E5:2 C#5:4 A5:2", "Bb3:8 A3:8"],
  [Gm9, A7low, "~:2 F5:2 D5:2 G5:2 E5:2 C#5:4 Bb5:2", "G3:8 A3:8"],
  [Bbmaj7, A7low, "A5:4 G5:2 F5:2 E5:4 D5:2 C#5:2", "D4:8 E4:8"],
  [A7low, null, "A4:12 F4:2 G4:2", "C#4:16"],
];

// the high strain in D minor for everyone, the horns' countermelody inside, its leaps filled in
const FINALE: Line[] = [
  [Dm, null, "A4:6 D5:6 E5:4", "D4:6 F4:6 G4:4"],
  [DmC, null, "A4:6 D5:6 E5:4", "E4:6 F4:6 G4:4"],
  [Bb, C, "F5:4 G5:4 A5:4 C6:4", "F4:8 E4:8"],
  [Dm, null, "A5:16", "D4:4 E4:2 F4:2 G4:4 A4:4"],
  [Gm7, null, "A5:6 F5:2 D5:4 A5:4", "Bb4:12 A4:4"],
  [Am7, null, "A5:6 D5:6 A5:4", "C5:12 B4:4"],
  [Bb, C, "D5:2 E5:2 F5:2 G5:2 A5:4 C6:4", "F4:8 G4:8"],
  [Dm, null, "D6:12 A5:2 F5:2", "A4:8 F4:4 D4:4"],
];

// the coda falls through G-flat to F, the chords the introduction starts on
const CODA: Line[] = [
  [Bbmaj7, null, "D6:6 C6:6 A5:4"],
  [Gm9, null, "Bb5:6 A5:6 F5:4"],
  [Gbmaj7, null, "F5:6 Db5:6 Bb4:4"],
  [F7, null, "Eb5:2 C5:2 A4:12"],
];

export const borderOfLife: OrchestraPiece = {
  kind: "orchestra",
  slug: "border-of-life",
  title: "幽雅に咲かせ、墨染の桜　～ Border of Life",
  description: "orchestral arrange / 120 BPM",
  bpm: 120,
  visual: "danmaku",
  // cherry blossom, the ghost butterflies' blue-violet, pale sakura, dusk blue
  hues: [310, 250, 342, 222],
  bars: [
    ...at(section(INTRO.slice(0, 4), { lead: ["harp"], strings: "pad", dyn: 0.2 }), { 3: { timp: "roll", dyn: 0.3 } }),
    ...at(section(INTRO.slice(4), { lead: ["flute"], counter: "violin", strings: "pizz", dyn: 0.3 }), { 3: { harp: "gliss" } }),
    ...at(section(THEME_FLUTE, { lead: ["flute"], counter: "violin", strings: "pad", harp: "arp", dyn: 0.3 }), { 7: { dyn: 0.4 } }),
    ...at(section(STRAIN, { counter: "cello", strings: "pad", harp: "arp", dyn: 0.45 }), { 3: { harp: "gliss" }, 7: { dyn: 0.55, harp: "gliss" } }),
    ...at(section(BUILD, { low: ["violin"], strings: "pulse", dyn: 0.6 }), {
      0: { cymbal: "crash" },
      4: { timp: "hit", dyn: 0.65 },
      6: { timp: "hit" },
      7: { harp: "gliss", dyn: 0.7 },
      8: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, timp: "hit", dyn: 0.75 },
      9: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, dyn: 0.75 },
      10: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, timp: "hit", dyn: 0.8 },
      11: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, dyn: 0.8 },
      12: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, timp: "hit", dyn: 0.85 },
      13: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, dyn: 0.85 },
      14: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, timp: "hit", dyn: 0.9 },
      15: { lead: ["violin", "trumpet"], low: ["cello"], brass: true, timp: "roll", cymbal: "swell", harp: "gliss", dyn: 0.95 },
    }),
    ...at(section(RUN, { lead: ["violin", "flute"], low: ["violin"], strings: "pulse", brass: true, timp: "hit", dyn: 1 }), {
      0: { cymbal: "crash" },
      4: { cymbal: "crash" },
      7: { timp: "roll" },
    }),
    ...at(section(BRASS, { lead: ["trumpet", "horn"], low: ["trombone"], counter: "violin", strings: "pulse", brass: true, dyn: 1 }), {
      0: { cymbal: "crash", timp: "hit" },
      3: { timp: "hit" },
      4: { timp: "hit" },
      7: { timp: "hit", dyn: 0.6 },
    }),
    ...at(section(INTERLUDE, { lead: ["cello"], counter: "cello", strings: "tremolo", harp: "arp", dyn: 0.25 }), {
      0: { dyn: 0.2 },
      4: { lead: ["clarinet"] },
      5: { lead: ["clarinet"] },
      6: { lead: ["clarinet"], dyn: 0.35 },
      7: { lead: ["clarinet"], harp: "gliss", timp: "roll", cymbal: "swell", dyn: 0.7 },
    }),
    ...at(section(FINALE, { lead: ["violin", "trumpet"], low: ["cello", "trombone"], strings: "pulse", brass: true, timp: "hit", dyn: 1 }), {
      0: { cymbal: "crash" },
      4: { cymbal: "crash" },
      7: { timp: "roll", harp: "gliss" },
    }),
    ...at(section(CODA, { low: ["cello"], strings: "pad", brass: true, dyn: 0.8 }), {
      0: { timp: "hit" },
      1: { dyn: 0.55 },
      2: { lead: ["flute"], low: [], brass: false, harp: "arp", dyn: 0.35 },
      3: { lead: ["flute"], low: [], brass: false, timp: "roll", dyn: 0.2 },
    }),
  ],
};
