import * as Tone from "tone";
import type { BossaPiece } from "../pieces/types";
import { collector, midi, transpose, type Kit, type NoteEvent } from "./score";

// two-bar patterns in sixteenth steps: the guitar's pinch "x.x..x.x | .x..x.x." in eighths, and the bossa clave on the cross-stick
const GUITAR = [
  [0, 4, 10, 14],
  [2, 8, 12],
];
const CLAVE = [
  [0, 6, 12],
  [4, 10],
];
// how long each guitar chord rings, in steps
const RING = 3;

export function renderBossa(piece: BossaPiece) {
  const beat = 60 / piece.bpm;
  const six = beat / 4;
  const barLen = beat * 4;
  const { events, add } = collector();
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let held: NoteEvent[] = [];

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const at = (step: number) => (step >= 8 && bar.c2 ? bar.c2 : bar.c);

    for (const s of GUITAR[i % 2]) add(t + s * six + rand() * 0.008, "guitar", at(s), RING * six, s % 4 ? 0.6 : 0.8);
    if (bar.bass) {
      const next = piece.bars[(i + 1) % piece.bars.length];
      for (const s of [0, 8]) {
        const root = transpose(at(s)[0], -24);
        // the fifth below once the one above would climb out of the bass register
        const fifth = transpose(root, midi(root) + 7 > midi("D3") ? -5 : 7);
        const pickup = s === 0 ? transpose(at(8)[0], -24) : transpose(next.c[0], -24);
        add(t + s * six, "bass", root, 5.5 * six, 0.9);
        add(t + (s + 6) * six, "bass", s === 0 && !bar.c2 ? fifth : pickup, 1.8 * six, 0.55);
      }
    }
    if (bar.beat) {
      for (const s of [0, 8]) add(t + s * six, "kick", "C1", 0.3, 0.55);
      for (const s of CLAVE[i % 2]) add(t + s * six, "snare", [], 0.05, 0.5);
      for (let s = 0; s < 16; s++) {
        const vel = s % 4 === 2 ? 0.55 : s % 2 ? 0.2 : 0.32;
        add(t + s * six + (rand() - 0.5) * 0.008, "hat", [], 0.06, vel * (0.85 + rand() * 0.3));
      }
    }
    if (bar.crash) add(t, "crash", [], 2.5, 0.6);

    let mt = t;
    for (const [note, n] of bar.m ?? []) {
      const dur = n * six;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else {
        add(mt, "lead", note, dur * 0.92, 0.6 + rand() * 0.15);
        held = [events[events.length - 1]];
      }
      mt += dur;
    }
  });

  const end = piece.bars.length * barLen;
  return { events, end };
}

export function bossaKit(bpm: number): Kit {
  const out = new Tone.Compressor(-20, 2.5);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const reverb = new Tone.Reverb({ decay: 2.2, wet: 0.25 }).connect(out);

  // nylon-string guitar samples from tonejs-instruments by Nicholas Brosowsky (CC BY 3.0)
  const guitar = new Tone.Sampler({
    urls: Object.fromEntries(["E3", "A3", "C#4", "E4", "A4", "C#5", "E5", "A5"].map((n) => [n, `${n.replace("#", "s")}.mp3`])),
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-nylon/",
    release: 0.25,
    volume: -8,
  }).connect(reverb);

  // flute: a sine with a little second and third harmonic, a slow attack, vibrato and a puff of breath on each note
  const flute = new Tone.Synth({
    oscillator: { type: "custom", partials: [1, 0.22, 0.07] },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.85, release: 0.25 },
    portamento: 0.01,
    volume: -19,
  });
  flute.chain(new Tone.Vibrato(5, 0.06), new Tone.FeedbackDelay({ delayTime: (60 / bpm) * 0.75, feedback: 0.2, wet: 0.12 }), reverb);
  const breath = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.01, decay: 0.08, sustain: 0 }, volume: -40 });
  breath.chain(new Tone.Filter({ frequency: 1800, type: "bandpass", Q: 1.5 }), reverb);

  const bass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.006, decay: 0.5, sustain: 0.35, release: 0.15 },
    volume: -14,
  });
  bass.chain(new Tone.Filter(550, "lowpass"), out);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 3,
    envelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.1 },
    volume: -8,
  });
  kick.chain(new Tone.Filter(500, "lowpass"), out);
  // cross-stick: a short, high, woody knock
  const rim = new Tone.MembraneSynth({
    pitchDecay: 0.006,
    octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
    volume: -9,
  });
  rim.chain(new Tone.Filter(1200, "highpass"), reverb);
  const shaker = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.008, decay: 0.05, sustain: 0 }, volume: -15 });
  shaker.chain(new Tone.Filter({ frequency: 7000, type: "bandpass", Q: 0.8 }), out);
  const cymbal = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.3, decay: 2.2, sustain: 0 }, volume: -32 });
  cymbal.chain(new Tone.Filter(5000, "highpass"), reverb);

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "guitar") {
        // thumb and fingers pinch the strings together, the lowest a hair early
        e.notes.forEach((n, k) => guitar.triggerAttackRelease(n, e.dur, time + k * 0.006, e.vel));
      } else if (e.voice === "lead") {
        flute.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        breath.triggerAttackRelease(0.08, time, e.vel);
      } else if (e.voice === "bass") {
        bass.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "snare") {
        rim.triggerAttackRelease("E5", e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        shaker.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        cymbal.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      flute.triggerRelease();
      guitar.releaseAll();
      bass.releaseAll();
    },
  };
}
