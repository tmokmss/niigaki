import { fitCanvas, midi, type NoteEvent } from "./score";

type Bullet = { x: number; y: number; vx: number; vy: number; r: number; hue: number };

const MAX_BULLETS = 2500;
const HUES = [140, 170, 110, 190];

export function danmaku(canvas: HTMLCanvasElement) {
  const ctx = fitCanvas(canvas);
  const dpr = devicePixelRatio;
  const bullets: Bullet[] = [];
  const stars = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), s: 0.2 + Math.random() * 0.8 }));
  let palette = 0;
  let hue = HUES[0];
  let pulse = 0;
  let lastBass = -1;
  let ringSpin = 0;
  let spiral = 0;
  let clock = 0;
  let px = canvas.width / 2;
  let last = performance.now();

  const boss = () => ({ x: canvas.width / 2 + Math.sin(clock * 0.5) * canvas.width * 0.12, y: canvas.height * 0.26 });
  const player = () => ({ x: px, y: canvas.height * 0.86 });

  const shoot = (angle: number, speed: number, r: number, h: number, from = boss()) => {
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
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    const W = canvas.width;
    const H = canvas.height;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `hsl(${hue} 40% 5%)`;
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

    const b = boss();
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

    const p = player();
    let target = W / 2 + Math.sin(clock * 0.7) * W * 0.22;
    for (const u of bullets) {
      const dx = p.x - u.x;
      const dy = p.y - u.y;
      if (Math.abs(dx) < 70 * dpr && Math.abs(dy) < 90 * dpr) target += Math.sign(dx || 1) * 60 * dpr;
    }
    px += (Math.min(W * 0.9, Math.max(W * 0.1, target)) - px) * Math.min(1, dt * 5);
    const s = 9 * dpr;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - s * 1.4);
    ctx.lineTo(p.x - s, p.y + s);
    ctx.lineTo(p.x + s, p.y + s);
    ctx.closePath();
    ctx.fillStyle = "rgba(240,240,255,0.9)";
    ctx.fill();
    circle(p.x, p.y, 2.5 * dpr, "#ff4060");

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
      const p = player();
      const aim = Math.atan2(p.y - b.y, p.x - b.x);
      for (let i = -2; i <= 2; i++) shoot(aim + i * 0.12, 260, 4.5, 355);
    }
    if (e.voice === "crash") {
      hue = HUES[++palette % HUES.length];
      ring(48, 120, 5, hue, 0);
      ring(48, 180, 4, hue + 30, Math.PI / 48);
    }
  };
}
