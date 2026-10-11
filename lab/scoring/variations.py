"""New lead lines for some bars of a piece, kept per (pitch surprise, rhythm surprise) cell.

usage: uv run python variations.py <slug> <first bar, 1-based> <bars> <candidates>
writes out/variations-<slug>-<first bar>.json and out/audio/<slug>-<first bar>-<id>.mp3 (the 4 bars before and the new bars)
"""

import json
import sys

import torch

import amt
import synth
from explore import elites, quantize, to_m
from music import OUT, check, coherence, load_pieces

TOP_P = [0.9, 0.95, 0.98, 1.0]
TEMPERATURE = [1.0, 1.3, 1.6]
LEAD_IN = 4


def main(slug, first, bars, count):
    p = next(x for x in load_pieces() if x["slug"] == slug)
    per_beat = 6 if p["kind"] == "lofi" else 4
    first -= 1
    bar = p["beats"] * 60 / p["bpm"]
    start, end = first * bar, (first + bars) * bar
    before = [n for n in p["lead"] if n["bar"] < first]
    after = [n for n in p["lead"] if n["bar"] >= first + bars]
    span = [c for c in p["chords"] if first <= c["bar"] < first + bars]
    model = amt.load()

    def evaluate(line):
        lead = before + line + after
        s = amt.surprise(model, lead, p["chords"])
        idx = [i for i, n in enumerate(lead) if first <= n["bar"] < first + bars]
        r = check({**p, "lead": lead})
        reasons = [a["reason"] for a in r["accidents"] if first < a["bar"] <= first + bars]
        reasons += ["メロディが無い小節"] * sum(1 for b in range(first, first + bars) if not any(n["bar"] == b for n in line))
        mean = lambda k: sum(s[i][k] for i in idx) / len(idx) if idx else 0.0
        return {
            "pitch": mean("pitch"),
            "rhythm": mean("rhythm"),
            "accidents": len(reasons),
            "reasons": sorted(set(reasons)),
            "quality": coherence(line, span) if line else 0.0,
            "m": to_m([{**n, "bar": n["bar"] - first} for n in line], bars, p["beats"], per_beat),
        }

    lines = {"current": [n for n in p["lead"] if first <= n["bar"] < first + bars]}
    cands = [{"id": "current", **evaluate(lines["current"])}]
    for i in range(count):
        torch.manual_seed(i)
        # after a repeated hook the model just repeats it again, so two of every three candidates sample hotter
        temperature = TEMPERATURE[i % len(TEMPERATURE)]
        top_p = TOP_P[i // len(TEMPERATURE) % len(TOP_P)]
        raw = amt.infill(model, before, p["chords"], start, end, top_p, temperature)
        line = quantize([(max(0.0, t - start), d, x) for t, d, x in raw], p["bpm"], p["beats"], end - start, per_beat)
        line = [{**n, "bar": n["bar"] + first, "t": n["t"] + start} for n in line]
        cid = f"c{i:03d}"
        lines[cid] = line
        cands.append({"id": cid, "seed": i, "top_p": top_p, "temperature": temperature, **evaluate(line)})
        print(cid, cands[-1]["accidents"], round(cands[-1]["pitch"], 2), round(cands[-1]["rhythm"], 2), flush=True)

    cells, xs, ys = elites([c for c in cands if "seed" in c])
    keep = {"current", *(c["id"] for c in cells.values())}
    t0 = (first - LEAD_IN) * bar
    listen = lambda ns: [{**n, "t": n["t"] - t0} for n in ns if n["t"] >= t0 - 1e-6]
    chords = [{**c, "t": c["t"] - t0} for c in p["chords"] if t0 - 1e-6 <= c["t"] < end - 1e-6]
    (OUT / "audio").mkdir(exist_ok=True)
    for cid in keep:
        notes = listen([n for n in before if n["t"] >= t0 - 1e-6] + lines[cid])
        synth.save_mp3(synth.render(notes, chords, p["bpm"], end - t0), OUT / "audio" / f"{slug}-{first + 1}-{cid}.mp3")
    result = {
        "slug": slug,
        "title": p["title"],
        "bars": [first + 1, first + bars],
        "candidates": cands,
        "x_edges": xs,
        "y_edges": ys,
        "elites": {f"{x},{y}": c["id"] for (x, y), c in cells.items()},
    }
    (OUT / f"variations-{slug}-{first + 1}.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
    print("elites:")
    for (x, y), c in sorted(cells.items()):
        print(f"  pitch {x} rhythm {y}: {c['id']} pitch {c['pitch']:.2f} rhythm {c['rhythm']:.2f} quality {c['quality']:.2f}")
        for line in c["m"]:
            print("    ", line)
    cur = cands[0]
    print(f"current: pitch {cur['pitch']:.2f} rhythm {cur['rhythm']:.2f} quality {cur['quality']:.2f} accidents {cur['accidents']}")


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]))
