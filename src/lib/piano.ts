import * as Tone from "tone";
import type { PianoPiece } from "../pieces/types";
import { collector, fitCanvas, midi, transpose, type Kit, type NoteEvent } from "./score";

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

const ARPEGGIO = [0, 1, 2, 3, 4, 3, 2, 1];
const FINAL_CHORD = ["Ab1", "Eb2", "Ab2", "C3", "Bb3", "Eb4", "C5", "Eb5"];

export function renderPiano(piece: PianoPiece) {
  const beat = 60 / piece.bpm;
  const { events, add } = collector();

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

  return { events, loopStart: 0, end: t + beat * 10 };
}

const SAMPLES = ["A0", "C1", "D#1", "F#1", "A1", "C2", "D#2", "F#2", "A2", "C3", "D#3", "F#3", "A3",
  "C4", "D#4", "F#4", "A4", "C5", "D#5", "F#5", "A5", "C6", "D#6", "F#6", "A6", "C7"];

export function pianoKit(bpm: number): Kit {
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.4 }).toDestination();

  const piano = new Tone.Sampler({
    urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    release: 1.6,
  }).connect(reverb);

  const bell = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 7,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.002, decay: 1.6, sustain: 0, release: 1.6 },
    modulationEnvelope: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.4 },
    volume: -15,
  });
  bell.chain(new Tone.FeedbackDelay({ delayTime: (60 / bpm) * 0.75, feedback: 0.22, wet: 0.18 }), reverb);

  const mallet = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 4,
    modulationIndex: 3,
    envelope: { attack: 0.002, decay: 0.5, sustain: 0, release: 0.5 },
    modulationEnvelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.2 },
    volume: -26,
  }).connect(reverb);

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 2.2, decay: 0.5, sustain: 0.8, release: 3.5 },
    volume: -26,
  });
  pad.chain(new Tone.Filter(1400, "lowpass"), reverb);

  return {
    play(e: NoteEvent, time: number) {
      const [note] = e.notes;
      if (e.voice === "piano") piano.triggerAttackRelease(note, e.dur, Math.max(0, time + (Math.random() - 0.5) * 0.02), e.vel);
      else if (e.voice === "bell") bell.triggerAttackRelease(note, e.dur, time, e.vel);
      else if (e.voice === "mallet") mallet.triggerAttackRelease(note, e.dur, time, e.vel);
      else pad.triggerAttackRelease(e.notes, e.dur, time, e.vel);
    },
    releaseAll() {
      piano.releaseAll();
      bell.releaseAll();
      pad.releaseAll();
    },
  };
}

type Dot = { x: number; y: number; r: number; a: number; gold: boolean };

export function sparks(canvas: HTMLCanvasElement) {
  const ctx = fitCanvas(canvas);
  const dots: Dot[] = [];

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      d.y += 0.25 * devicePixelRatio;
      d.a *= 0.985;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.gold ? `rgba(240,196,120,${d.a * 0.6})` : `rgba(216,219,226,${d.a * 0.5})`;
      ctx.fill();
      if (d.a < 0.01) dots.splice(i, 1);
    }
    requestAnimationFrame(draw);
  };
  draw();

  return (e: NoteEvent) => {
    if (e.voice !== "piano" && e.voice !== "bell") return;
    dots.push({
      x: ((midi(e.notes[0]) - 28) / 72) * canvas.width,
      y: canvas.height * rand(0.15, 0.6),
      r: (4 + e.vel * 14) * devicePixelRatio,
      a: e.vel,
      gold: e.voice === "bell",
    });
  };
}
