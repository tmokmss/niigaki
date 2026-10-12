import * as Tone from "tone";
import type { Instrument, OrchestraPiece } from "../pieces/types";
import { collector, midi, transpose, type Kit, type NoteEvent } from "./score";

// the velocity of a dynamic from pp (0) to ff (1)
const level = (dyn: number) => 0.3 + 0.7 * dyn;
const name = (p: number) => transpose("C0", p - 12);
// the timpani tuned to the chord's root between D2 and C#3
const drum = (chord: string[]) => name(38 + (((midi(chord[0]) - 38) % 12) + 12) % 12);
// the chord's upper notes and the two octaves above them, low to high
const ladder = (chord: string[]) =>
  [0, 12, 24].flatMap((o) => chord.slice(1).map((n) => midi(n) + o)).sort((x, y) => x - y);

export function renderOrchestra(piece: OrchestraPiece) {
  const beat = 60 / piece.bpm;
  const six = beat / 4;
  const barLen = beat * 4;
  const { events, add } = collector();
  let dyn = piece.bars[piece.bars.length - 1].dyn ?? 0.5;
  const held: Record<string, NoteEvent[]> = { lead: [], counter: [] };

  // a line of [note, sixteenths]: each note on every instrument given, "~" holding the notes before
  const line = (t: number, key: "lead" | "counter", notes: [string, number][], parts: [string, Instrument, number][], vel: (s: number) => number) => {
    let s = 0;
    for (const [note, n] of notes) {
      if (note === "~") {
        for (const e of held[key]) e.dur += n * six;
      } else if (note === "-") {
        held[key] = [];
      } else {
        held[key] = parts.map(([voice, inst, shift]) => {
          add(t + s * six, voice, [transpose(note, shift), inst], n * six, vel(s) * (s % 4 ? 0.85 : 0.95) * (voice === "double" ? 0.8 : 1));
          return events[events.length - 1];
        });
      }
      s += n;
    }
  };

  piece.bars.forEach((bar, i) => {
    const t = i * barLen;
    const next = piece.bars[(i + 1) % piece.bars.length];
    const from = dyn;
    const to = (dyn = bar.dyn ?? dyn);
    const vel = (s: number) => level(from + ((to - from) * s) / 16);
    const chordAt = (s: number) => (s >= 8 && bar.c2 ? bar.c2 : bar.c);
    const halves: [number, string[]][] = bar.c2 ? [[0, bar.c], [8, bar.c2]] : [[0, bar.c]];
    const span = (16 / halves.length) * six;

    // the held chords swell or fade towards the bar's dynamic
    add(t, "dyn", [], barLen, level(to));

    if (bar.strings === "pizz") {
      // the original's left hand: on 1, on the and of 2, and on the and of 4 into the next chord
      for (const [s, chord] of [[0, bar.c], [6, bar.c2 ?? bar.c], [14, next.c]] as const) {
        add(t + s * six, "pizz", [transpose(chord[0], -12), ...chord], 0.5, vel(s) * (s ? 0.7 : 0.85));
      }
    } else if (bar.strings) {
      for (const [s, chord] of halves) {
        const root = [chord[0], transpose(chord[0], -12)];
        if (bar.strings === "tremolo") {
          for (let k = 0; k < span / (six / 2) - 0.5; k++) add(t + (s + k / 2) * six, "tremolo", chord.slice(1), six / 2, k % 2 ? 0.55 : 0.7);
        } else {
          add(t + s * six, "strings", chord.slice(1), span, 0.7);
        }
        if (bar.strings === "pulse") {
          for (let k = 0; k < span / (2 * six) - 0.5; k++) add(t + (s + 2 * k) * six, "bass", root, six * 1.7, k % 2 ? 0.6 : 0.85);
        } else {
          add(t + s * six, "bass", root, span, 0.8);
        }
      }
    }

    if (bar.brass) for (const [s, chord] of halves) add(t + s * six, "brass", chord, span, 0.75);

    if (bar.harp === "arp") {
      for (let s = 0; s < 16; s++) {
        add(t + s * six, "arp", name(ladder(chordAt(s))[s < 8 ? s : 15 - s]), six * 4, vel(s) * (s % 4 ? 0.4 : 0.5));
      }
    } else if (bar.harp === "gliss") {
      const up = ladder(chordAt(12));
      for (let k = 0; k < 8; k++) add(t + (12 + k / 2) * six, "arp", name(up[k + 1]), six * 4, vel(12) * (0.3 + k * 0.05));
    }

    if (bar.timp === "hit") {
      add(t, "timpani", drum(bar.c), 1.5, vel(0));
      if (bar.c2) add(t + 8 * six, "timpani", drum(bar.c2), 1.5, vel(8) * 0.7);
    } else if (bar.timp === "roll") {
      for (let k = 0; k < 24; k++) add(t + (k * barLen) / 24, "roll", drum(chordAt((k * 2) / 3)), 0.4, (0.15 + (0.6 * k) / 24) * level(to));
    }
    if (bar.cymbal === "crash") add(t, "crash", [], 3, vel(0));
    if (bar.cymbal === "swell") add(t, "swell", [], barLen, 0.8);

    const lead = bar.lead ?? ["violin"];
    line(
      t,
      "lead",
      bar.m ?? [],
      [...lead.map((inst, k): [string, Instrument, number] => [k ? "double" : "lead", inst, 0]), ...(bar.low ?? []).map((inst): [string, Instrument, number] => ["double", inst, -12])],
      vel,
    );
    line(t, "counter", bar.a ?? [], [["counter", bar.counter ?? "horn", 0]], (s) => vel(s) * 0.8);
  });

  return { events, end: piece.bars.length * barLen };
}

