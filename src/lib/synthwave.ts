import * as Tone from "tone";
import type { SynthwavePiece } from "../pieces/types";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// LinnDrum-style: the kick on 1 and 3, with the and of 3 every other bar; the snare on 2 and 4
const KICK = [
  [0, 8],
  [0, 8, 10],
];
const SNARE = [4, 12];
// a tom roll across beats 3-4, from the high tom down to the floor
const TOMS = ["A3", "A3", "F3", "F3", "D3", "D3", "A2", "A2"];
// the gated reverb stays open this long after a hit, then slams shut
const GATE = 0.28;

const cutoff = (open: number) => 250 * Math.pow(48, open);

export function renderSynthwave(piece: SynthwavePiece) {
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
    for (const s of halves) add(t + s * six, "pad", at(s), (16 / halves.length) * six * 0.98, 0.6);
    if (bar.arp) {
      // up and down the chord and the root's octave
      for (let s = 0; s < 16; s++) {
        const c = at(s);
        const up = [...c, transpose(c[0], 12)];
        const k = s % (2 * up.length - 2);
        add(t + s * six, "arp", up[k < up.length ? k : 2 * up.length - 2 - k], six * 0.8, s % 4 === 0 ? 0.8 : 0.55);
      }
    }
    if (bar.bass) {
      for (let s = 0; s < 16; s++) add(t + s * six, "bass", transpose(at(s)[0], s % 2 ? -12 : -24), six * 0.85, s % 4 === 0 ? 1 : 0.7);
    }
    const fillFrom = bar.fill ? 8 : 16;
    if (bar.beat) {
      for (const s of KICK[i % 2]) add(t + s * six, "kick", "C1", 0.3, s % 8 ? 0.8 : 1);
      for (const s of SNARE) if (s < fillFrom) add(t + s * six, "snare", [], 0.2, 1);
    }
    if (bar.beat || bar.hat) {
      for (let s = 0; s < fillFrom; s++) add(t + s * six, "hat", [], s % 4 === 2 ? 0.12 : 0.03, s % 4 === 2 ? 0.6 : s % 2 ? 0.25 : 0.4);
    }
    if (bar.fill) TOMS.forEach((n, k) => add(t + (8 + k) * six, "tom", n, 0.3, 0.6 + 0.05 * k));
    if (bar.crash) add(t, "crash", [], 2.5, 0.8);

    const voice = bar.sax ? "sax" : "lead";
    let mt = t;
    for (const [note, n] of bar.m ?? []) {
      const dur = n * six;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else {
        add(mt, voice, note, dur, 0.8);
        held = [events[events.length - 1]];
      }
      mt += dur;
    }
  });

  return { events, end: piece.bars.length * barLen };
}

