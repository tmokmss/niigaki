import * as Tone from "tone";
import type { TrancePiece } from "../pieces/types";
import { SAMPLES } from "./piano";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// trance gate on the held supersaw chords, one flag per sixteenth, repeating every half bar
const GATE = [1, 0, 1, 1, 0, 1, 1, 0];
// the pluck's path through the chord and the chord an octave up, one index per sixteenth
const ARP = [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 4, 3];
const CLAP = [4, 12];
const OPEN_HAT = [2, 6, 10, 14];

const cutoff = (open: number) => 200 * Math.pow(60, open);

export function renderTrance(piece: TrancePiece) {
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
      if (bar.chord) add(t + s * six, bar.chord, at(s), half * 0.98, 0.7);
      // piano: the root an octave down under the chord
      if (bar.lead === "piano") add(t + s * six, "keys", [transpose(at(s)[0], -12), ...at(s)], half, 0.4);
    }
    if (bar.arp) {
      for (let s = 0; s < 16; s++) {
        const up = [...at(s), ...at(s).map((n) => transpose(n, 12))];
        add(t + s * six, "arp", up[ARP[s] % up.length], six * 0.9, s % 4 === 0 ? 0.6 : 0.45);
      }
    }
    if (bar.bass) {
      // rolling: the three sixteenths after each kick, the last one an octave up
      for (let s = 0; s < 16; s++) {
        if (s % 4 === 0) continue;
        const root = transpose(at(s)[0], -24);
        add(t + s * six, "bass", s % 4 === 3 ? transpose(root, 12) : root, six * 0.8, s % 4 === 2 ? 1 : 0.8);
      }
    }
    if (bar.kick) for (let s = 0; s < 16; s += 4) add(t + s * six, "kick", "C1", 0.35, 1);
    if (bar.clap) for (const s of CLAP) add(t + s * six, "snare", [], 0.2, 0.9);
    if (bar.hat) {
      for (let s = 0; s < 16; s++) {
        if (OPEN_HAT.includes(s)) add(t + s * six, "ohat", [], 0.12, 0.8);
        else add(t + s * six, "hat", [], 0.03, s % 2 ? 0.45 : 0.3);
      }
    }
    if (bar.roll) {
      for (let k = 0; k < bar.roll; k++) {
        add(t + (k * barLen) / bar.roll, "roll", transpose("G3", Math.round((12 * k) / bar.roll)), 0.1, 0.3 + (0.45 * k) / bar.roll);
      }
    }
    if (bar.crash) add(t, "crash", [], 2.5, 0.8);
    if (bar.riser && riserFrom < 0) riserFrom = t;
    if (riserFrom >= 0 && !piece.bars[i + 1]?.riser) {
      add(riserFrom, "riser", [], t + barLen - riserFrom, 0.5);
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
        // the instrument rides after the note
        add(mt, "lead", [note, bar.lead ?? "saw"], dur, 0.8);
        held = [events[events.length - 1]];
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

export function tranceKit(bpm: number): Kit {
  const beat = 60 / bpm;
  const six = beat / 4;
  const out = new Tone.Compressor(-18, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.3 }).connect(out);
  const delay = new Tone.PingPongDelay({ delayTime: beat * 0.75, feedback: 0.3, wet: 0.22 }).connect(reverb);

  // detuned supersaw chords -> opening low-pass -> ducked under the kick; the gated ones pass a sixteenth-note gate first
  const duck = new Tone.Gain(1).connect(reverb);
  const lowpass = new Tone.Filter({ frequency: cutoff(0), type: "lowpass", rolloff: -24 }).connect(duck);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 5, spread: 40 },
    envelope: { attack: 0.4, decay: 0.5, sustain: 0.85, release: 1.5 },
    volume: -18,
  }).connect(lowpass);
  const gate = new Tone.Gain(0).connect(lowpass);
  const saws = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 5, spread: 45 },
    envelope: { attack: 0.005, decay: 0.1, sustain: 1, release: 0.05 },
    volume: -15,
  }).connect(gate);

  // supersaw lead with an octave above it, opening with the chords
  const leadFilter = new Tone.Filter({ frequency: cutoff(0), type: "lowpass" });
  leadFilter.fan(delay, reverb);
  const saw = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 22 },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.75, release: 0.15 },
    volume: -15,
  }).connect(leadFilter);
  const lead = piano(-3).fan(delay, reverb);
  const keys = piano(-10).connect(reverb);
  const pluck = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 2, spread: 14 },
    envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.1 },
    volume: -9,
  });
  pluck.chain(new Tone.Filter(3200, "lowpass"), new Tone.Gain(1).fan(delay, reverb));

  // a sine sub and a filtered saw, silenced by each kick and back by the next sixteenth
  const bassDuck = new Tone.Gain(1).connect(out);
  const sub = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0.8, release: 0.03 },
    filterEnvelope: { baseFrequency: 2000, octaves: 0 },
    volume: -18,
  }).connect(bassDuck);
  const growl = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0.6, release: 0.03 },
    filter: { Q: 2, type: "lowpass", rolloff: -24 },
    filterEnvelope: { attack: 0.002, decay: 0.08, sustain: 0.2, release: 0.05, baseFrequency: 220, octaves: 2.5 },
    volume: -23,
  }).connect(bassDuck);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.035,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.05 },
    volume: -8,
  }).connect(out);
  const clap = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.16, sustain: 0 }, volume: -12 });
  clap.chain(new Tone.Filter(1400, "bandpass"), new Tone.Gain(1).fan(out, reverb));
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 }, volume: -27 });
  hat.chain(new Tone.Filter(9000, "highpass"), out);
  const openHat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.003, decay: 0.12, sustain: 0 }, volume: -21 });
  openHat.chain(new Tone.Filter(7000, "highpass"), out);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 2.2, sustain: 0 }, volume: -24 });
  crash.chain(new Tone.Filter(6000, "highpass"), reverb);
  // roll: a snare whose tonal body climbs through the bar
  const roll = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.1, sustain: 0 }, volume: -15 });
  roll.chain(new Tone.Filter(2000, "bandpass"), new Tone.Gain(1).fan(out, reverb));
  const rollBody = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 1,
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 },
    volume: -18,
  }).connect(out);

  // riser: white noise opening upwards, with a supersaw sweeping three octaves under it
  const riserGain = new Tone.Gain(0).connect(reverb);
  const riserFilter = new Tone.Filter({ frequency: 300, type: "bandpass", Q: 1.2 }).connect(riserGain);
  const riserNoise = new Tone.Noise("white").connect(riserFilter);
  const riserSaw = new Tone.Synth({
    oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
    envelope: { attack: 0.05, decay: 0, sustain: 1, release: 0.05 },
    volume: -26,
  }).connect(riserGain);

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "open") {
        lowpass.frequency.exponentialRampTo(cutoff(e.vel), e.dur, time);
        leadFilter.frequency.exponentialRampTo(cutoff(0.35 + e.vel * 0.65), e.dur, time);
      } else if (e.voice === "pad") {
        pad.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "gate") {
        saws.triggerAttackRelease(e.notes, e.dur, time, e.vel);
        gate.gain.cancelScheduledValues(time);
        gate.gain.setValueAtTime(0, time);
        for (let k = 0; k * six < e.dur - 1e-6; k++) {
          if (!GATE[k % GATE.length]) continue;
          const s = time + k * six;
          gate.gain.setValueAtTime(1, s);
          gate.gain.setTargetAtTime(0, s + six * 0.55, six * 0.12);
        }
      } else if (e.voice === "keys") {
        e.notes.forEach((n, k) => keys.triggerAttackRelease(n, e.dur - k * 0.015, time + k * 0.015, e.vel));
      } else if (e.voice === "lead") {
        const [note, by] = e.notes;
        if (by === "piano") lead.triggerAttackRelease(note, e.dur, time, e.vel);
        else if (by === "pluck") pluck.triggerAttackRelease(note, e.dur, time, e.vel);
        else {
          saw.triggerAttackRelease(note, e.dur * 0.95, time, e.vel);
          saw.triggerAttackRelease(transpose(note, 12), e.dur * 0.95, time, e.vel * 0.45);
        }
      } else if (e.voice === "arp") {
        pluck.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        sub.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        growl.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        for (const [g, depth] of [
          [duck.gain, 0.25],
          [bassDuck.gain, 0],
        ] as const) {
          g.cancelScheduledValues(time);
          g.setValueAtTime(depth, time);
          g.setTargetAtTime(1, time + 0.02, beat * 0.18);
        }
      } else if (e.voice === "snare") {
        clap.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "ohat") {
        openHat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "roll") {
        roll.triggerAttackRelease(e.dur, time, e.vel);
        rollBody.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "riser") {
        riserNoise.start(time).stop(time + e.dur);
        riserFilter.frequency.setValueAtTime(300, time);
        riserFilter.frequency.exponentialRampToValueAtTime(9000, time + e.dur);
        riserSaw.triggerAttackRelease(220, e.dur, time);
        riserSaw.frequency.exponentialRampToValueAtTime(1760, time + e.dur);
        riserGain.gain.setValueAtTime(0, time);
        riserGain.gain.linearRampToValueAtTime(e.vel, time + e.dur);
      }
    },
    releaseAll() {
      for (const synth of [pad, saws, saw, lead, keys, pluck]) synth.releaseAll();
      for (const synth of [sub, growl, riserSaw]) synth.triggerRelease();
      riserNoise.stop();
      const now = Tone.now();
      for (const [g, v] of [
        [duck.gain, 1],
        [bassDuck.gain, 1],
        [gate.gain, 0],
        [riserGain.gain, 0],
      ] as const) {
        g.cancelScheduledValues(now);
        g.setValueAtTime(v, now);
      }
    },
  };
}
