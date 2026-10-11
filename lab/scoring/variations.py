"""Scores candidate lead lines for some bars of a piece and keeps the best per (pitch surprise, rhythm surprise) cell.

The composer writes the candidates; the model only scores them.

usage: uv run python variations.py <slug> <first bar, 1-based> <candidates.json>
candidates.json: {"<id>": ["<bar 1 melody>", "<bar 2 melody>", ...]} in the piece's grid steps
(24 per bar for lo-fi, sixteenths otherwise), e.g. "G5:6 -:3 D6:3 C6:12"; "~" holds the previous note
writes out/variations-<slug>-<first bar>.json and out/audio/<slug>-<first bar>-<id>.mp3 (the 4 bars before and the new bars)
"""

import json
import sys
from pathlib import Path

import amt
import synth
from explore import elites, to_m
from music import NAMES, OUT, check, coherence, load_pieces

LEAD_IN = 4


def midi(note):
    return NAMES.index(note[0]) + {"#": 1, "b": -1, "": 0}[note[1:-1]] + (int(note[-1]) + 1) * 12


def parse(lines, first, p, per_beat):
    """Melody strings, one per bar from `first`, into notes placed against the piece's chords."""
    per_bar = p["beats"] * per_beat
    notes = []
    for b, s in enumerate(lines):
        bar = first + b
        t0 = next(c["t"] for c in p["chords"] if c["bar"] == bar and c["beat"] == 0)
        sec = 60 / p["bpm"] / per_beat
        x = 0
        for tok in s.split():
            note, n = (tok.split(":") + ["1"])[:2]
            n = int(n)
            if note == "~":
                notes[-1]["beats"] += n / per_beat
                notes[-1]["dur"] += n * sec
            elif note != "-":
                notes.append({"bar": bar, "beat": x / per_beat, "beats": n / per_beat, "t": t0 + x * sec, "dur": n * sec, "pitch": midi(note)})
            x += n
        if x != per_bar:
            raise ValueError(f"bar {bar + 1} of a candidate has {x} steps, not {per_bar}: {s}")
    return notes


def main(slug, first, path):
    p = next(x for x in load_pieces() if x["slug"] == slug)
    per_beat = 6 if p["kind"] == "lofi" else 4
    written = json.loads(Path(path).read_text())
    bars = len(next(iter(written.values())))
    first -= 1
    bar = p["beats"] * 60 / p["bpm"]
    end = (first + bars) * bar
    before = [n for n in p["lead"] if n["bar"] < first]
    after = [n for n in p["lead"] if n["bar"] >= first + bars]
    span = [c for c in p["chords"] if first <= c["bar"] < first + bars]
    model = amt.load()

    lines = {"current": [n for n in p["lead"] if first <= n["bar"] < first + bars]}
    lines |= {cid: parse(ls, first, p, per_beat) for cid, ls in written.items()}
    cands = []
    for cid, line in lines.items():
        lead = before + line + after
        s = amt.surprise(model, lead, p["chords"])
        idx = [i for i, n in enumerate(lead) if first <= n["bar"] < first + bars]
        reasons = [a["reason"] for a in check({**p, "lead": lead})["accidents"] if first < a["bar"] <= first + bars]
        sounding = lambda n, b: n["bar"] * p["beats"] + n["beat"] < (b + 1) * p["beats"] and (n["bar"] - b) * p["beats"] + n["beat"] + n["beats"] > 0
        reasons += ["メロディが無い小節"] * sum(1 for b in range(first, first + bars) if not any(sounding(n, b) for n in line))
        mean = lambda k: sum(s[i][k] for i in idx) / len(idx) if idx else 0.0
        cands.append(
            {
                "id": cid,
                "pitch": mean("pitch"),
                "rhythm": mean("rhythm"),
                "accidents": len(reasons),
                "reasons": sorted(set(reasons)),
                "quality": coherence(line, span) if line else 0.0,
                "m": to_m([{**n, "bar": n["bar"] - first} for n in line], bars, p["beats"], per_beat),
            }
        )

    cells, xs, ys = elites(cands)
    t0 = (first - LEAD_IN) * bar
    chords = [{**c, "t": c["t"] - t0} for c in p["chords"] if t0 - 1e-6 <= c["t"] < end - 1e-6]
    (OUT / "audio").mkdir(exist_ok=True)
    for cid, line in lines.items():
        notes = [{**n, "t": n["t"] - t0} for n in before + line if n["t"] >= t0 - 1e-6]
        synth.save_mp3(synth.render(notes, chords, p["bpm"], end - t0), OUT / "audio" / f"{slug}-{first + 1}-{cid}.mp3")
    best = {c["id"] for c in cells.values()}
    result = {"slug": slug, "title": p["title"], "bars": [first + 1, first + bars], "candidates": cands, "x_edges": xs, "y_edges": ys,
              "elites": {f"{x},{y}": c["id"] for (x, y), c in cells.items()}}
    (OUT / f"variations-{slug}-{first + 1}.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
    print(f"{'id':<12} {'cell':<5} pitch rhythm quality  accidents")
    for c in sorted(cands, key=lambda c: c["pitch"]):
        cell = ",".join(map(str, c.get("cell", ()))) if c["id"] in best else ""
        print(f"{c['id']:<12} {cell:<5} {c['pitch']:5.2f} {c['rhythm']:6.2f} {c['quality']:7.2f}  {', '.join(c['reasons']) or '-'}")


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]), sys.argv[3])
