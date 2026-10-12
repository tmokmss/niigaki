import * as Tone from "tone";
import type { CityPopPiece } from "../pieces/types";
import { collector, midi, transpose, type Kit, type NoteEvent } from "./score";

// in sixteenth-note steps, as a late-70s Tokyo studio rhythm section plays an 8-beat with a sixteenth-note feel
const KICK = [
  [0, 6, 8],
  [0, 6, 8, 11],
];
const GHOSTS = [7, 10, 15];
// closed hats on every sixteenth: quarters, then the off-eighths, then the ghosted "e" and "a"
const HAT = (s: number) => (s % 4 === 0 ? 0.55 : s % 2 === 0 ? 0.4 : 0.16);
// electric piano comping: [step, length], pushing the off-beats
const COMP = [
  [0, 2],
  [3, 1],
  [6, 2],
  [10, 2],
  [13, 3],
];
// guitar cutting: muted sixteenths, a full "chak" on the backbeat and lighter strokes on the off-eighths
const CUT = (s: number) => (s === 4 || s === 12 ? 0.6 : s % 4 === 2 ? 0.4 : 0.12);
// the bass in each half bar: [step, octave up?, length]; the pops are an octave up
const BASS: [number, boolean, number][] = [
  [0, false, 2.5],
  [3, true, 1],
  [4, false, 1],
  [6, false, 1.5],
  [7, true, 1],
];

export function renderCityPop(piece: CityPopPiece) {
  const beat = 60 / piece.bpm;
  const six = beat / 4;
  const barLen = beat * 4;
  const { events, add } = collector();
  let seed = 23;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let held: NoteEvent[] = [];

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const at = (step: number) => (step >= 8 && bar.c2 ? bar.c2 : bar.c);
    const voicing = (step: number) => at(step).slice(1);
    const halves = bar.c2 ? [0, 8] : [0];
    const next = piece.bars[(i + 1) % piece.bars.length];

    for (const s of halves) add(t + s * six, "pad", voicing(s), (16 / halves.length) * six * 0.98, 0.5);
    if (bar.beat) {
      for (const [s, n] of COMP) add(t + s * six + rand() * 0.006, "keys", voicing(s), n * six * 0.9, (s % 4 ? 0.42 : 0.55) + rand() * 0.08);
    } else {
      for (const s of halves) add(t + s * six, "roll", voicing(s), (16 / halves.length) * six, 0.5);
    }

    if (bar.guitar) {
      for (let s = 0; s < 16; s++) {
        // the top three notes of the chord, raised to the upper strings
        const top = voicing(s)
          .map((n) => (midi(n) < midi("E4") ? transpose(n, 12) : n))
          .sort((a, b) => midi(a) - midi(b))
          .slice(-3);
        const vel = CUT(s);
        add(t + s * six + (rand() - 0.5) * 0.006, "guitar", s % 2 ? [...top].reverse() : top, vel > 0.2 ? six * 0.7 : 0.03, vel * (0.9 + rand() * 0.2));
      }
    }

    if (bar.bass) {
      // the last sixteenth walks a semitone into the next root when it changes
      const to = midi(next.c[0]);
      const from = midi(at(15)[0]);
      for (const h of [0, 8]) {
        const root = at(h)[0];
        for (const [s, pop, n] of BASS) {
          if (h + s === 15 && to !== from) add(t + 15 * six, "bass", transpose(next.c[0], to > from ? -1 : 1), six * 0.9, 0.6);
          else add(t + (h + s) * six, "bass", pop ? transpose(root, 12) : root, n * six * 0.9, pop ? 0.75 : s ? 0.55 : 0.9);
        }
      }
    }

    const fill = bar.beat && next.crash && next.beat;
    if (bar.beat) {
      for (const s of KICK[i % 2]) add(t + s * six, "kick", "C1", 0.3, s ? 0.8 : 0.95);
      for (const s of [4, ...(fill ? [] : [12])]) add(t + s * six, "snare", [], 0.2, 0.9);
      for (const s of GHOSTS) if (!fill || s < 12) add(t + s * six, "snare", [], 0.05, 0.14 + rand() * 0.06);
      for (let s = 0; s < 16; s++) {
        if (fill && s >= 12) continue;
        // the open hat on the "and" of 4 every other bar
        if (s === 14 && i % 2) add(t + s * six, "ohat", [], six * 1.6, 0.5);
        else add(t + s * six + (rand() - 0.5) * 0.006, "hat", [], 0.03, HAT(s) * (0.85 + rand() * 0.3));
      }
      if (fill) {
        add(t + 12 * six, "snare", [], 0.2, 0.85);
        ["G3", "D3", "A2"].forEach((n, k) => add(t + (13 + k) * six, "tom", n, 0.3, 0.75 + k * 0.05));
      }
    }
    if (bar.crash) add(t, "crash", [], 2.5, 0.7);

    let mt = t;
    for (const [note, n] of bar.m ?? []) {
      const dur = n * six;
      if (note === "~") {
        for (const e of held) e.dur += dur;
      } else if (note === "-") {
        held = [];
      } else if (bar.brass) {
        // the trumpet takes the melody, the alto sax and the trombone the chord tones beneath it, a third or more apart
        const pcs = at((mt - t) / six).slice(1).map((c) => midi(c) % 12);
        const below = (top: number) => {
          for (let p = top - 3; p > top - 12; p--) if (pcs.includes(p % 12)) return p;
          return top - 5;
        };
        const sax = below(midi(note));
        const bone = below(sax) - 12;
        add(mt, "brass", [note, transpose(note, sax - midi(note)), transpose(note, bone - midi(note))], Math.min(dur * 0.8, beat), n >= 4 ? 0.7 : 0.6);
        held = [];
      } else {
        add(mt, "lead", note, dur * 0.95, 0.6 + rand() * 0.15);
        held = [events[events.length - 1]];
      }
      mt += dur;
    }
  });

  return { events, end: piece.bars.length * barLen };
}

