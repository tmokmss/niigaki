// usage (from the worktree root): npx tsx .claude/skills/touhou-arrange/scripts/check.mts <slug>
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Bar = { c: string[]; m?: [string, number][] };
type Event = { voice: string; t: number; notes: string[] };

const slug = process.argv[2];
const load = (p: string) => import(pathToFileURL(resolve(process.cwd(), p)).href);
const { renderChip } = await load("src/lib/chip.ts");
const { renderFuture } = await load("src/lib/future.ts");
const { renderLofi } = await load("src/lib/lofi.ts");
const { renderDnb } = await load("src/lib/dnb.ts");
const { renderDubstep } = await load("src/lib/dubstep.ts");
const { renderBossa } = await load("src/lib/bossa.ts");
const { renderSwing } = await load("src/lib/swing.ts");
const { renderCityPop } = await load("src/lib/citypop.ts");
const { renderSynthwave } = await load("src/lib/synthwave.ts");
const { renderTrance } = await load("src/lib/trance.ts");
const { renderJazz } = await load("src/lib/jazz.ts");
const { pieces } = await load("src/pieces/index.ts");

const piece = pieces.find((p: { slug: string }) => p.slug === slug);
if (!piece || piece.kind === "piano") throw new Error(`no chip, future, lofi, dnb, dubstep, bossa, swing, citypop, synthwave, trance or jazz piece "${slug}"`);

const beats = piece.beats ?? 4;
const render = { chip: renderChip, future: renderFuture, lofi: renderLofi, dnb: renderDnb, dubstep: renderDubstep, bossa: renderBossa, swing: renderSwing, citypop: renderCityPop, synthwave: renderSynthwave, trance: renderTrance, jazz: renderJazz }[piece.kind as string];
const r: { events: Event[]; end: number } = render(piece);
// lofi and swing bars count sixteenth-note triplets
const steps = piece.kind === "lofi" || piece.kind === "swing" ? 24 : beats * 4;
const badBars = (piece.bars as Bar[])
  .map((b, i) => [i + 1, (b.m ?? []).reduce((s, [, n]) => s + n, 0)])
  .filter(([, n]) => n !== 0 && Math.abs(n - steps) > 1e-9);
const seen = new Set<string>();
const collisions = r.events.filter((e) => {
  if (!["kick", "snare", "hat", "ohat", "tom", "crash"].includes(e.voice)) return false;
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
