import { fitCanvas, midi, type NoteEvent } from "./score";

type Wall = { d: number; open: number[] };

const SIDE = Math.PI / 3;

export function hexagon(canvas: HTMLCanvasElement) {
  const ctx = fitCanvas(canvas);
  const walls: Wall[] = [];
  let angle = 0;
  let dir = 1;
  let spin = 0.4;
  let pulse = 0;
  let hue = 190;
  let snares = 0;
  let cursor = 0;
  let cursorTarget = 0;
  let last = performance.now();

  const at = (r: number, a: number): [number, number] => [
    canvas.width / 2 + r * Math.cos(a),
    canvas.height / 2 + r * Math.sin(a),
  ];
  const poly = (pts: [number, number][], fill: string) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const far = Math.hypot(canvas.width, canvas.height) / 2;
    const core = Math.min(canvas.width, canvas.height) * 0.07 * (1 + pulse * 0.18);

    spin += (0.4 - spin) * dt;
    angle += spin * dir * dt * Math.PI;
    pulse *= Math.pow(0.02, dt);
    hue = (hue + dt * 4) % 360;
    cursor += (cursorTarget - cursor) * Math.min(1, dt * 18);

    for (let k = 0; k < 6; k++) {
      const a = angle + k * SIDE;
      poly([at(0, 0), at(far * 1.2, a), at(far * 1.2, a + SIDE)], `hsl(${hue} 45% ${k % 2 ? 9 : 13}%)`);
    }

    const wallColor = `hsl(${hue} 85% ${62 + pulse * 15}%)`;
    const thick = far * 0.05;
    for (let i = walls.length - 1; i >= 0; i--) {
      const w = walls[i];
      w.d -= dt * 0.55;
      const r = core + (far - core) * w.d;
      if (r + thick < core) {
        walls.splice(i, 1);
        continue;
      }
      const r1 = Math.max(core, r);
      for (let k = 0; k < 6; k++) {
        if (w.open.includes(k)) continue;
        const a = angle + k * SIDE;
        poly([at(r1, a), at(r + thick, a), at(r + thick, a + SIDE), at(r1, a + SIDE)], wallColor);
      }
    }

    poly(Array.from({ length: 6 }, (_, k) => at(core, angle + k * SIDE)), wallColor);
    poly(Array.from({ length: 6 }, (_, k) => at(core * 0.82, angle + k * SIDE)), `hsl(${hue} 45% 9%)`);

    const ca = angle + cursor;
    const cr = core * 1.35;
    const s = core * 0.16;
    poly([at(cr + s, ca), at(cr - s * 0.6, ca - 0.12), at(cr - s * 0.6, ca + 0.12)], wallColor);

    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  return (e: NoteEvent) => {
    if (e.voice === "kick") pulse = 1;
    if (e.voice === "lead") cursorTarget = (midi(e.notes[0]) % 6) * SIDE + SIDE / 2;
    if (e.voice === "crash") {
      hue = (hue + 90 + Math.random() * 90) % 360;
      spin = 2.2;
    }
    if (e.voice === "snare" && e.vel >= 0.8) {
      const gap = Math.floor(Math.random() * 6);
      walls.push({ d: 1, open: Math.random() < 0.35 ? [gap, (gap + 3) % 6] : [gap] });
      if (++snares % 8 === 0) {
        dir *= -1;
        spin = 1.4;
      }
    }
  };
}
