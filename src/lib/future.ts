import * as Tone from "tone";
import type { FuturePiece } from "../pieces/types";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// half-time groove in sixteenth-note steps: the clap lands on beat 3 only
const KICK = [0, 6, 10];
const CLAP = 8;
// syncopated supersaw stabs: [step, length in steps]
const STABS = [
  [0, 2],
  [3, 2],
  [6, 3],
  [10, 1.5],
  [12, 3],
];

const cutoff = (open: number) => 200 * Math.pow(60, open);

export function renderFuture(piece: FuturePiece) {
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

    add(t, "open", [], barLen, bar.open ?? 1);
    if (bar.chord === "stab") {
      for (const [s, n] of STABS) add(t + s * six, "stab", at(s), n * six * 0.9, 0.8);
    } else if (bar.chord) {
      const halves = bar.c2 ? [0, 8] : [0];
      for (const s of halves) add(t + s * six, bar.chord, at(s), (16 / halves.length) * six * 0.98, 0.7);
    }
    if (bar.bass) {
      const next = piece.bars[(i + 1) % piece.bars.length];
      KICK.forEach((s, k) => {
        const end = KICK[k + 1] ?? 16;
        const note = transpose(at(s)[0], -24);
        const glide = k === KICK.length - 1 && next.bass ? transpose(next.c[0], -24) : note;
        add(t + s * six, "bass", glide === note ? [note] : [note, glide], (end - s) * six * 0.95, 1);
      });
    }
    if (bar.kick) for (const s of KICK) add(t + s * six, "kick", "C1", 0.4, 1);
    if (bar.clap) add(t + CLAP * six, "snare", [], 0.2, 0.9);
    if (bar.roll) {
      for (let k = 0; k < bar.roll; k++) add(t + (k * barLen) / bar.roll, "snare", [], 0.1, 0.3 + (0.45 * k) / bar.roll);
    }
    if (bar.hat) {
      // eighths, with sixteenth triplets or a thirty-second roll on beat 4 every other bar
      const fill = i % 4 === 1 ? 6 : i % 4 === 3 ? 8 : 0;
      for (let s = 0; s < (fill ? 12 : 16); s += 2) add(t + s * six, "hat", [], 0.04, s % 4 === 2 ? 0.8 : 0.45);
      for (let k = 0; k < fill; k++) add(t + 12 * six + (k * beat) / fill, "hat", [], 0.03, 0.4 + (0.3 * k) / fill);
    }
    if (bar.crash) add(t, "crash", [], 2, 0.8);
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
        add(mt, "lead", note, dur * 0.92, 0.8);
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

export function futureKit(bpm: number): Kit {
  const beat = 60 / bpm;
  const out = new Tone.Compressor(-16, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.25 }).connect(out);
  const delay = new Tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.3, wet: 0.22 }).connect(reverb);

  // supersaw chords -> low-pass -> sidechain duck
  const duck = new Tone.Gain(1).connect(reverb);
  const lowpass = new Tone.Filter({ frequency: cutoff(0), type: "lowpass", Q: 1 }).connect(duck);
  const saw = { type: "fatsawtooth", count: 3, spread: 28 } as const;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: saw,
    envelope: { attack: 0.08, decay: 0.3, sustain: 0.8, release: 0.6 },
    volume: -17,
  }).connect(lowpass);
  const stab = new Tone.PolySynth(Tone.Synth, {
    oscillator: saw,
    envelope: { attack: 0.004, decay: 0.12, sustain: 0.55, release: 0.08 },
    volume: -20,
  }).connect(lowpass);
  const tremolo = new Tone.Gain(1).connect(lowpass);
  const wah = new Tone.Filter({ frequency: 2000, type: "lowpass", Q: 3 }).connect(tremolo);
  const wobble = new Tone.PolySynth(Tone.Synth, {
    oscillator: saw,
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.9, release: 0.1 },
    volume: -20,
  });
  wobble.chain(new Tone.Vibrato(3 / beat, 0.05), wah);

  const lead = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 2.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 0.5, sustain: 0.15, release: 0.4 },
    modulation: { type: "square" },
    modulationEnvelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.1 },
    volume: -8,
  }).connect(delay);

  // 808: sine sub that drops into pitch and may glide to the next root
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.003, decay: 0.4, sustain: 0.8, release: 0.08 },
    filterEnvelope: { baseFrequency: 2000, octaves: 0 },
    volume: -7,
  });
  bass.chain(new Tone.Distortion(0.25), out);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 7,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 },
    volume: -6,
  }).connect(out);
  const clap = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.18, sustain: 0 }, volume: -12 });
  clap.chain(new Tone.Filter(1600, "bandpass"), reverb);
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.035, sustain: 0 }, volume: -22 });
  hat.chain(new Tone.Filter(9000, "highpass"), out);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 1.8, sustain: 0 }, volume: -22 });
  crash.chain(new Tone.Filter(5000, "highpass"), out);

  const riserGain = new Tone.Gain(0).connect(reverb);
  const riserFilter = new Tone.Filter({ frequency: 300, type: "bandpass", Q: 1.5 }).connect(riserGain);
  const riser = new Tone.Noise("white").connect(riserFilter);

  const chords = { pad, stab, wobble };

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "open") {
        lowpass.frequency.exponentialRampTo(cutoff(e.vel), e.dur, time);
      } else if (e.voice in chords) {
        chords[e.voice as keyof typeof chords].triggerAttackRelease(e.notes, e.dur, time, e.vel);
        if (e.voice === "wobble") {
          // eighth-note-triplet "wah" on the held chord
          const period = beat / 3;
          for (let p = time; p < time + e.dur - 1e-6; p += period) {
            tremolo.gain.setValueAtTime(0.15, p);
            tremolo.gain.linearRampToValueAtTime(1, p + period * 0.8);
            wah.frequency.setValueAtTime(500, p);
            wah.frequency.exponentialRampToValueAtTime(5000, p + period * 0.8);
          }
        }
      } else if (e.voice === "lead") {
        lead.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        const [note, glide] = e.notes;
        const f = Tone.Frequency(note).toFrequency();
        bass.triggerAttackRelease(f, e.dur, time, e.vel);
        bass.frequency.setValueAtTime(f * 1.5, time);
        bass.frequency.exponentialRampToValueAtTime(f, time + 0.06);
        if (glide) bass.frequency.exponentialRampToValueAtTime(Tone.Frequency(glide).toFrequency(), time + e.dur);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        duck.gain.cancelScheduledValues(time);
        duck.gain.setValueAtTime(0.1, time);
        duck.gain.setTargetAtTime(1, time + 0.03, beat * 0.18);
      } else if (e.voice === "snare") {
        clap.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "riser") {
        riser.start(time).stop(time + e.dur);
        riserFilter.frequency.setValueAtTime(300, time);
        riserFilter.frequency.exponentialRampToValueAtTime(9000, time + e.dur);
        riserGain.gain.setValueAtTime(0, time);
        riserGain.gain.linearRampToValueAtTime(e.vel, time + e.dur);
      }
    },
    releaseAll() {
      for (const synth of Object.values(chords)) synth.releaseAll();
      lead.releaseAll();
      bass.triggerRelease();
      riser.stop();
      const now = Tone.now();
      for (const g of [duck.gain, tremolo.gain]) {
        g.cancelScheduledValues(now);
        g.setValueAtTime(1, now);
      }
      riserGain.gain.cancelScheduledValues(now);
      riserGain.gain.setValueAtTime(0, now);
    },
  };
}
