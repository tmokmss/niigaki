import * as Tone from "tone";
import { fitCanvas, midi, type NoteEvent } from "./score";

type Bullet = { x: number; y: number; vx: number; vy: number; r: number; hue: number };

const MAX_BULLETS = 2500;

const level = (db: number) => Math.min(1, Math.max(0, (db + 90) / 70));

export function danmaku(canvas: HTMLCanvasElement, hues: number[]) {
  const ctx = fitCanvas(canvas);
  const dpr = devicePixelRatio;
  const wave = new Tone.Waveform(256);
  const fft = new Tone.FFT(64);
  Tone.getDestination().connect(wave);
  Tone.getDestination().connect(fft);
  // the background is a feedback loop at half resolution: each frame redraws the previous one zoomed and rotated
  let [front, back] = [0, 1].map(() => document.createElement("canvas").getContext("2d")!);
  const bullets: Bullet[] = [];
  const stars = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), s: 0.2 + Math.random() * 0.8 }));
  let palette = 0;
  let hue = hues[0];
  let pulse = 0;
  let lastBass = -1;
  let ringSpin = 0;
  let spiral = 0;
  let clock = 0;
  let last = performance.now();

  const boss = () => ({ x: canvas.width / 2 + Math.sin(clock * 0.5) * canvas.width * 0.12, y: canvas.height * 0.26 });

  const shoot = (angle: number, speed: number, r: number, h: number) => {
    const from = boss();
    bullets.push({ x: from.x, y: from.y, vx: Math.cos(angle) * speed * dpr, vy: Math.sin(angle) * speed * dpr, r: r * dpr, hue: h });
    if (bullets.length > MAX_BULLETS) bullets.splice(0, bullets.length - MAX_BULLETS);
  };
  const ring = (n: number, speed: number, r: number, h: number, offset: number) => {
    for (let i = 0; i < n; i++) shoot(offset + (i / n) * Math.PI * 2, speed, r, h);
  };

  const circle = (x: number, y: number, r: number, fill: string) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const draw = (now: number) => {
    // 60fps is enough for the background, so high refresh rate displays skip frames
    if (now - last < 12) {
      requestAnimationFrame(draw);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    const W = canvas.width;
    const H = canvas.height;

    const b = boss();
    const spectrum = fft.getValue();
    const bass = (level(spectrum[1]) + level(spectrum[2]) + level(spectrum[3])) / 3;
    const loud = spectrum.reduce((sum, db) => sum + level(db), 0) / spectrum.length;

    const bw = Math.ceil(W / 2);
    const bh = Math.ceil(H / 2);
    for (const c of [front, back]) {
      if (c.canvas.width !== bw || c.canvas.height !== bh) {
        c.canvas.width = bw;
        c.canvas.height = bh;
      }
    }
    const cx = b.x / 2;
    const cy = b.y / 2;
    back.globalCompositeOperation = "source-over";
    back.globalAlpha = 1;
    back.fillStyle = `hsl(${hue} 40% 5%)`;
    back.fillRect(0, 0, bw, bh);
    back.save();
    back.translate(cx, cy);
    back.rotate((0.15 + loud * 0.6 + pulse * 0.3) * dt);
    const zoom = 1 + (0.4 + bass * 1.6 + pulse) * dt;
    back.scale(zoom, zoom);
    back.translate(-cx, -cy);
    back.globalAlpha = 0.94;
    back.drawImage(front.canvas, 0, 0);
    back.restore();

    back.globalCompositeOperation = "lighter";
    const samples = wave.getValue();
    const r0 = Math.min(bw, bh) * 0.22;
    back.lineWidth = 1.5 * dpr;
    back.strokeStyle = `hsla(${hue + 20} 90% 60% / 0.8)`;
    back.beginPath();
    for (let i = 0; i <= samples.length; i++) {
      const a = (i / samples.length) * Math.PI * 2 + clock * 0.2;
      const r = r0 * (1 + samples[i % samples.length] * 1.2);
      if (i) back.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else back.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    back.stroke();
    back.lineWidth = 2 * dpr;
    for (let i = 0; i < spectrum.length; i++) {
      const v = level(spectrum[i]);
      if (!v) continue;
      back.strokeStyle = `hsla(${hue - 40 + (i / spectrum.length) * 120} 90% 55% / ${v * 0.7})`;
      for (const side of [1, -1]) {
        const a = -Math.PI / 2 + side * (i + 0.5) * (Math.PI / spectrum.length) - clock * 0.1;
        back.beginPath();
        back.moveTo(cx + Math.cos(a) * r0 * 1.15, cy + Math.sin(a) * r0 * 1.15);
        back.lineTo(cx + Math.cos(a) * r0 * (1.15 + v * 0.9), cy + Math.sin(a) * r0 * (1.15 + v * 0.9));
        back.stroke();
      }
    }
    [front, back] = [back, front];

    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(front.canvas, 0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = `hsl(${hue} 50% 70%)`;
    for (const s of stars) {
      s.y += s.s * dt * 0.08;
      if (s.y > 1) {
        s.y -= 1;
        s.x = Math.random();
      }
      ctx.globalAlpha = 0.15 + 0.35 * s.s;
      ctx.fillRect(s.x * W, s.y * H, 2 * dpr * s.s, 2 * dpr * s.s);
    }
    ctx.globalAlpha = 1;

    const R = Math.min(W, H) * 0.13 * (1 + pulse * 0.08);
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeStyle = `hsla(${hue} 80% 60% / ${0.25 + pulse * 0.3})`;
    for (const [rad, dir] of [[R, 1], [R * 0.72, -1]] as const) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, rad, 0, Math.PI * 2);
      ctx.stroke();
      for (const tri of [0, Math.PI]) {
        ctx.beginPath();
        for (let k = 0; k <= 3; k++) {
          const a = clock * 0.6 * dir + tri + (k * Math.PI * 2) / 3;
          const x = b.x + Math.cos(a) * rad;
          const y = b.y + Math.sin(a) * rad;
          if (k) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = "lighter";
    for (let i = bullets.length - 1; i >= 0; i--) {
      const u = bullets[i];
      u.x += u.vx * dt;
      u.y += u.vy * dt;
      const m = 40 * dpr;
      if (u.x < -m || u.x > W + m || u.y < -m || u.y > H + m) {
        bullets.splice(i, 1);
        continue;
      }
      circle(u.x, u.y, u.r, `hsla(${u.hue} 90% 55% / 0.55)`);
      circle(u.x, u.y, u.r * 0.5, "rgba(255,255,255,0.85)");
    }

    circle(b.x, b.y, 16 * dpr * (1 + pulse * 0.5), `hsla(${hue} 90% 60% / 0.6)`);
    circle(b.x, b.y, 7 * dpr, "rgba(255,255,255,0.9)");
    ctx.globalCompositeOperation = "source-over";

    pulse *= Math.pow(0.02, dt);
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  return (e: NoteEvent) => {
    const tone = e.notes.length ? hue + ((midi(e.notes[0]) % 12) - 6) * 6 : hue;
    if (e.voice === "lead") {
      if (e.dur > 0.3) ring(20, 130, 7, tone, (ringSpin += 0.16));
      else ring(8, 190, 5, tone, (ringSpin += 0.35));
    }
    if (e.voice === "harm") ring(10, 110, 4, tone + 40, ringSpin + Math.PI / 10);
    if (e.voice === "arp") shoot((spiral += 0.45), 160, 3.5, tone + 80);
    if (e.voice === "bass" && clock - lastBass > 1) {
      lastBass = clock;
      for (const a of [-0.5, -0.25, 0, 0.25, 0.5]) shoot(Math.PI / 2 + a, 90, 12, tone - 30);
    }
    if (e.voice === "kick") pulse = 1;
    if (e.voice === "snare" && e.vel >= 0.8) {
      const b = boss();
      const aim = Math.atan2(canvas.height - b.y, canvas.width * (0.2 + Math.random() * 0.6) - b.x);
      for (let i = -2; i <= 2; i++) shoot(aim + i * 0.12, 260, 4.5, 355);
    }
    if (e.voice === "crash") {
      hue = hues[++palette % hues.length];
      ring(48, 120, 5, hue, 0);
      ring(48, 180, 4, hue + 30, Math.PI / 48);
    }
  };
}
