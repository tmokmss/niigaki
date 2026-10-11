import * as Tone from "tone";
import type { LofiPiece } from "../pieces/types";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// boom-bap in sixteenth-note-triplet steps (6 per beat): swung eighths fall on the 4th step of a beat
const STEPS = 24;
const KICK = [0, 10, 16];
const SNARE = [6, 18];
// the snare drags behind the beat
const SNARE_LAG = 0.03;

const cutoff = (open: number) => 300 * Math.pow(15, open);

export function renderLofi(piece: LofiPiece) {
  const beat = 60 / piece.bpm;
  const step = beat / 6;
  const barLen = beat * 4;
  const { events, add } = collector();
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let held: NoteEvent[] = [];

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const halves: [number, string[]][] = bar.c2 ? [[0, bar.c], [12, bar.c2]] : [[0, bar.c]];

    add(t, "open", [], barLen, bar.open ?? 1);
    for (const [s, c] of halves) {
      add(t + s * step, "keys", c, ((STEPS / halves.length) * step) * 0.98, 0.35 + rand() * 0.1);
    }
    if (bar.bass) {
      for (const s of [0, 12]) {
        const root = transpose((s && bar.c2 ? bar.c2 : bar.c)[0], -24);
        add(t + s * step, "bass", root, 9 * step, 0.9);
        add(t + (s + 10) * step, "bass", root, step * 1.6, 0.5);
      }
    }
    if (bar.beat) {
      for (const s of KICK) add(t + s * step, "kick", "C1", 0.5, s ? 0.75 : 0.95);
      for (const s of SNARE) add(t + s * step + SNARE_LAG, "snare", [], 0.2, 0.8);
      if (i % 2) add(t + 21 * step + SNARE_LAG, "snare", [], 0.1, 0.25);
      for (let s = 0; s < STEPS; s++) {
        if (s % 3 === 1) continue;
        const vel = s % 6 === 0 ? 0.6 : s % 6 === 3 ? 0.45 : 0.2;
        add(t + s * step + (rand() - 0.5) * 0.01, "hat", [], 0.03, vel * (0.85 + rand() * 0.3));
      }
    }
    if (bar.crash) add(t, "crash", [], 3, 0.6);

    // the lead sits a little behind the beat, each note late by a different amount
    let mt = t;
    for (const [note, n] of bar.m ?? []) {
      const dur = n * step;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else {
        add(mt + 0.01 + rand() * 0.03, "lead", note, dur * 0.95, 0.55 + rand() * 0.2);
        held = [events[events.length - 1]];
      }
      mt += dur;
    }
  });

  const end = piece.bars.length * barLen;
  return { events, end };
}


export function lofiKit(bpm: number): Kit {
  const beat = 60 / bpm;
  const out = new Tone.Compressor(-18, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());

  // tape: slow wow and faster flutter bend the pitch of everything, then the low-pass dulls the top
  const lowpass = new Tone.Filter({ frequency: cutoff(1), type: "lowpass", rolloff: -24 }).connect(out);
  const flutter = new Tone.Vibrato(6, 0.03).connect(lowpass);
  const tape = new Tone.Vibrato(0.35, 0.8);
  tape.connect(flutter);
  const reverb = new Tone.Reverb({ decay: 2.8, wet: 0.3 }).connect(tape);

  // Rhodes-like keys: FM with a 1:1 ratio, a soft bark at the attack and a slow tremolo
  const tremolo = new Tone.Tremolo(3.2, 0.35).start().connect(reverb);
  const keys = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 1,
    modulationIndex: 2.2,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.006, decay: 2.4, sustain: 0.3, release: 1.4 },
    modulationEnvelope: { attack: 0.002, decay: 0.5, sustain: 0.1, release: 0.6 },
    volume: -1,
  }).connect(tremolo);
  const lead = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 1,
    modulationIndex: 3.5,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.004, decay: 1.6, sustain: 0.25, release: 0.9 },
    modulationEnvelope: { attack: 0.002, decay: 0.35, sustain: 0.05, release: 0.4 },
    volume: -5,
  });
  lead.chain(new Tone.FeedbackDelay({ delayTime: beat * (2 / 3), feedback: 0.25, wet: 0.18 }), reverb);

  const bass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.15 },
    volume: -16,
  });
  bass.chain(new Tone.Filter(350, "lowpass"), tape);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 4,
    envelope: { attack: 0.002, decay: 0.45, sustain: 0, release: 0.1 },
    volume: -6,
  });
  kick.chain(new Tone.Filter(700, "lowpass"), tape);
  const snare = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.002, decay: 0.2, sustain: 0 }, volume: 2 });
  snare.chain(new Tone.Filter(2200, "lowpass"), new Tone.Filter(250, "highpass"), tape);
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 }, volume: -8 });
  hat.chain(new Tone.Filter(6000, "highpass"), tape);
  const crash = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.02, decay: 2.5, sustain: 0 }, volume: -28 });
  crash.chain(new Tone.Filter(3500, "highpass"), reverb);

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "open") {
        lowpass.frequency.exponentialRampTo(cutoff(e.vel), e.dur, time);
      } else if (e.voice === "keys") {
        // roll the chord upwards
        e.notes.forEach((n, k) => keys.triggerAttackRelease(n, e.dur - k * 0.015, time + k * 0.015, e.vel));
      } else if (e.voice === "lead") {
        lead.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        bass.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "snare") {
        snare.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      keys.releaseAll();
      lead.releaseAll();
      bass.releaseAll();
    },
  };
}
