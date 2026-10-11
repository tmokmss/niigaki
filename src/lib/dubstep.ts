import * as Tone from "tone";
import type { DubstepPiece } from "../pieces/types";
import { SAMPLES } from "./piano";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// half-time in sixteenth-note steps: the snare lands on beat 3, and every other bar the kick adds the and of 2
const KICK = [
  [0, 10],
  [0, 6, 10],
];
const SNARE = 8;

const cutoff = (open: number) => 200 * Math.pow(60, open);

export function renderDubstep(piece: DubstepPiece) {
  const beat = 60 / piece.bpm;
  const six = beat / 4;
  const barLen = beat * 4;
  const { events, add } = collector();
  const gaps: [number, number][] = [];
  let held: NoteEvent[] = [];
  let riserFrom = -1;

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const at = (step: number) => (step >= 8 && bar.c2 ? bar.c2 : bar.c);
    const halves = bar.c2 ? [0, 8] : [0];
    const half = (16 / halves.length) * six;

    add(t, "open", [], barLen, bar.open ?? 1);
    for (const s of halves) {
      add(t + s * six, "pad", at(s), half * 0.98, 0.6);
      // piano: the root an octave down under the chord
      add(t + s * six, "keys", [transpose(at(s)[0], -12), ...at(s)], half, 0.4);
      if (bar.wobble) add(t + s * six, "bass", transpose(at(s)[0], -24), half * 0.97, 1);
    }
    if (bar.wobble) for (let k = 0; k < bar.wobble; k++) add(t + (k * barLen) / bar.wobble, "wob", [], barLen / bar.wobble, 1);
    if (bar.beat) {
      for (const s of KICK[i % 2]) add(t + s * six, "kick", "C1", 0.4, s ? 0.8 : 1);
      add(t + SNARE * six, "snare", [], 0.25, 1);
    }
    if (bar.beat || bar.hat) {
      // eighths, with sixteenths across beat 4 closing every four bars
      for (let s = 0; s < 16; s += i % 4 === 3 && s >= 12 ? 1 : 2) add(t + s * six, "hat", [], 0.04, s % 4 === 2 ? 0.7 : 0.35);
    }
    if (bar.roll) {
      for (let k = 0; k < bar.roll; k++) add(t + (k * barLen) / bar.roll, "snare", [], 0.1, 0.3 + (0.45 * k) / bar.roll);
    }
    if (bar.crash) add(t, "crash", [], 2.5, 0.8);
    if (bar.riser && riserFrom < 0) riserFrom = t;
    if (riserFrom >= 0 && !piece.bars[i + 1]?.riser) {
      add(riserFrom, "riser", [], t + barLen - riserFrom, 0.6);
      riserFrom = -1;
    }
    if (bar.gap) gaps.push([t + beat * 3, t + barLen]);

    let mt = t;
    for (const [note, n] of bar.m ?? []) {
      const dur = n * six;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else {
        add(mt, "lead", note, dur, 0.65);
        held = [events[events.length - 1]];
        if (bar.saw) {
          add(mt, "saw", note, dur * 0.95, 0.8 * bar.saw);
          held.push(events[events.length - 1]);
        }
      }
      mt += dur;
    }
  });

  // a moment of silence before the drop
  const kept = events.filter((e) => !gaps.some(([s, end]) => e.t >= s - 1e-9 && e.t < end));
  for (const e of kept) {
    for (const [s] of gaps) if (e.t < s && e.t + e.dur > s) e.dur = s - e.t;
  }

  return { events: kept, end: piece.bars.length * barLen };
}

const piano = (volume: number) =>
  new Tone.Sampler({
    urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    release: 1.4,
    volume,
  });

