import * as Tone from "tone";
import type { JazzBar, JazzPiece } from "../pieces/types";
import { SAMPLES } from "./piano";
import { collector, midi, transpose, type Kit, type NoteEvent } from "./score";

// where a sixteenth step falls, in beats: the second eighth of each beat moves to the last triplet
const swing = (step: number) => {
  const b = Math.floor(step / 4);
  const s = step - b * 4;
  return b + (s < 2 ? s / 3 : 2 / 3 + (s - 2) / 6);
};

// left-hand comping, [step, sixteenths]: Charleston, pushes onto the and of 2 and 3, and a chord anticipating the next bar on the and of 4
const COMP = [
  [[0, 3], [6, 2]],
  [[6, 4], [14, 2]],
  [[4, 2], [10, 4]],
  [[2, 2], [8, 3], [14, 2]],
  [[0, 6], [10, 2], [14, 2]],
  [[6, 2], [10, 4]],
];
// the ride's ding, ding-a ding, ding-a, leaning on 2 and 4
const RIDE = [
  [0, 0.55],
  [4, 0.8],
  [6, 0.4],
  [8, 0.55],
  [12, 0.8],
  [14, 0.4],
];
// the drums' phrases when they solo, one per beat: [beat fraction, voice, pitch, velocity]
const LICKS: [number, string, string, number][][] = [
  [[0, "snare", "", 0.85], [2 / 3, "snare", "", 0.35]],
  [[0, "tom", "D3", 0.7], [1 / 3, "tom", "A2", 0.6], [2 / 3, "tom", "E2", 0.7]],
  [[0, "kick", "C1", 0.8], [0, "ride", "", 0.9], [2 / 3, "snare", "", 0.4]],
  [[1 / 3, "snare", "", 0.45], [2 / 3, "snare", "", 0.8]],
  [[0, "snare", "", 0.4], [1 / 3, "snare", "", 0.5], [2 / 3, "tom", "A2", 0.75]],
  [[2 / 3, "kick", "C1", 0.7]],
];

const name = (p: number) => transpose("C0", p - 12);
// the upright's range for walking: E1 to D3
const LOW = 28;
const HIGH = 50;
const place = (note: string, near: number) => {
  let p = midi(note) % 12;
  while (p < LOW) p += 12;
  while (p + 12 <= HIGH && Math.abs(p + 12 - near) < Math.abs(p - near)) p += 12;
  return p;
};
const fit = (p: number) => (p < LOW ? p + 12 : p > HIGH ? p - 12 : p);

// the third and fifth of a chord, read from its voicing
function tones(chord: string[]) {
  const root = midi(chord[0]) % 12;
  const has = new Set(chord.slice(1).map((n) => (midi(n) - root + 120) % 12));
  const third = has.has(3) ? 3 : has.has(4) ? 4 : 5;
  const fifth = has.has(7) || !(has.has(6) || has.has(8)) ? 7 : has.has(6) ? 6 : 8;
  return { third, fifth };
}

