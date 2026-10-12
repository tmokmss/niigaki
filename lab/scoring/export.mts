// usage (from the repo root): npx tsx lab/scoring/export.mts > lab/scoring/out/pieces.json
// Flattens every piece into chords and a lead line measured in beats and seconds.
import { midi } from "../../src/lib/score.ts";
import { pieces } from "../../src/pieces/index.ts";

type Note = { bar: number; beat: number; beats: number; t: number; dur: number; pitch: number };
type Chord = { bar: number; beat: number; beats: number; t: number; dur: number; pitches: number[] };

const out = pieces.map((piece) => {
  const beats = "beats" in piece && piece.beats ? piece.beats : 4;
  // the length of one melody unit in beats
  const unit = piece.kind === "piano" ? 1 : piece.kind === "lofi" || piece.kind === "swing" ? 1 / 6 : 1 / 4;
  const lead: Note[] = [];
  const chords: Chord[] = [];
  let t = 0;
  piece.bars.forEach((bar, i) => {
    const s = "s" in bar && bar.s ? bar.s : 1;
    const sec = (60 / piece.bpm) * s;
    const c2 = "c2" in bar ? bar.c2 : undefined;
    const half = c2 ? beats / 2 : beats;
    chords.push({ bar: i, beat: 0, beats: half, t, dur: half * sec, pitches: bar.c.map(midi) });
    if (c2) chords.push({ bar: i, beat: half, beats: half, t: t + half * sec, dur: half * sec, pitches: c2.map(midi) });
    let x = 0;
    for (const [note, n] of bar.m ?? []) {
      const len = n * unit;
      if (note === "~" && lead.length) {
        lead[lead.length - 1].beats += len;
        lead[lead.length - 1].dur += len * sec;
      } else if (note !== "-" && note !== "~") {
        lead.push({ bar: i, beat: x, beats: len, t: t + x * sec, dur: len * sec, pitch: midi(note) });
      }
      x += len;
    }
    t += beats * sec;
  });
  return { slug: piece.slug, title: piece.title, kind: piece.kind, bpm: piece.bpm, beats, bars: piece.bars.length, end: t, lead, chords };
});

console.log(JSON.stringify(out));