export function dubstepKit(bpm: number): Kit {
  const beat = 60 / bpm;
  const out = new Tone.Compressor(-18, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const reverb = new Tone.Reverb({ decay: 4.5, wet: 0.32 }).connect(out);
  const delay = new Tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.3, wet: 0.2 }).connect(reverb);

  // supersaw pad -> opening low-pass -> ducked under the kick
  const duck = new Tone.Gain(1).connect(reverb);
  const lowpass = new Tone.Filter({ frequency: cutoff(0), type: "lowpass", rolloff: -24 }).connect(duck);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 5, spread: 36 },
    envelope: { attack: 0.25, decay: 0.4, sustain: 0.85, release: 1.2 },
    volume: -18,
  }).connect(lowpass);

  const keys = piano(-8).connect(reverb);
  const lead = piano(-3).fan(delay, reverb);
  const saw = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
    envelope: { attack: 0.01, decay: 0.25, sustain: 0.7, release: 0.25 },
    volume: -20,
  });
  saw.chain(new Tone.Filter(4500, "lowpass"), new Tone.Gain(1).fan(delay, reverb));

  // a sine sub under an FM and square layer an octave up, whose low-pass opens and closes on the beat
  const bassDuck = new Tone.Gain(1).connect(out);
  const sub = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.9, release: 0.1 },
    filterEnvelope: { baseFrequency: 2000, octaves: 0 },
    volume: -22,
  }).connect(bassDuck);
  const wah = new Tone.Filter({ frequency: 150, type: "lowpass", rolloff: -24, Q: 4 }).connect(bassDuck);
  const fm = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 3,
    oscillator: { type: "sine" },
    modulation: { type: "square" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.9, release: 0.1 },
    modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 1, release: 0.1 },
    volume: -27,
  }).connect(wah);
  const square = new Tone.Synth({
    oscillator: { type: "fatsquare", count: 2, spread: 12 },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.9, release: 0.1 },
    volume: -34,
  }).connect(wah);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 7,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
    volume: -5,
  }).connect(out);
  // snare: a tonal body under a band of noise, with a long room
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.012,
    octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.03 },
    volume: -12,
  }).fan(out, reverb);
  const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 }, volume: -13 });
  snare.chain(new Tone.Filter(1800, "bandpass", -12), new Tone.Gain(1).fan(out, reverb));
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.035, sustain: 0 }, volume: -25 });
  hat.chain(new Tone.Filter(9000, "highpass"), out);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 2.2, sustain: 0 }, volume: -25 });
  crash.chain(new Tone.Filter(6000, "highpass"), reverb);

  // riser: a supersaw sweeping up three octaves, with a little noise under it
  const riserGain = new Tone.Gain(0).connect(reverb);
  const riserSaw = new Tone.Synth({
    oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
    envelope: { attack: 0.05, decay: 0, sustain: 1, release: 0.05 },
    volume: -20,
  }).connect(riserGain);
  const riserFilter = new Tone.Filter({ frequency: 400, type: "bandpass", Q: 1.5 }).connect(new Tone.Gain(0.25).connect(riserGain));
  const riserNoise = new Tone.Noise("white").connect(riserFilter);

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "open") {
        lowpass.frequency.exponentialRampTo(cutoff(e.vel), e.dur, time);
      } else if (e.voice === "pad") {
        pad.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "keys") {
        // roll the chord upwards
        e.notes.forEach((n, k) => keys.triggerAttackRelease(n, e.dur - k * 0.015, time + k * 0.015, e.vel));
      } else if (e.voice === "lead") {
        lead.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "saw") {
        saw.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        const [note] = e.notes;
        sub.triggerAttackRelease(note, e.dur, time, e.vel);
        fm.triggerAttackRelease(transpose(note, 12), e.dur, time, e.vel);
        square.triggerAttackRelease(transpose(note, 12), e.dur, time, e.vel);
      } else if (e.voice === "wob") {
        wah.frequency.setValueAtTime(150, time);
        wah.frequency.exponentialRampToValueAtTime(1400, time + e.dur * 0.45);
        wah.frequency.exponentialRampToValueAtTime(150, time + e.dur * 0.95);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        for (const [g, depth] of [
          [duck.gain, 0.2],
          [bassDuck.gain, 0.35],
        ] as const) {
          g.cancelScheduledValues(time);
          g.setValueAtTime(depth, time);
          g.setTargetAtTime(1, time + 0.03, beat * 0.2);
        }
      } else if (e.voice === "snare") {
        snare.triggerAttackRelease(e.dur, time, e.vel);
        if (e.vel >= 0.4) snareBody.triggerAttackRelease("G3", e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "riser") {
        riserSaw.triggerAttackRelease(220, e.dur, time);
        riserSaw.frequency.exponentialRampToValueAtTime(1760, time + e.dur);
        riserNoise.start(time).stop(time + e.dur);
        riserFilter.frequency.setValueAtTime(400, time);
        riserFilter.frequency.exponentialRampToValueAtTime(8000, time + e.dur);
        riserGain.gain.setValueAtTime(0, time);
        riserGain.gain.linearRampToValueAtTime(e.vel, time + e.dur);
      }
    },
    releaseAll() {
      pad.releaseAll();
      keys.releaseAll();
      lead.releaseAll();
      saw.releaseAll();
      for (const synth of [sub, fm, square, riserSaw]) synth.triggerRelease();
      riserNoise.stop();
      const now = Tone.now();
      for (const g of [duck.gain, bassDuck.gain]) {
        g.cancelScheduledValues(now);
        g.setValueAtTime(1, now);
      }
      riserGain.gain.cancelScheduledValues(now);
      riserGain.gain.setValueAtTime(0, now);
    },
  };
}