export function renderJazz(piece: JazzPiece) {
  const beat = 60 / piece.bpm;
  const barLen = beat * 4;
  const { events, add } = collector();
  let seed = 23;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  let held: NoteEvent[] = [];
  let bassAt = 40;
  let prevPitch = 0;
  let pushed = false;

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const at = (step: number) => t + swing(step) * beat;
    const chordAt = (step: number) => (step >= 8 && bar.c2 ? bar.c2 : bar.c);
    const next: JazzBar = piece.bars[(i + 1) % piece.bars.length];
    const solo = bar.drums === "solo";

    // walking: the root on the beat, chord tones between, and a semitone into the next root
    if (bar.bass && !bar.hits && !solo) {
      const spans: [number, string[], string[]][] = bar.c2
        ? [
            [0, bar.c, bar.c2],
            [8, bar.c2, next.c],
          ]
        : [[0, bar.c, next.c]];
      for (const [s, chord, to] of spans) {
        const beats = bar.c2 ? 2 : 4;
        const root = place(chord[0], bassAt);
        const { third, fifth } = tones(chord);
        let line: number[];
        if (bar.bass === "two") {
          line = beats === 4 ? [root, fit(root + (rand() < 0.5 ? fifth : fifth - 12))] : [root];
        } else if (beats === 4) {
          line = pick([
            [root, root + third, root + fifth],
            [root, root + 2, root + third],
            [root, fit(root + fifth - 12), fit(root + third - 12)],
            [root, root + fifth, root + 12 > HIGH ? root + third : root + 12],
          ]).map(fit);
        } else {
          line = [root];
        }
        const last = line[line.length - 1];
        const target = place(to[0], last);
        if (bar.bass === "walk") line.push(fit(rand() < 0.2 ? target + 7 - (target + 7 > HIGH ? 12 : 0) : target + (target > last ? -1 : 1)));
        const step = bar.bass === "two" ? 8 : 4;
        line.forEach((p, k) => add(at(s + k * step), "bass", name(p), (step / 4) * beat * 0.92, k ? 0.72 + rand() * 0.12 : 0.9));
        bassAt = line[line.length - 1];
      }
    }

    // the left hand: rootless voicings in Charleston and anticipation rhythms
    if (bar.comp && !bar.hits && !solo) {
      const anticipate = next.comp && !next.hits && next.drums !== "solo";
      const was = pushed;
      pushed = false;
      for (const [s, n] of pick(COMP)) {
        if (s === 0 && was) continue;
        const chord = s === 14 ? (anticipate ? next.c : null) : chordAt(s);
        if (!chord) continue;
        add(at(s) + rand() * 0.01, "comp", chord.slice(1), (swing(s + n) - swing(s)) * beat * 0.85, 0.22 + rand() * 0.08);
        pushed = s === 14;
      }
    } else {
      pushed = false;
    }

    // stop-time: everyone on the melody's notes
    if (bar.hits) {
      let s = 0;
      for (const [note, n] of bar.m ?? []) {
        if (note !== "-" && note !== "~") {
          const chord = chordAt(s);
          const len = (swing(s + Math.min(n, 4)) - swing(s)) * beat * 0.7;
          add(at(s), "comp", chord.slice(1), len, 0.25);
          add(at(s), "bass", name(place(chord[0], bassAt)), len, 0.9);
          add(at(s), "snare", [], 0.1, s === 0 ? 0.85 : 0.55);
          add(at(s), "feather", "C1", 0.2, 0.6);
        }
        s += n;
      }
    }

    // drums
    const fill = bar.fill ? 8 : 16;
    if (bar.drums === "ride") {
      for (const [s, v] of RIDE) if (s < fill) add(at(s) + (rand() - 0.5) * 0.006, "ride", [], 0.6, v * (0.9 + rand() * 0.2));
      for (const s of [4, 12]) if (s < fill) add(at(s), "chick", [], 0.05, 0.6);
      for (let s = 0; s < fill; s += 4) add(at(s), "feather", "C1", 0.2, 0.1);
      // the snare comps lightly on the swung eighths
      for (let s = 2; s < fill; s += 2) if (rand() < 0.16) add(at(s), "snare", [], 0.06, 0.15 + rand() * 0.2);
      if (next.crash && !bar.fill) add(at(14), "kick", "C1", 0.3, 0.6);
    } else if (bar.drums === "brush") {
      // one stir of the brush each half bar, the other brush tapping 2 and 4 and the swung eighths before them
      for (let s = 0; s < fill; s += 8) add(at(s), "swish", [], beat * 1.9, 0.6);
      for (const [s, v] of [
        [2, 0.2],
        [4, 0.5],
        [10, 0.2],
        [12, 0.5],
      ])
        if (s < fill) add(at(s), "brush", [], 0.1, v * (0.85 + rand() * 0.3));
      for (const s of [4, 12]) if (s < fill) add(at(s), "chick", [], 0.05, 0.45);
      for (const s of [0, 8]) if (s < fill) add(at(s), "feather", "C1", 0.2, 0.1);
    } else if (solo) {
      for (let b = 0; b < (bar.fill ? 2 : 4); b++) {
        for (const [f, voice, note, v] of pick(LICKS)) add(t + (b + f) * beat, voice, note ? [note] : [], 0.3, v);
        if (b % 2) add(t + b * beat, "chick", [], 0.05, 0.6);
      }
    }
    if (bar.fill) {
      // triplets on the snare, then down the toms
      [0, 1, 2].forEach((k) => add(t + (2 + k / 3) * beat, "snare", [], 0.08, 0.4 + k * 0.12));
      ["D3", "A2", "E2"].forEach((n, k) => add(t + (3 + k / 3) * beat, "tom", n, 0.3, 0.6 + k * 0.1));
    }
    if (bar.crash) {
      add(t, "crash", [], 2.5, 0.7);
      add(t, "kick", "C1", 0.3, 0.7);
    }

    // the melody, swung, with a crushed grace note into some long notes
    let s = 0;
    for (const [note, n] of bar.m ?? []) {
      const end = at(s + n);
      if (note === "~") {
        for (const e of held) e.dur = end - e.t;
      } else if (note === "-") {
        held = [];
      } else {
        const start = at(s);
        const p = midi(note);
        if (n >= 4 && Math.abs(p - prevPitch) >= 3 && rand() < 0.45) add(start - 0.05, "grace", name(p - 1), 0.06, 0.4);
        const vel = (s % 4 ? 0.78 : 0.7) + rand() * 0.08;
        add(start, "lead", note, end - start, vel);
        held = [events[events.length - 1]];
        if (bar.oct) {
          add(start, "low", name(p - 12), end - start, vel * 0.75);
          held.push(events[events.length - 1]);
        }
        prevPitch = p;
      }
      s += n;
    }
  });

  return { events, end: piece.bars.length * barLen };
}

