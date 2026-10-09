import { BRIDGE, V } from "./chords";
import type { Bar, Piece } from "./types";

const A: Bar[] = [
  { c: V.Dbmaj9, m: [["Eb5", 1], ["F5", 1], ["Ab5", 2]] },
  { c: V.Cm7, m: [["G5", 1], ["F5", 0.5], ["Eb5", 0.5], ["C5", 2]] },
  { c: V.Fm9, m: [["Ab4", 1], ["C5", 1], ["Eb5", 1], ["F5", 1]] },
  { c: V.Ebsus, m: [["G5", 3], ["Bb4", 1]] },
  { c: V.Dbmaj9, m: [["Eb5", 1], ["F5", 1], ["Ab5", 1], ["C6", 1]] },
  { c: V.Bbm9, m: [["Bb5", 2], ["Ab5", 1], ["F5", 1]] },
  { c: V.Gbmaj7s11, m: [["F5", 1], ["C5", 1], ["Db5", 2]] },
  { c: V.Absus, c2: V.Ab, m: [["Eb5", 4]] },
];

const all = { lh: true, mel: true, pad: true };

export const snowLight: Piece = {
  slug: "snow-light",
  title: "Snow Light",
  description: "piano / pad",
  bpm: 68,
  bars: [
    { c: V.Dbmaj9, m: [], ...all },
    { c: V.Dbmaj9, m: [], ...all },
    ...A.map((b) => ({ ...b, ...all })),
    ...BRIDGE.map((b) => ({ ...b, ...all })),
    ...A.map((b) => ({ ...b, ...all, oct: true })),
    { c: V.Dbmaj9, m: [["Eb5", 1], ["F5", 1], ["Ab5", 2]], s: 1.15, ...all },
    { c: V.Gbmaj7s11, m: [["C6", 4]], s: 1.35, ...all },
  ],
};
