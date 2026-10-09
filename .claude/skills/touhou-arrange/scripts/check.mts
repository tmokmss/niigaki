// usage (from the worktree root): npx tsx ~/.claude/skills/touhou-arrange/scripts/check.mts <slug>
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Bar = { c: string[]; m?: [string, number][] };
type Event = { voice: string; t: number; notes: string[] };

const slug = process.argv[2];
const load = (p: string) => import(pathToFileURL(resolve(process.cwd(), p)).href);
const { renderChip } = await load("src/lib/chip.ts");
const { pieces } = await load("src/pieces/index.ts");

const piece = pieces.find((p: { slug: string }) => p.slug === slug);
if (!piece || piece.kind !== "chip") throw new Error(`no chip piece "${slug}"`);

const beats = piece.beats ?? 4;
const r: { events: Event[]; end: number } = renderChip(piece);
const badBars = (piece.bars as Bar[])
  .map((b, i) => [i + 1, (b.m ?? []).reduce((s, [, n]) => s + n, 0)])
  .filter(([, n]) => n !== 0 && Math.abs(n - beats * 4) > 1e-9);
const seen = new Set<string>();
const collisions = r.events.filter((e) => {
  if (!["kick", "snare", "hat", "crash"].includes(e.voice)) return false;
  const k = `${e.voice}@${e.t.toFixed(6)}`;
  const dup = seen.has(k);
  seen.add(k);
  return dup;
});
const bar = (beats * 60) / piece.bpm;
const leadsIn = (n: number) =>
  r.events
    .filter((e) => e.voice === "lead" && e.t >= (n - 1) * bar - 1e-9 && e.t < n * bar - 1e-9)
    .map((e) => e.notes[0])
    .join(" ");

const bars = piece.bars as Bar[];
console.log(`${piece.title}: bars=${bars.length} loop=${r.end.toFixed(1)}s badBars=${JSON.stringify(badBars)} monoCollisions=${collisions.length}`);
console.log(`  last bar  [${bars[bars.length - 1].c.join(" ")}] lead: ${leadsIn(bars.length)}`);
console.log(`  first bar [${bars[0].c.join(" ")}] lead: ${leadsIn(1)}`);
