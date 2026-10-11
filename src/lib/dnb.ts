import * as Tone from "tone";
import type { DnbPiece } from "../pieces/types";
import { SAMPLES } from "./piano";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// two-step in sixteenth-note steps; every other bar the kick doubles up like a chopped break
const KICK = [
  [0, 10],
  [0, 2, 10],
];
const SNARE = [4, 12];
// the off-sixteenths of the hats lean late by this share of a sixteenth
const SHUFFLE = 0.2;
// the sub plays on the kicks: half-time under the drums
const BASS = [0, 10];

const cutoff = (open: number) => 250 * Math.pow(40, open);

export function renderDnb(piece: DnbPiece) {
  const beat = 60 / piece.bpm;
  const six = beat / 4;
  const barLen = beat * 4;
  const { events, add } = collector();
  let held: NoteEvent[] = [];

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const at = (step: number) => (step >= 8 && bar.c2 ? bar.c2 : bar.c);
    const halves = bar.c2 ? [0, 8] : [0];

    add(t, "open", [], barLen, bar.open ?? 1);
    for (const s of halves) {
      add(t + s * six, "pad", at(s), (16 / halves.length) * six * 0.98, 0.6);
      add(t + s * six, "keys", at(s), 7 * six, 0.5);
    }
    if (bar.bass) {
      const next = piece.bars[(i + 1) % piece.bars.length];
      BASS.forEach((s, k) => {
        const end = BASS[k + 1] ?? 16;
        const note = transpose(at(s)[0], -24);
        const glide = end === 16 && next.bass ? transpose(next.c[0], -24) : note;
        add(t + s * six, "bass", glide === note ? [note] : [note, glide], (end - s) * six * 0.97, 1);
      });
    }
    if (bar.beat) {
      for (const s of KICK[i % 2]) add(t + s * six, "kick", "C1", 0.3, s ? 0.85 : 1);
      for (const s of SNARE) add(t + s * six, "snare", [], 0.2, 0.9);
      // ghost notes around the backbeat, and a two-hit pickup closing every four bars
      for (const s of [7, 9]) add(t + s * six, "snare", [], 0.06, 0.16);
      if (i % 4 === 1) add(t + 15 * six, "snare", [], 0.06, 0.2);
      if (i % 4 === 3) for (const s of [14, 15]) add(t + s * six, "snare", [], 0.1, 0.45);
    }
    if (bar.beat || bar.hat) {
      for (let s = 0; s < 16; s++) {
        const vel = s % 4 === 2 ? 0.7 : s % 2 ? 0.25 : 0.4;
        add(t + (s + (s % 2) * SHUFFLE) * six, "hat", [], 0.03, vel);
      }
    }
    if (bar.roll) {
      for (let k = 0; k < bar.roll; k++) add(t + (k * barLen) / bar.roll, "snare", [], 0.1, 0.25 + (0.5 * k) / bar.roll);
    }
    if (bar.crash) add(t, "crash", [], 2.5, 0.8);

    let mt = t;
    for (const [note, n] of bar.m ?? []) {
      const dur = n * six;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else {
        add(mt, "lead", note, dur, 0.6);
        held = [events[events.length - 1]];
      }
      mt += dur;
    }
  });

  return { events, end: piece.bars.length * barLen };
}

