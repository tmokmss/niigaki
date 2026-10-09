import { fitCanvas, midi, type NoteEvent } from "./score";

const H = 54;
const SPEED = 20;

const PALETTES = [
  { bg: [12, 12, 36], lead: "#fce4a0", harm: "#f87858", arp: "#3cbcfc", bass: "#b8f818", star: "#5c94fc" },
  { bg: [32, 8, 32], lead: "#fcfcfc", harm: "#f878f8", arp: "#f8b800", bass: "#58d854", star: "#a4e4fc" },
  { bg: [6, 26, 30], lead: "#f8f878", harm: "#00e8d8", arp: "#f83800", bass: "#6888fc", star: "#d8f878" },
  { bg: [36, 18, 6], lead: "#fcfcfc", harm: "#fca044", arp: "#00b800", bass: "#f85898", star: "#fce0a8" },
];

type Voice = "lead" | "harm" | "arp" | "bass";
const THICK: Record<Voice, number> = { lead: 2, harm: 1, arp: 1, bass: 2 };

type Block = { x: number; y: number; w: number; h: number; voice: Voice };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

export function pixels(canvas: HTMLCanvasElement) {
  const ctx = fitCanvas(canvas);
  const low = document.createElement("canvas");
  const g = low.getContext("2d")!;
  const blocks: Block[] = [];
  const sparks: Spark[] = [];
  const stars = Array.from({ length: 70 }, () => ({ x: Math.random() * 200, y: Math.floor(Math.random() * H), s: 0.2 + Math.random() * 0.8 }));
  let pal = 0;
  let flash = 0;
  let shake = 0;
  let boost = 0;
  let last = performance.now();

  const width = () => Math.max(1, Math.round((H * canvas.width) / canvas.height));
  const head = () => Math.floor(width() * 0.7);
  const row = (note: string) => Math.min(H - 3, Math.max(1, Math.round(H - 4 - (midi(note) - 33) * 0.8)));

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const W = width();
    if (low.width !== W) {
      low.width = W;
      low.height = H;
    }
    const p = PALETTES[pal];
    const speed = SPEED * (1 + boost);
    const hx = head();

    const [r, gr, b] = p.bg.map((c) => Math.round(c + flash * 45));
    g.globalAlpha = 1;
    g.fillStyle = `rgb(${r},${gr},${b})`;
    g.fillRect(0, 0, W, H);

    g.fillStyle = p.star;
    for (const s of stars) {
      s.x -= s.s * speed * 0.4 * dt;
      if (s.x < 0) {
        s.x += W;
        s.y = Math.floor(Math.random() * H);
      }
      g.globalAlpha = 0.25 + 0.5 * s.s;
      g.fillRect(Math.floor(s.x % W), s.y, 1, 1);
    }

    g.globalAlpha = 0.18;
    g.fillStyle = p.lead;
    g.fillRect(hx, 0, 1, H);

    g.globalAlpha = 1;
    for (let i = blocks.length - 1; i >= 0; i--) {
      const bl = blocks[i];
      bl.x -= speed * dt;
      if (bl.x + bl.w < 0) {
        blocks.splice(i, 1);
        continue;
      }
      const visible = Math.min(bl.w, hx - bl.x);
      if (visible <= 0) continue;
      g.fillStyle = p[bl.voice];
      g.fillRect(Math.round(bl.x), bl.y, Math.max(1, Math.round(visible)), bl.h);
    }

    g.fillStyle = p.harm;
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 40 * dt;
      s.life -= dt * 1.8;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      g.globalAlpha = s.life;
      g.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }

    flash *= Math.pow(0.002, dt);
    shake *= Math.pow(0.001, dt);
    boost *= Math.pow(0.2, dt);

    const cell = canvas.height / H;
    const ox = Math.round((Math.random() - 0.5) * shake * 2) * cell;
    const oy = Math.round((Math.random() - 0.5) * shake * 2) * cell;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(low, ox, oy, W * cell, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    const step = Math.max(2, Math.round(cell / 2));
    for (let y = 0; y < canvas.height; y += step) ctx.fillRect(0, y, canvas.width, Math.max(1, step / 3));

    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  return (e: NoteEvent) => {
    const hx = head();
    if (e.voice in THICK) {
      const voice = e.voice as Voice;
      for (const n of e.notes) blocks.push({ x: hx, y: row(n), w: Math.max(1, e.dur * SPEED), h: THICK[voice], voice });
    }
    if (e.voice === "kick") flash = 1;
    if (e.voice === "snare" && e.vel >= 0.8) {
      shake = 1;
      const y = 4 + Math.random() * (H - 8);
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 10 + Math.random() * 25;
        sparks.push({ x: hx, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
      }
    }
    if (e.voice === "crash") {
      pal = (pal + 1) % PALETTES.length;
      boost = 2;
    }
  };
}