export function jazzKit(): Kit {
  const out = new Tone.Compressor(-18, 2.5);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const room = new Tone.Reverb({ decay: 1.8, wet: 0.22 }).connect(out);

  const piano = new Tone.Sampler({
    urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    release: 0.9,
    volume: 3,
  }).connect(room);

  // upright bass from the FluidR3 GM soundfont (CC BY 3.0), rendered by gleitz/midi-js-soundfonts; the takes start where they reach a tenth of their peak
  const trim = (buf: Tone.ToneAudioBuffer) => {
    const ch = buf.getChannelData(0);
    const peak = ch.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
    return buf.slice(Math.max(0, ch.findIndex((x) => Math.abs(x) >= peak / 10) / buf.sampleRate - 0.003));
  };
  const bass = new Tone.Sampler({ release: 0.15, volume: 2 });
  bass.chain(new Tone.Filter(2200, "lowpass"), out);
  for (const n of ["C1", "Eb1", "Gb1", "A1", "C2", "Eb2", "Gb2", "A2", "C3", "Eb3"]) {
    new Tone.ToneAudioBuffer(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_bass-mp3/${n}.mp3`, (buf) => bass.add(n as Tone.Unit.Note, trim(buf)));
  }

  // ride: a ringing metallic ping over a hiss of wash
  const ride = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 1.2, release: 0.3 },
    harmonicity: 5.1,
    modulationIndex: 20,
    resonance: 5200,
    octaves: 1.2,
    volume: -30,
  });
  ride.chain(new Tone.Filter(3000, "highpass"), room);
  const wash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 0.45, sustain: 0 }, volume: -19 });
  wash.chain(new Tone.Filter(7000, "highpass"), room);
  const chick = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 0.035, sustain: 0 }, volume: -14 });
  chick.chain(new Tone.Filter({ frequency: 5000, type: "bandpass", Q: 1.2 }), out);
  const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 }, volume: -20 });
  snare.chain(new Tone.Filter(2200, "bandpass"), room);
  const body = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 },
    volume: -18,
  }).connect(room);
  const brush = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.004, decay: 0.14, sustain: 0 }, volume: 2 });
  brush.chain(new Tone.Filter({ frequency: 3200, type: "bandpass", Q: 0.7 }), room);
  const swish = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.3, decay: 0.4, sustain: 0.5, release: 0.3 }, volume: -10 });
  swish.chain(new Tone.Filter({ frequency: 2800, type: "bandpass", Q: 0.8 }), out);
  // the bass drum: accents, and a second one feathering quarter notes under them
  const thump = (volume: number) => {
    const k = new Tone.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 3,
      envelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.1 },
      volume,
    });
    k.chain(new Tone.Filter(400, "lowpass"), out);
    return k;
  };
  const kick = thump(-10);
  const feather = thump(-10);
  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 1.6,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 },
    volume: -14,
  }).connect(room);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 2.2, sustain: 0 }, volume: -32 });
  crash.chain(new Tone.Filter(5000, "highpass"), room);

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "lead" || e.voice === "low" || e.voice === "grace") {
        piano.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "comp") {
        // the left hand rolls its voicing a hair from the bottom
        e.notes.forEach((n, k) => piano.triggerAttackRelease(n, e.dur, time + k * 0.008, e.vel));
      } else if (e.voice === "bass") {
        bass.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "ride") {
        ride.triggerAttackRelease(420, e.dur, time, e.vel);
        wash.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "chick") {
        chick.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "snare") {
        snare.triggerAttackRelease(e.dur, time, e.vel);
        if (e.vel >= 0.4) body.triggerAttackRelease("G3", e.dur, time, e.vel);
      } else if (e.voice === "brush") {
        brush.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "swish") {
        swish.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "feather") {
        feather.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "tom") {
        tom.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      piano.releaseAll();
      bass.releaseAll();
    },
  };
}
