import * as Tone from "tone";
import type { Piece } from "../pieces/types";
import { midi, render, type NoteEvent } from "./score";

const SAMPLES = ["A0", "C1", "D#1", "F#1", "A1", "C2", "D#2", "F#2", "A2", "C3", "D#3", "F#3", "A3",
  "C4", "D#4", "F#4", "A4", "C5", "D#5", "F#5", "A5", "C6", "D#6", "F#6", "A6", "C7"];

function instruments(bpm: number) {
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.4 }).toDestination();

  const piano = new Tone.Sampler({
    urls: Object.fromEntries(SAMPLES.map((n) => [n, `${n.replace("#", "s")}.mp3`])),
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    release: 1.6,
  }).connect(reverb);

  const bell = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 7,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.002, decay: 1.6, sustain: 0, release: 1.6 },
    modulationEnvelope: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.4 },
    volume: -15,
  });
  bell.chain(new Tone.FeedbackDelay({ delayTime: (60 / bpm) * 0.75, feedback: 0.22, wet: 0.18 }), reverb);

  const mallet = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 4,
    modulationIndex: 3,
    envelope: { attack: 0.002, decay: 0.5, sustain: 0, release: 0.5 },
    modulationEnvelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.2 },
    volume: -26,
  }).connect(reverb);

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 2.2, decay: 0.5, sustain: 0.8, release: 3.5 },
    volume: -26,
  });
  pad.chain(new Tone.Filter(1400, "lowpass"), reverb);

  return { piano, bell, mallet, pad };
}

type Dot = { x: number; y: number; r: number; a: number; gold: boolean };

function visualizer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const dots: Dot[] = [];
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
  };
  addEventListener("resize", resize);
  resize();

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      d.y += 0.25 * devicePixelRatio;
      d.a *= 0.985;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.gold ? `rgba(240,196,120,${d.a * 0.6})` : `rgba(216,219,226,${d.a * 0.5})`;
      ctx.fill();
      if (d.a < 0.01) dots.splice(i, 1);
    }
    requestAnimationFrame(draw);
  };
  draw();

  return (note: string, vel: number, gold: boolean) =>
    dots.push({
      x: ((midi(note) - 28) / 72) * canvas.width,
      y: canvas.height * (0.15 + Math.random() * 0.45),
      r: (4 + vel * 14) * devicePixelRatio,
      a: vel,
      gold,
    });
}

export function mount(piece: Piece, els: { canvas: HTMLCanvasElement; button: HTMLButtonElement; status: HTMLElement }) {
  const { piano, bell, mallet, pad } = instruments(piece.bpm);
  const spark = visualizer(els.canvas);
  const transport = Tone.getTransport();
  const draw = Tone.getDraw();
  const label = els.status.textContent;
  let playing = false;

  const play = (e: NoteEvent, time: number) => {
    const [note] = e.notes;
    if (e.voice === "piano") {
      const t = Math.max(0, time + (Math.random() - 0.5) * 0.02);
      piano.triggerAttackRelease(note, e.dur, t, e.vel);
      draw.schedule(() => spark(note, e.vel, false), t);
    } else if (e.voice === "bell") {
      bell.triggerAttackRelease(note, e.dur, time, e.vel);
      draw.schedule(() => spark(note, e.vel, true), time);
    } else if (e.voice === "mallet") {
      mallet.triggerAttackRelease(note, e.dur, time, e.vel);
    } else {
      pad.triggerAttackRelease(e.notes, e.dur, time, e.vel);
    }
  };

  const stopped = () => {
    playing = false;
    els.button.textContent = "PLAY";
  };

  els.button.addEventListener("click", async () => {
    if (playing) {
      transport.stop();
      transport.cancel();
      piano.releaseAll();
      bell.releaseAll();
      pad.releaseAll();
      stopped();
      return;
    }
    els.button.disabled = true;
    els.status.textContent = "ピアノ音源を読み込み中…";
    await Tone.start();
    await Tone.loaded();
    els.status.textContent = label;
    els.button.disabled = false;

    transport.cancel();
    transport.position = 0;
    const { events, end } = render(piece);
    for (const e of events) transport.schedule((time) => play(e, time), e.t);
    transport.schedule((time) => draw.schedule(stopped, time), end);
    transport.start("+0.1");
    playing = true;
    els.button.textContent = "STOP";
  });
}
