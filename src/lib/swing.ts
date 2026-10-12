import * as Tone from "tone";
import type { SwingBar, SwingPiece } from "../pieces/types";
import { collector, midi, transpose, type Kit, type NoteEvent } from "./score";

// electro swing in sixteenth-note-triplet steps (6 per beat): a swung eighth falls on the 4th step of a beat
const STEPS = 24;
const KICK = [0, 6, 12, 18];
const CLAP = [6, 18];
// soft hats on the beat, the swung off-beats pushed
const HATS = [0, 4, 6, 10, 12, 16, 18, 22];
// the piano's off-beat chords on 2 and 4
const COMP = [6, 18];
// the horn section: [step, length in steps, velocity]
const STABS = {
  charleston: [
    [0, 4, 0.8],
    [10, 2, 0.7],
  ],
  chop: [
    [12, 1, 0.75],
    [16, 1, 0.5],
    [18, 1, 0.7],
    [22, 1.5, 0.85],
  ],
};

const cutoff = (open: number) => 350 * Math.pow(50, open);
const name = (m: number) => transpose("C4", m - 60);
// the same pitch class, moved by octaves into [lo, lo + 12)
const into = (note: string, lo: string) => {
  const l = midi(lo);
  return name(l + ((((midi(note) - l) % 12) + 12) % 12));
};

export function renderSwing(piece: SwingPiece) {
  const beat = 60 / piece.bpm;
  const step = beat / 6;
  const barLen = beat * 4;
  const { events, add } = collector();
  let seed = 5;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let held: NoteEvent[] = [];

  const line = (t: number, voice: string, m: [string, number][], vel: number) => {
    let mt = t;
    for (const [note, n] of m) {
      const dur = n * step;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else {
        add(mt + rand() * 0.012, voice, note, dur * 0.9, vel + rand() * 0.12);
        held = [events[events.length - 1]];
      }
      mt += dur;
    }
  };

  // root low, then the chord tone nearest a fifth above, then the walk into the next bar's root by a semitone
  const walk = (bar: SwingBar, next: SwingBar) => {
    const root = (c: string[]) => midi(into(c[0], "E1"));
    const tone = (c: string[], target: number) => {
      const r = root(c);
      const ups = c.slice(1).map((n) => (((midi(n) - r) % 12) + 12) % 12);
      return r + ups.reduce((best, x) => (Math.abs(x - target) < Math.abs(best - target) ? x : best), 12);
    };
    const r1 = root(bar.c);
    const to = root(next.c);
    const third = bar.c2 ? root(bar.c2) : tone(bar.c, 7);
    const second = bar.c2 ? tone(bar.c, 7) : tone(bar.c, 4);
    const last = to > third ? to - 1 : to + 1;
    return [r1, second, third, last].map(name);
  };

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const at = (s: number) => (s >= 12 && bar.c2 ? bar.c2 : bar.c);
    const next = piece.bars[(i + 1) % piece.bars.length];
    const only = (list: number[]) => (bar.stop ? list.filter((s) => s === 0) : list);

    add(t, "open", [], barLen, bar.open ?? 1);
    if (bar.crash) add(t, "crash", [], 3, 0.6);

    for (const s of bar.stop ? [0] : COMP) {
      add(t + s * step + rand() * 0.008, "piano", at(s).slice(1), 2.2 * step, (s === 0 ? 0.6 : 0.42) + rand() * 0.06);
    }
    if (bar.bass) {
      walk(bar, next).forEach((n, k) => {
        if (bar.stop && k) return;
        add(t + k * 6 * step, "bass", n, 5 * step, k % 2 ? 0.6 : 0.75);
      });
    }
    if (bar.beat) {
      for (const s of only(KICK)) add(t + s * step, "kick", "C1", 0.3, 0.9);
      for (const s of only(bar.fill ? [6] : CLAP)) add(t + s * step, "clap", [], 0.15, 0.7);
      if (!bar.stop) {
        for (const s of HATS) add(t + s * step + (rand() - 0.5) * 0.006, "hat", [], 0.05, (s % 6 ? 0.55 : 0.3) * (0.85 + rand() * 0.3));
      }
      if (bar.fill) for (let s = 12; s < STEPS; s += 2) add(t + s * step, "snare", [], 0.1, 0.35 + (s - 12) * 0.05);
    }
    if (bar.stab) {
      for (const [s, n, vel] of STABS[bar.stab]) {
        if (bar.stop && s) continue;
        const c = at(s);
        const top = into(c[c.length - 1], "F4");
        const mid = into(c[c.length - 2], "C4");
        add(t + s * step, "stab", [into(c[0], "A#2"), mid === top ? into(c[c.length - 3], "C4") : mid, top], n * step, vel);
      }
    }

    line(t, bar.lead === "clarinet" ? "clarinet" : bar.lead === "piano" ? "celesta" : "lead", bar.m ?? [], bar.lead === "piano" ? 0.5 : 0.62);
    if (bar.a) line(t, "sax", bar.a, 0.55);
  });

  const end = piece.bars.length * barLen;
  return { events, end };
}