export function synthwaveKit(bpm: number): Kit {
  const beat = 60 / bpm;
  const out = new Tone.Compressor(-18, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.3 }).connect(out);
  const delay = new Tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.35, wet: 0.28 }).connect(reverb);

  // Juno-style pad: detuned saws -> sweeping low-pass -> slow chorus -> ducked under the kick
  const duck = new Tone.Gain(1).connect(reverb);
  const chorus = new Tone.Chorus({ frequency: 0.6, delayTime: 3.5, depth: 0.7, wet: 0.6 }).start().connect(duck);
  const lowpass = new Tone.Filter({ frequency: cutoff(0), type: "lowpass", rolloff: -24 }).connect(chorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 28 },
    envelope: { attack: 0.35, decay: 0.5, sustain: 0.85, release: 1.4 },
    volume: -19,
  }).connect(lowpass);
  // square plucks through the same filter, echoing on the dotted eighth
  const arpGain = new Tone.Gain(1).fan(lowpass, delay);
  const arp = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: { attack: 0.002, decay: 0.14, sustain: 0, release: 0.08 },
    volume: -21,
  }).connect(arpGain);

  // saw bass with a snappy filter, pumping under the kick
  const bassDuck = new Tone.Gain(1).connect(out);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { Q: 2, type: "lowpass", rolloff: -24 },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0.4, release: 0.05 },
    filterEnvelope: { attack: 0.002, decay: 0.12, sustain: 0.2, release: 0.05, baseFrequency: 180, octaves: 2.6 },
    volume: -13,
  }).connect(bassDuck);

  // bright saw lead gliding between notes
  const lead = new Tone.MonoSynth({
    portamento: 0.035,
    oscillator: { type: "fatsawtooth", count: 2, spread: 14 },
    filter: { Q: 1, type: "lowpass", rolloff: -12 },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.75, release: 0.35 },
    filterEnvelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.3, baseFrequency: 900, octaves: 2.5 },
    volume: -15,
  });
  lead.chain(new Tone.Vibrato(5, 0.04), new Tone.Gain(1).fan(delay, reverb));
  // FM sax: a reedy square-modulated tone that swells into its vibrato
  const sax = new Tone.FMSynth({
    portamento: 0.03,
    harmonicity: 1,
    modulationIndex: 3.5,
    oscillator: { type: "sine" },
    modulation: { type: "square" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.85, release: 0.25 },
    modulationEnvelope: { attack: 0.08, decay: 0.3, sustain: 0.6, release: 0.25 },
    volume: -15,
  });
  sax.chain(new Tone.Vibrato(5.2, 0.08), new Tone.Filter(2800, "lowpass"), new Tone.Gain(1).fan(delay, reverb));

  // gated reverb: a big room that is cut off sharply after each snare and tom hit
  const gate = new Tone.Gain(0).connect(out);
  const room = new Tone.Reverb({ decay: 2.5, wet: 1 }).connect(gate);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 5,
    envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.05 },
    volume: -6,
  }).connect(out);
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.015,
    octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.03 },
    volume: -12,
  }).fan(out, room);
  const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.18, sustain: 0 }, volume: -12 });
  snare.chain(new Tone.Filter(2200, "bandpass", -12), new Tone.Gain(1).fan(out, room));
  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.05 },
    volume: -10,
  }).fan(out, room);
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 }, volume: -26 });
  hat.chain(new Tone.Filter(8500, "highpass"), out);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 2.2, sustain: 0 }, volume: -26 });
  crash.chain(new Tone.Filter(6000, "highpass"), reverb);

  const openGate = (time: number, level: number) => {
    gate.gain.cancelScheduledValues(time);
    gate.gain.setValueAtTime(level, time);
    gate.gain.setValueAtTime(level, time + GATE);
    gate.gain.linearRampToValueAtTime(0, time + GATE + 0.02);
  };

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "open") {
        lowpass.frequency.exponentialRampTo(cutoff(e.vel), e.dur, time);
      } else if (e.voice === "pad") {
        pad.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "arp") {
        arp.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        bass.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "lead") {
        lead.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "sax") {
        sax.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        for (const [g, depth] of [
          [duck.gain, 0.35],
          [bassDuck.gain, 0.2],
        ] as const) {
          g.cancelScheduledValues(time);
          g.setValueAtTime(depth, time);
          g.setTargetAtTime(1, time + 0.02, beat * 0.18);
        }
      } else if (e.voice === "snare") {
        snare.triggerAttackRelease(e.dur, time, e.vel);
        snareBody.triggerAttackRelease("A3", e.dur, time, e.vel);
        openGate(time, 0.9);
      } else if (e.voice === "tom") {
        tom.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        openGate(time, 0.6);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      pad.releaseAll();
      arp.releaseAll();
      for (const synth of [bass, lead, sax]) synth.triggerRelease();
      const now = Tone.now();
      for (const g of [duck.gain, bassDuck.gain]) {
        g.cancelScheduledValues(now);
        g.setValueAtTime(1, now);
      }
      gate.gain.cancelScheduledValues(now);
      gate.gain.setValueAtTime(0, now);
    },
  };
}