export function orchestraKit(bpm: number): Kit {
  const out = new Tone.Compressor(-20, 3);
  out.chain(new Tone.Limiter(-1), Tone.getDestination());
  const hall = new Tone.Reverb({ decay: 4.5, preDelay: 0.03, wet: 0.38 }).connect(out);
  // the held chords, whose level follows the dynamics
  const pads = new Tone.Gain(0.5).connect(hall);

  // samples from tonejs-instruments by Nicholas Brosowsky (CC BY 3.0)
  // the recordings open with silence or breath: each starts where it reaches a tenth of its peak
  const trim = (buf: Tone.ToneAudioBuffer) => {
    const ch = buf.getChannelData(0);
    const peak = ch.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
    return buf.slice(Math.max(0, ch.findIndex((x) => Math.abs(x) >= peak / 10) / buf.sampleRate - 0.005));
  };
  const sampler = (release: number, volume: number, to: Tone.InputNode, attack = 0) => {
    const s = new Tone.Sampler({ attack, release, volume });
    s.connect(to);
    return s;
  };
  // one download per note, shared by every player of the instrument
  const load = (dir: string, notes: string[], ...players: Tone.Sampler[]) => {
    for (const n of notes) {
      const url = `https://nbrosowsky.github.io/tonejs-instruments/samples/${dir}/${n.replace("#", "s")}.mp3`;
      new Tone.ToneAudioBuffer(url, (buf) => {
        const b = trim(buf);
        for (const p of players) p.add(n as Tone.Unit.Note, b);
      });
    }
  };

  const pizzBus = new Tone.Filter(1400, "lowpass").connect(hall);
  const solo: Record<Instrument, Tone.Sampler> = {
    flute: sampler(0.5, -10, hall),
    clarinet: sampler(0.4, -7, hall),
    violin: sampler(0.6, -7, hall),
    cello: sampler(0.6, -8, hall),
    horn: sampler(0.6, -11, hall),
    trumpet: sampler(0.5, -14, hall),
    trombone: sampler(0.5, -9, hall),
    harp: sampler(1.5, -10, hall),
  };
  const violins = sampler(1.2, -14, pads, 0.08);
  const cellos = sampler(1.2, -12, pads, 0.08);
  const basses = sampler(1, -12, pads, 0.05);
  const trem = sampler(0.08, -15, pads);
  const tremLow = sampler(0.08, -15, pads);
  const horns = sampler(1, -16, pads, 0.08);
  const trombones = sampler(1, -14, pads, 0.05);
  const tuba = sampler(1, -15, pads, 0.05);
  const pizz = sampler(0.3, -9, pizzBus);

  load("violin", ["G3", "A3", "C4", "E4", "G4", "A4", "C5", "E5", "G5", "A5", "C6", "E6", "G6", "A6", "C7"], solo.violin, violins, trem);
  load("cello", ["C2", "E2", "G2", "A2", "C3", "E3", "G3", "A3", "C4", "E4", "G4", "A4", "C5"], solo.cello, cellos, tremLow);
  load("contrabass", ["F#1", "G1", "A#1", "C2", "D2", "E2", "F#2", "G#2", "A2", "C#3", "E3"], basses);
  load("flute", ["C4", "E4", "A4", "C5", "E5", "A5", "C6", "E6", "A6", "C7"], solo.flute);
  load("clarinet", ["D3", "F3", "A#3", "D4", "F4", "A#4", "D5", "F5", "A#5", "D6"], solo.clarinet);
  load("french-horn", ["A1", "C2", "D#2", "G2", "D3", "F3", "A3", "C4", "D5", "F5"], solo.horn, horns);
  load("trumpet", ["F3", "A3", "C4", "D#4", "F4", "G4", "A#4", "D5", "F5", "A5", "C6"], solo.trumpet);
  load("trombone", ["A#1", "C#2", "D#2", "F2", "G#2", "A#2", "C3", "D3", "D#3", "F3", "G#3", "A#3", "C4", "D4"], solo.trombone, trombones);
  load("tuba", ["F1", "A#1", "D#2", "F2", "A#2", "D3"], tuba);
  load("harp", ["E1", "G1", "B1", "D2", "F2", "A2", "C3", "E3", "G3", "B3", "D4", "F4", "A4", "C5", "E5", "G5", "B5", "D6", "F6", "A6"], solo.harp, pizz);

  // timpani: a low membrane ringing long, with the felt mallet's thud
  const timpani = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 0.5,
    envelope: { attack: 0.003, decay: 2.4, sustain: 0, release: 1.2 },
    volume: -11,
  });
  timpani.chain(new Tone.Filter(900, "lowpass"), hall);
  const mallet = new Tone.NoiseSynth({ noise: { type: "brown" }, envelope: { attack: 0.001, decay: 0.08, sustain: 0 }, volume: -19 });
  mallet.chain(new Tone.Filter(500, "lowpass"), hall);
  const crash = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.005, decay: 3, sustain: 0 }, volume: -25 });
  crash.chain(new Tone.Filter(4000, "highpass"), hall);
  // a suspended cymbal rolled with soft mallets, rising to the next bar
  const swell = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: (4 * 60) / bpm, attackCurve: "exponential", decay: 0.1, sustain: 1, release: 0.6 },
    volume: -26,
  });
  swell.chain(new Tone.Filter(3000, "highpass"), hall);

  const range = (n: string, lo: number, hi: number) => {
    let p = midi(n);
    while (p < lo) p += 12;
    while (p > hi) p -= 12;
    return name(p);
  };

  return {
    play(e: NoteEvent, time: number) {
      if (e.voice === "dyn") {
        pads.gain.linearRampTo(e.vel, e.dur, time);
      } else if (e.voice === "lead" || e.voice === "double" || e.voice === "counter") {
        solo[e.notes[1] as Instrument].triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
      } else if (e.voice === "strings" || e.voice === "tremolo") {
        const high = e.notes.filter((n) => midi(n) >= midi("G3"));
        const low = e.notes.filter((n) => midi(n) < midi("G3"));
        const [v, c] = e.voice === "strings" ? [violins, cellos] : [trem, tremLow];
        if (high.length) v.triggerAttackRelease(high, e.dur, time, e.vel);
        if (low.length) c.triggerAttackRelease(low, e.dur, time, e.vel);
      } else if (e.voice === "bass") {
        cellos.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        basses.triggerAttackRelease(e.notes[1], e.dur, time, e.vel);
      } else if (e.voice === "pizz") {
        pizz.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "arp") {
        solo.harp.triggerAttackRelease(e.notes, e.dur, time, e.vel);
      } else if (e.voice === "brass") {
        const [root, ...upper] = e.notes;
        horns.triggerAttackRelease(upper.map((n) => range(n, midi("F3"), midi("C5"))), e.dur, time, e.vel);
        trombones.triggerAttackRelease([range(root, midi("A#1"), midi("A#2")), range(transpose(root, 7), midi("F2"), midi("F3"))], e.dur, time, e.vel);
        tuba.triggerAttackRelease(range(root, midi("F1"), midi("F2")), e.dur, time, e.vel);
      } else if (e.voice === "timpani" || e.voice === "roll") {
        timpani.triggerAttackRelease(e.notes[0], e.dur, time, e.vel);
        mallet.triggerAttackRelease(0.05, time, e.vel);
      } else if (e.voice === "crash") {
        crash.triggerAttackRelease(e.dur, time, e.vel);
      } else if (e.voice === "swell") {
        swell.triggerAttackRelease(e.dur, time, e.vel);
      }
    },
    releaseAll() {
      for (const s of [...Object.values(solo), violins, cellos, basses, trem, tremLow, horns, trombones, tuba, pizz]) s.releaseAll();
    },
  };
}