export function swingKit(): Kit {
  const out = new Tone.Compressor(-18, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  // the gramophone: a low-pass the intro opens up
  const lowpass = new Tone.Filter({ frequency: cutoff(1), type: "lowpass", rolloff: -24 }).connect(out);
  const reverb = new Tone.Reverb({ decay: 1.6, wet: 0.2 }).connect(lowpass);

  // samples from tonejs-instruments by Nicholas Brosowsky (CC BY 3.0)
  // the recordings open with silence or breath: each starts where it reaches a tenth of its peak
  const trim = (buf: Tone.ToneAudioBuffer) => {
    const ch = buf.getChannelData(0);
    const peak = ch.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
    return buf.slice(Math.max(0, ch.findIndex((x) => Math.abs(x) >= peak / 10) / buf.sampleRate - 0.005));
  };
  const sampler = (dir: string, notes: string[], release: number, volume: number, to: Tone.InputNode) => {
    const s = new Tone.Sampler({ release, volume }).connect(to);
    for (const n of notes) {
      const url = `https://nbrosowsky.github.io/tonejs-instruments/samples/${dir}/${n.replace("#", "s")}.mp3`;
      new Tone.ToneAudioBuffer(url, (buf) => s.add(n as Tone.Unit.Note, trim(buf)));
    }
    return s;
  };
  const piano = sampler("piano", ["A2", "C3", "D#3", "F#3", "A3", "C4", "D#4", "F#4", "A4", "C5", "D#5", "F#5", "A5", "C6", "D#6", "F#6"], 0.3, -10, reverb);
  const celesta = sampler("piano", ["A4", "C5", "D#5", "F#5", "A5", "C6", "D#6", "F#6", "A6"], 0.8, -6, reverb);
  const trumpet = sampler("trumpet", ["F3", "A3", "C4", "D#4", "G4", "A#4", "D5", "F5", "A5", "C6"], 0.15, -8, reverb);
  const clarinet = sampler("clarinet", ["D3", "F3", "A#3", "D4", "F4", "A#4", "D5", "F5", "A#5", "D6"], 0.2, -6, reverb);
  const sax = sampler("saxophone", ["C#3", "E3", "G3", "A#3", "C#4", "E4", "G4", "A#4", "C#5", "E5", "G5", "A5"], 0.15, -6, reverb);
  // the section's own players, a little apart from the soloists
  const hornTrumpet = sampler("trumpet", ["F3", "A3", "C4", "D#4", "G4", "A#4", "D5", "F5"], 0.08, -14, reverb);
  const hornSax = sampler("saxophone", ["A#3", "C#4", "E4", "G4", "A#4", "C#5"], 0.08, -15, reverb);
  const trombone = sampler("trombone", ["A#1", "C#2", "D#2", "F2", "G#2", "A#2", "C3", "D3", "D#3", "F3", "G#3", "A#3", "C4"], 0.08, -12, reverb);
  const bass = sampler("contrabass", ["F#1", "G1", "A#1", "C2", "D2", "E2", "F#2", "G#2", "A2", "C#3", "E3", "G#3"], 0.1, -7, lowpass);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.045,
    octaves: 5,
    envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.05 },
    volume: -6,
  });
  kick.chain(new Tone.Filter(900, "lowpass"), lowpass);
  const clap = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 }, volume: -10 });
  clap.chain(new Tone.Filter({ frequency: 1400, type: "bandpass", Q: 1.2 }), reverb);
  const snare = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.001, decay: 0.09, sustain: 0 }, volume: -12 });
  snare.chain(new Tone.Filter(400, "highpass"), reverb);
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.035, sustain: 0 }, volume: -16 });
  hat.chain(new Tone.Filter(8000, "highpass"), lowpass);
  const crash = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.01, decay: 2.2, sustain: 0 }, volume: -28 });
  crash.chain(new Tone.Filter(4500, "highpass"), reverb);

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "open") {
        lowpass.frequency.exponentialRampTo(cutoff(e.vel), e.dur, time);
      } else if (e.voice === "piano") {
        piano.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "celesta") {
        celesta.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "lead") {
        trumpet.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "clarinet") {
        clarinet.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "sax") {
        sax.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "stab") {
        trombone.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        hornSax.triggerAttackRelease(e.notes[1], e.dur, time, e.vel);
        hornTrumpet.triggerAttackRelease(e.notes[2], e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        bass.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "clap") {
        // a clap is a few hands a hair apart
        for (const d of [0, 0.011, 0.022]) clap.triggerAttackRelease(e.dur, time + d, e.vel * (d ? 0.7 : 1));
      } else if (e.voice === "snare") {
        snare.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      for (const s of [piano, celesta, trumpet, clarinet, sax, hornTrumpet, hornSax, trombone, bass]) s.releaseAll();
    },
  };
}
