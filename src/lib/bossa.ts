import * as Tone from "tone";
import type { BossaPiece } from "../pieces/types";
import { collector, transpose, type Kit, type NoteEvent } from "./score";

// two-bar patterns in sixteenth steps (a 4/4 bar here holds two 2/4 bars of the usual notation):
// the fingers pinch the chord "x.x..x.x | .x..x.x." in eighths, and the cross-stick plays the bossa clave
const FINGERS = [
  [0, 4, 10, 14],
  [2, 8, 12],
];
// fingerpicking: [step, which finger note counting up from the lowest], the thumb taking 1 and 3
const ARP = [
  [2, 0],
  [4, 1],
  [6, 2],
  [10, 1],
  [12, 2],
  [14, 3],
];
const CLAVE = [
  [0, 6, 12],
  [4, 10],
];

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
    // the thumb: the root on 1, then the fifth below it on 3, or the root of the second chord
    const thumb = (step: number) => (step === 0 ? bar.c[0] : bar.c2 ? bar.c2[0] : transpose(bar.c[0], -5));
    const next = piece.bars[(i + 1) % piece.bars.length];

    const fingers = (step: number) => at(step).slice(1);
    if (bar.guitar === "arp") {
      // one string at a time between the thumb's notes, up and back down, each left ringing to the half bar
      for (const [s, k] of ARP) {
        const f = fingers(s);
        add(t + s * six, "guitar", f[Math.min(k, f.length - 1)], (8 - (s % 8)) * six, 0.5 + rand() * 0.1);
      }
    } else if (bar.guitar === "strum") {
      // the fingers brush down on each eighth and back up on the offbeats, accented on the bossa pattern
      for (let s = 0; s < 16; s += 2) {
        const f = fingers(s);
        const accent = FINGERS[i % 2].includes(s);
        add(t + s * six, "strum", s % 4 ? [...f].reverse() : f, 2 * six, accent ? 0.7 : 0.35);
      }
    } else {
      const hits = FINGERS[i % 2];
      hits.forEach((s, k) => {
        // each chord rings until the fingers strike again; off the beat only the top two strings
        const until = hits[k + 1] ?? 16 + FINGERS[(i + 1) % 2][0];
        add(t + s * six + rand() * 0.008, "guitar", s % 4 ? fingers(s).slice(-2) : fingers(s), (until - s) * six, s % 4 ? 0.55 : 0.75);
      });
    }
    for (const s of [0, 8]) add(t + s * six, "thumb", thumb(s), 8 * six, 0.7);
    if (bar.bass) {
      // the bass doubles the thumb, each half pushed into the next by an eighth-note pickup
      for (const s of [0, 8]) {
        add(t + s * six, "bass", thumb(s), 5.5 * six, 0.9);
        add(t + (s + 6) * six, "bass", s === 0 ? thumb(8) : next.c[0], 1.8 * six, 0.5);
      }
    }
    if (bar.beat) {
      for (const s of [0, 8]) add(t + s * six, "kick", "C1", 0.3, 0.55);
      for (const s of CLAVE[i % 2]) add(t + s * six, "snare", [], 0.05, 0.5);
      for (let s = 0; s < 16; s += 2) {
        add(t + s * six + (rand() - 0.5) * 0.008, "hat", [], 0.07, (s % 4 ? 0.5 : 0.35) * (0.85 + rand() * 0.3));
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
  const reverb = new Tone.Reverb({ decay: 2.4, wet: 0.3 }).connect(out);

  // nylon-string guitar and flute samples from tonejs-instruments by Nicholas Brosowsky (CC BY 3.0), in the same room
  const sampler = (dir: string, notes: string[], release: number, volume: number) =>
    new Tone.Sampler({
      urls: Object.fromEntries(notes.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
      baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${dir}/`,
      release,
      volume,
    }).connect(reverb);
  const guitar = sampler("guitar-nylon", ["E2", "A2", "D3", "G3", "C#4", "E4", "A4", "C#5", "E5"], 1, -10);
  const flute = sampler("flute", ["C4", "E4", "A4", "C5", "E5", "A5", "C6", "E6", "A6", "C7"], 0.4, -10);

  const bass = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.006, decay: 0.5, sustain: 0.35, release: 0.15 },
    volume: -16,
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
        // the fingers pinch the strings together, the lowest a hair early
        e.notes.forEach((n, k) => guitar.triggerAttackRelease(n, e.dur, time + k * 0.006, e.vel));
      } else if (e.voice === "strum") {
        e.notes.forEach((n, k) => guitar.triggerAttackRelease(n, e.dur, time + k * 0.018, e.vel));
      } else if (e.voice === "thumb") {
        guitar.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "lead") {
        flute.triggerAttackRelease(e.notes, e.dur, time, e.vel);
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
      flute.releaseAll();
      guitar.releaseAll();
      bass.releaseAll();
    },
  };
}