export function cityPopKit(bpm: number): Kit {
  const beat = 60 / bpm;
  const out = new Tone.Compressor(-18, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const reverb = new Tone.Reverb({ decay: 2.2, wet: 0.25 }).connect(out);
  const room = new Tone.Reverb({ decay: 0.9, wet: 0.3 }).connect(out);
  const delay = new Tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.25, wet: 0.18 }).connect(reverb);

  // instrument samples from tonejs-instruments by Nicholas Brosowsky (CC BY 3.0)
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

  // DX7-style electric piano: a 1:1 FM body and a quick 14:1 tine on top, through a stereo chorus
  const chorus = new Tone.Chorus({ frequency: 1.2, delayTime: 3.5, depth: 0.5, wet: 0.5 }).start().connect(reverb);
  const body = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 1,
    modulationIndex: 1.6,
    envelope: { attack: 0.002, decay: 1.6, sustain: 0.2, release: 0.5 },
    modulationEnvelope: { attack: 0.002, decay: 0.5, sustain: 0.15, release: 0.4 },
    volume: -8.5,
  }).connect(chorus);
  const tine = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 14,
    modulationIndex: 0.6,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.2 },
    modulationEnvelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
    volume: -20.5,
  }).connect(chorus);

  // a soft detuned-saw string pad under everything
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 28 },
    envelope: { attack: 0.5, decay: 0.4, sustain: 0.8, release: 1.4 },
    volume: -22,
  });
  pad.chain(new Tone.Filter(1400, "lowpass", -24), chorus);

  const guitar = sampler("guitar-electric", ["E2", "A2", "C3", "D#3", "F#3", "A3", "C4", "D#4", "F#4", "A4", "C5", "D#5", "F#5", "A5"], 0.05, -10, out);
  const bass = sampler("bass-electric", ["C#1", "E1", "G1", "A#1", "C#2", "E2", "G2", "A#2", "C#3", "E3", "G3", "A#3", "C#4"], 0.08, -8.5, out);
  const trumpet = sampler("trumpet", ["F3", "A3", "C4", "D#4", "F4", "G4", "A#4", "D5", "F5", "A5", "C6"], 0.15, -9, reverb);
  const sax = sampler("saxophone", ["D3", "F3", "G#3", "B3", "D4", "F4", "G#4", "B4", "D5", "F5", "G#5"], 0.15, -11, reverb);
  const trombone = sampler("trombone", ["A#1", "C#2", "D#2", "F2", "G#2", "A#2", "C3", "D3", "D#3", "F3", "G#3", "A#3", "C4", "D4", "F4"], 0.15, -11, reverb);

  // a breathy, lyricon-like synth lead with a slow vibrato and a touch of glide
  const lead = new Tone.MonoSynth({
    portamento: 0.025,
    oscillator: { type: "fatsawtooth", count: 2, spread: 10 },
    filter: { Q: 1, type: "lowpass", rolloff: -24 },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.8, release: 0.15 },
    filterEnvelope: { attack: 0.04, decay: 0.4, sustain: 0.5, release: 0.2, baseFrequency: 700, octaves: 2.6 },
    volume: -17,
  });
  lead.chain(new Tone.Vibrato(5.2, 0.08), new Tone.Gain(1).fan(out, delay, reverb));

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 5,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.05 },
    volume: -7,
  }).connect(out);
  // a tight snare in a short room
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.012,
    octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.03 },
    volume: -14,
  }).fan(out, room);
  const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.16, sustain: 0 }, volume: -15 });
  snare.chain(new Tone.Filter(2200, "bandpass", -12), new Tone.Gain(1).fan(out, room));
  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.05 },
    volume: -12,
  }).fan(out, room);
  const hatFilter = new Tone.Filter(8000, "highpass").connect(out);
  const hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 }, volume: -25 }).connect(hatFilter);
  const ohat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 0.2, sustain: 0 }, volume: -28 }).connect(hatFilter);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 2.2, sustain: 0 }, volume: -27 });
  crash.chain(new Tone.Filter(6000, "highpass"), reverb);

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "keys" || e.voice === "roll") {
        // held chords are rolled up gently; comping strikes them together
        const gap = e.voice === "roll" ? 0.03 : 0.004;
        e.notes.forEach((n, k) => {
          body.triggerAttackRelease(n, e.dur, time + k * gap, e.vel);
          tine.triggerAttackRelease(n, Math.min(e.dur, 0.3), time + k * gap, e.vel);
        });
      } else if (e.voice === "pad") {
        pad.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "guitar") {
        e.notes.forEach((n, k) => guitar.triggerAttackRelease(n, e.dur, time + k * 0.005, e.vel));
      } else if (e.voice === "bass") {
        bass.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "brass") {
        const [top, mid, low] = e.notes;
        trumpet.triggerAttackRelease(top, e.dur, time, e.vel);
        sax.triggerAttackRelease(mid, e.dur, time, e.vel);
        trombone.triggerAttackRelease(low, e.dur, time, e.vel);
      } else if (e.voice === "lead") {
        lead.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "kick") {
        kick.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "snare") {
        snare.triggerAttackRelease(e.dur, time, e.vel);
        if (e.vel >= 0.4) snareBody.triggerAttackRelease("G3", e.dur, time, e.vel);
      } else if (e.voice === "tom") {
        tom.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "hat") {
        hat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "ohat") {
        ohat.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      body.releaseAll();
      tine.releaseAll();
      pad.releaseAll();
      guitar.releaseAll();
      bass.releaseAll();
      trumpet.releaseAll();
      sax.releaseAll();
      trombone.releaseAll();
      lead.triggerRelease();
    },
  };
}
