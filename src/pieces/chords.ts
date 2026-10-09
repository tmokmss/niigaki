import type { Bar } from "./types";

export const V = {
  Dbmaj9: ["Db2", "Ab2", "C3", "Eb3", "F3"],
  Dbmaj7: ["Db2", "Ab2", "C3", "F3", "Ab3"],
  Cm7: ["C2", "G2", "Bb2", "Eb3", "G3"],
  Fm9: ["F2", "C3", "Eb3", "G3", "Ab3"],
  Ebsus: ["Eb2", "Bb2", "Eb3", "F3", "Ab3"],
  Bbm9: ["Bb1", "F2", "Ab2", "C3", "Db3"],
  Bbm7: ["Bb1", "F2", "Ab2", "Db3", "F3"],
  Gbmaj7s11: ["Gb1", "Db2", "F2", "Bb2", "C3"],
  Absus: ["Ab1", "Eb2", "Bb2", "Db3", "Eb3"],
  Ab: ["Ab1", "Eb2", "Ab2", "C3", "Eb3"],
  Fsus4: ["F1", "C2", "F2", "Bb2", "C3"],
  F: ["F1", "C2", "F2", "A2", "C3"],
};

export const BRIDGE: Bar[] = [
  { c: V.Bbm7, m: [["Db5", 0.5], ["Db5", 0.5], ["F5", 1], ["Bb5", 2]] },
  { c: V.Cm7, m: [["Bb5", 1], ["G5", 1], ["Eb5", 2]] },
  { c: V.Dbmaj7, m: [["F5", 1], ["Ab5", 1], ["C6", 2]] },
  { c: V.Ebsus, m: [["Bb5", 3], ["Ab5", 1]] },
  { c: V.Fm9, m: [["Ab5", 1], ["G5", 1], ["F5", 1], ["C5", 1]] },
  { c: V.Dbmaj7, m: [["Eb5", 2], ["F5", 2]] },
  { c: V.Gbmaj7s11, m: [["C6", 2], ["Bb5", 1], ["Ab5", 1]] },
  { c: V.Fsus4, c2: V.F, m: [["Bb5", 2], ["A5", 2]] },
];
