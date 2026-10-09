export type NoteEvent = {
  t: number;
  voice: string;
  notes: string[];
  dur: number;
  vel: number;
};

export type Kit = {
  play: (e: NoteEvent, time: number) => void;
  releaseAll: () => void;
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

export function collector() {
  const events: NoteEvent[] = [];
  const add = (t: number, voice: string, notes: string | string[], dur: number, vel: number) =>
    events.push({ t, voice, notes: typeof notes === "string" ? [notes] : notes, dur, vel });
  return { events, add };
}

export function fitCanvas(canvas: HTMLCanvasElement) {
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
  };
  addEventListener("resize", resize);
  resize();
  return canvas.getContext("2d")!;
}