export function dnbKit(bpm: number): Kit {
  const beat = 60 / bpm;
  const out = new Tone.Compressor(-18, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const reverb = new Tone.Reverb({ decay: 5, wet: 0.35 }).connect(out);
  // dotted-eighth echoes bouncing between the speakers
  const delay = new Tone.PingPongDelay({ delayTime: beat * 0.75, feedback: 0.3, wet: 0.25 }).connect(reverb);

  // soft detuned pad -> opening low-pass -> a gentle duck under the kick
  const duck = new Tone.Gain(1).connect(reverb);
  const lowpass = new Tone.Filter({ frequency: cutoff(0), type: "lowpass", rolloff: -24 }).connect(duck);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fattriangle", count: 3, spread: 24 },
    envelope: { attack: 0.6, decay: 0.5, sustain: 0.8, release: 1.8 },
    volume: -18,
  }).connect(lowpass);

  // Rhodes-like keys: FM at 1:1 with a slow stereo tremolo
  const tremolo = new Tone.Tremolo(3, 0.3).start().connect(duck);
  const keys = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 1,
    modulationIndex: 2,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.005, decay: 2, sustain: 0.25, release: 1.2 },
    modulationEnvelope: { attack: 0.002, decay: 0.6, sustain: 0.1, release: 0.6 },
    volume: -9,
  }).connect(tremolo);

  const lead = new Tone.Sampler({
    urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    release: 1.2,
    volume: -4,
  }).fan(delay, reverb);

  // round sine sub with a quiet, slowly swelling detuned-saw layer
  const sub = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.9, release: 0.1 },
    filterEnvelope: { baseFrequency: 2000, octaves: 0 },
    volume: -17,
  }).connect(out);
  const reeseFilter = new Tone.Filter({ frequency: 300, type: "lowpass", rolloff: -24 }).connect(out);
  new Tone.LFO(0.25 / beat, 180, 520).start().connect(reeseFilter.frequency);
  const reese = new Tone.MonoSynth({
    oscillator: { type: "fatsawtooth", count: 2, spread: 22 },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.8, release: 0.1 },
    filterEnvelope: { baseFrequency: 4000, octaves: 0 },
    volume: -34,
  }).connect(reeseFilter);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.025,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.05 },
    volume: -6,
  }).connect(out);
  // snare: a short tonal body under a band of noise, with some room
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.09, sustain: 0, release: 0.03 },
    volume: -14,
  }).fan(out, reverb);
  const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.14, sustain: 0 }, volume: -14 });
  snare.chain(new Tone.Filter(1800, "bandpass", -12), new Tone.Gain(1).fan(out, reverb));
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 }, volume: -24 });
  hat.chain(new Tone.Filter(8000, "highpass"), out);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 2.2, sustain: 0 }, volume: -26 });
  crash.chain(new Tone.Filter(6000, "highpass"), reverb);

  const glideTo = (synth: Tone.MonoSynth, f: number, glide: string | undefined, time: number, dur: number) => {
    synth.frequency.setValueAtTime(f, time);
    if (glide) {
      synth.frequency.setValueAtTime(f, time + dur - 0.07);
      synth.frequency.exponentialRampToValueAtTime(Tone.Frequency(glide).toFrequency(), time + dur);
    }
  };

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "open") {
        lowpass.frequency.exponentialRampTo(cutoff(e.vel), e.dur, time);
      } else if (e.voice === "pad") {
        pad.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "keys") {
        // roll the chord upwards
        e.notes.forEach((n, k) => keys.triggerAttackRelease(n, e.dur - k * 0.012, time + k * 0.012, e.vel));
      } else if (e.voice === "lead") {
        lead.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        const [note, glide] = e.notes;
        const f = Tone.Frequency(note).toFrequency();
        sub.triggerAttackRelease(f, e.dur, time, e.vel);
        reese.triggerAttackRelease(f, e.dur, time, e.vel);
        glideTo(sub, f, glide, time, e.dur);
        glideTo(reese, f, glide, time, e.dur);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        duck.gain.cancelScheduledValues(time);
        duck.gain.setValueAtTime(0.55, time);
        duck.gain.setTargetAtTime(1, time + 0.02, beat * 0.2);
      } else if (e.voice === "snare") {
        snare.triggerAttackRelease(e.dur, time, e.vel);
        if (e.vel >= 0.4) snareBody.triggerAttackRelease("G3", e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      pad.releaseAll();
      keys.releaseAll();
      lead.releaseAll();
      sub.triggerRelease();
      reese.triggerRelease();
      const now = Tone.now();
      duck.gain.cancelScheduledValues(now);
      duck.gain.setValueAtTime(1, now);
    },
  };
}
