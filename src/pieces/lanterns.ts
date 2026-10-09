import { BRIDGE, V } from "./chords";
import type { Bar, Piece } from "./types";

// bar 1 is the hook: leap up a fifth, then fall through the pentatonic
const HOOK: Bar[] = [
  { c: V.Dbmaj7, m: [["Ab5", 0.5], ["Eb6", 0.5], ["C6", 1], ["Bb5", 0.5], ["Ab5", 0.5], ["F5", 1]] },
  { c: V.Ebsus, m: [["Eb5", 1.5], ["F5", 0.5], ["Ab5", 2]] },
  { c: V.Cm7, m: [["Ab5", 0.5], ["Eb6", 0.5], ["C6", 1], ["Bb5", 0.5], ["C6", 0.5], ["Eb6", 1]] },
  { c: V.Fm9, m: [["F6", 1.5], ["Eb6", 0.5], ["C6", 2]] },
  { c: V.Dbmaj7, m: [["F5", 0.5], ["C6", 0.5], ["Bb5", 1], ["Ab5", 0.5], ["F5", 0.5], ["Eb5", 1]] },
  { c: V.Bbm9, m: [["C5", 1.5], ["Eb5", 0.5], ["F5", 2]] },
  { c: V.Gbmaj7s11, m: [["Ab5", 0.5], ["Eb6", 0.5], ["C6", 1], ["Bb5", 0.5], ["Ab5", 0.5], ["F5", 1]] },
  { c: V.Absus, c2: V.Ab, m: [["Ab5", 4]] },
];

export const lanterns: Piece = {
  slug: "lanterns",
  title: "Lanterns",
  description: "piano / bell / pad",
  bpm: 76,
  ostinato: ["Ab4", "Eb5", "F5", "Eb5", "C5", "Eb5", "F5", "Bb4"],
  finalBell: "Ab5",
  bars: [
    { c: V.Dbmaj7, m: [], ost: true, pad: true },
    { c: V.Dbmaj7, m: [], ost: true, pad: true },
    ...HOOK.map((b) => ({ ...b, bell: true, ost: true, pad: true, lh: true })),
    ...BRIDGE.map((b) => ({ ...b, mel: true, lh: true, pad: true })),
    ...HOOK.map((b) => ({ ...b, mel: true, oct: true, bell: true, lh: true, pad: true, ost: true })),
    { ...HOOK[0], bell: true, pad: true, s: 1.3 },
    { c: V.Gbmaj7s11, m: [], pad: true, lh: true, s: 1.5 },
  ],
};
