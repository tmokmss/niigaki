import type { Piece } from "../pieces/types";

export type Voice = "piano" | "bell" | "mallet" | "pad";

export type NoteEvent = {
  t: number;
  voice: Voice;
  notes: string[];
  dur: number;
  vel: number;
};

const STEPS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function midi(note: string): number {
  const [, letter, accidental, octave] = /^([A-G])(#|b)?(\d)$/.exec(note)!;
  const shift = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return STEPS[letter] + shift + (Number(octave) + 1) * 12;
}

export function transpose(note: string, semis: number): string {
  const m = midi(note) + semis;
  return NAMES[m % 12] + (Math.floor(m / 12) - 1);
}

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

const ARPEGGIO = [0, 1, 2, 3, 4, 3, 2, 1];
const FINAL_CHORD = ["Ab1", "Eb2", "Ab2", "C3", "Bb3", "Eb4", "C5", "Eb5"];

export function render(piece: Piece): { events: NoteEvent[]; end: number } {
  const beat = 60 / piece.bpm;
  const events: NoteEvent[] = [];
  const add = (t: number, voice: Voice, notes: string | string[], dur: number, vel: number) =>
    events.push({ t, voice, notes: typeof notes === "string" ? [notes] : notes, dur, vel });

  let t = 0.2;
  for (const bar of piece.bars) {
    const s = bar.s ?? 1;
    const eighth = (beat / 2) * s;

    if (bar.lh) {
      ARPEGGIO.forEach((idx, i) => {
        const chord = bar.c2 && i >= 4 ? bar.c2 : bar.c;
        add(t + i * eighth, "piano", chord[idx % chord.length], eighth * 3, rand(0.2, 0.3) * (i === 0 ? 1.3 : 1));
      });
    }
    if (bar.ost && piece.ostinato) {
      piece.ostinato.forEach((note, i) => add(t + i * eighth, "mallet", note, eighth, i % 2 ? 0.5 : 0.8));
    }
    if (bar.pad) {
      add(t, "pad", bar.c.slice(2).map((n) => transpose(n, 12)), beat * 4 * s, 1);
    }

    let mt = t;
    for (const [note, beats] of bar.m) {
      const dur = beats * beat * s;
      const vel = rand(0.58, 0.7);
      if (bar.bell) add(mt, "bell", note, 1.2, bar.mel ? 0.35 : 0.6);
      if (bar.mel) add(mt, "piano", note, dur * 1.4, vel);
      if (bar.oct) add(mt + 0.012, "piano", transpose(note, -12), dur * 1.4, vel * 0.75);
      mt += dur;
    }
    t += beat * 4 * s;
  }

  FINAL_CHORD.forEach((n, i) => add(t + i * 0.09, "piano", n, beat * 8, 0.42 - i * 0.02));
  if (piece.finalBell) add(t + 0.8, "bell", piece.finalBell, 1.2, 0.4);
  add(t, "pad", ["C5", "Eb5", "Bb5"], beat * 6, 1);

  return { events, end: t + beat * 10 };
}
