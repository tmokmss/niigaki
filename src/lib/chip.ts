import * as Tone from "tone";
import type { ChipPiece } from "../pieces/types";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// sixteenth-note steps within a bar
const GROOVES = {
  four: { kick: [0, 4, 8, 12], snare: [4, 12] },
  half: { kick: [0, 6, 10], snare: [8] },
  break: { kick: [0, 10], snare: [4, 12] },
  three: { kick: [0, 8], snare: [4] },
};

// semitones from the chord root, one per eighth note
const BASSLINES = {
  octave: [-24, -12],
  fifth: [-24, -12, -17, -12],
};

export function renderChip(piece: ChipPiece) {
  const beat = 60 / piece.bpm;
  const six = beat / 4;
  const { events, add } = collector();
  const groove = GROOVES[piece.groove];
  const beats = piece.beats ?? 4;
  const steps = beats * 4;
  const half = steps / 2;
  let held: NoteEvent[] = [];

  let t = 0;
  for (const bar of piece.bars) {
    const [root, third, fifth] = bar.c;

    if (bar.arp) {
      const arp = [root, third, fifth, transpose(root, 12)];
      for (let i = 0; i < steps; i++) add(t + i * six, "arp", arp[i % 4], six * 0.9, 0.6);
    }
    if (bar.bass) {
      if (piece.bassline === "pulse") {
        for (let i = 0; i < steps; i++) add(t + i * six, "bass", transpose(root, -12), six * 0.7, i % 4 === 0 ? 1 : 0.7);
      } else {
        const line = BASSLINES[piece.bassline];
        for (let i = 0; i < half; i++) add(t + i * 2 * six, "bass", transpose(root, line[i % line.length]), six * 1.6, 0.9);
      }
    }
    if (bar.kick) {
      for (const s of groove.kick) add(t + s * six, "kick", "C1", 0.3, 1);
    }
    if (bar.snare) {
      for (const s of groove.snare.filter((s) => !bar.roll || s < half)) add(t + s * six, "snare", [], 0.15, 0.8);
    }
    if (bar.roll) {
      for (let i = half; i < steps; i++) add(t + i * six, "snare", [], 0.1, 0.3 + (i - half) * 0.08);
    }
    if (bar.hat === 8) {
      for (let i = 2; i < steps; i += 4) add(t + i * six, "hat", [], 0.04, 0.7);
    }
    if (bar.hat === 16) {
      for (let i = 0; i < steps; i++) add(t + i * six, "hat", [], 0.04, i % 4 === 2 ? 0.8 : 0.35);
    }
    if (bar.crash) add(t, "crash", [], 1.5, 0.8);

    let mt = t;
    for (const [note, n] of bar.m ?? []) {
      const dur = n * six;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else {
        add(mt, "lead", note, dur * 0.92, 0.8);
        held = [events[events.length - 1]];
        if (bar.harm) {
          add(mt, "harm", transpose(note, -12), dur * 0.92, 0.7);
          held.push(events[events.length - 1]);
        }
      }
      mt += dur;
    }
    t += beat * beats;
  }

  return { events, end: t };
}

export function chipKit(bpm: number): Kit {
  const out = new Tone.Compressor(-18, 3).toDestination();
  const delay = new Tone.FeedbackDelay({ delayTime: (60 / bpm) * 0.75, feedback: 0.25, wet: 0.18 }).connect(out);

  const lead = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.7, release: 0.05 },
    volume: -16,
  });
  lead.chain(new Tone.Vibrato(6, 0.08), delay);

  const harm = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "pulse", width: 0.25 },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.6, release: 0.05 },
    volume: -22,
  }).connect(delay);

  const arp = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "pulse", width: 0.125 },
    envelope: { attack: 0.002, decay: 0.06, sustain: 0.2, release: 0.02 },
    volume: -24,
  }).connect(out);

  const bass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.003, decay: 0.05, sustain: 0.9, release: 0.03 },
    volume: -6,
  }).connect(out);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    volume: -6,
  }).connect(out);

  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
    volume: -14,
  }).connect(out);

  const hat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
    volume: -24,
  });
  hat.chain(new Tone.Filter(8000, "highpass"), out);

  const crash = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 1.4, sustain: 0 },
    volume: -22,
  });
  crash.chain(new Tone.Filter(5000, "highpass"), out);

  const tonal = { lead, harm, arp, bass };
  const noise = { snare, hat, crash };

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice in tonal) tonal[e.voice as keyof typeof tonal].triggerAttackRelease(e.notes, e.dur, time, e.vel);
      else if (e.voice in noise) noise[e.voice as keyof typeof noise].triggerAttackRelease(e.dur, time, e.vel);
      else kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
    },
    releaseAll() {
      for (const synth of Object.values(tonal)) synth.releaseAll();
    },
  };
}
