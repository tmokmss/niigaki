"""Runs the three experiments on the exported pieces and writes out/results.json and out/audio/*.mp3.

1. rules: accidents vs deviations in every piece
2. surprise: per-note pitch and rhythm surprise, with predictable and random melodies over the same chords
3. explore: many new lead lines for one drop, kept per surprise cell instead of as a single winner
"""

import json
from collections import Counter

import numpy as np
import torch

import amt
import synth
from explore import elites, quantize, section, to_m
from music import NAMES, OUT, check, cliche, coherence, load_pieces, noise, repetition

TARGET = "green-eyed"
# the build (bars 9-12) and the first drop (bars 13-20); the drop's first two bars stay as written
FIRST, BARS, KEEP = 8, 12, 6
LISTEN_FROM = 4
CANDIDATES = 120
TOP_P = [0.9, 0.95, 0.98, 1.0]


def name(p):
    return f"{NAMES[p % 12]}{p // 12 - 1}"


def mean(s, key, notes=None):
    xs = [x[key] for i, x in enumerate(s) if notes is None or i in notes]
    return float(np.mean(xs)) if xs else 0.0


def pieces_part(model, pieces):
    rows, anchors = [], []
    for p in pieces:
        r = check(p)
        s = amt.surprise(model, p["lead"], p["chords"])
        rows.append(
            {
                "slug": p["slug"],
                "title": p["title"],
                "kind": p["kind"],
                "bpm": p["bpm"],
                "key": r["key"]["name"],
                "notes": len(p["lead"]),
                "accidents": r["accidents"],
                "deviations": dict(Counter(d["kind"] for d in r["deviations"])),
                "pitch": mean(s, "pitch"),
                "rhythm": mean(s, "rhythm"),
                "repetition": repetition(p["lead"]),
            }
        )
        if p["slug"] in ("green-eyed", "nazrin", "vertex", "lanterns"):
            for label, lead in (("cliche", cliche(p["chords"])), ("noise", noise(p["chords"]))):
                s2 = amt.surprise(model, lead, p["chords"])
                anchors.append(
                    {
                        "slug": p["slug"],
                        "label": label,
                        "pitch": mean(s2, "pitch"),
                        "rhythm": mean(s2, "rhythm"),
                        "accidents": len(check({**p, "lead": lead})["accidents"]),
                    }
                )
        print("piece", p["slug"], flush=True)
    return rows, anchors


def timeline_part(model, p):
    s = amt.surprise(model, p["lead"], p["chords"])
    tags = {}
    for d in check(p)["deviations"]:
        tags.setdefault((d["bar"], d["beat"]), []).append(d["kind"])
    notes = [
        {
            "bar": n["bar"] + 1,
            "beat": round(n["beat"] + 1, 2),
            "t": round(n["t"], 3),
            "note": name(n["pitch"]),
            "pitch": round(x["pitch"], 2),
            "rhythm": round(x["rhythm"], 2),
            "tags": tags.get((n["bar"] + 1, round(n["beat"] + 1, 2)), []),
        }
        for n, x in zip(p["lead"], s)
    ]
    return {"slug": p["slug"], "title": p["title"], "bars": p["bars"], "notes": notes}


def evaluate(model, p, lead, chords):
    """Scores for the generated bars of a 12-bar line."""
    s = amt.surprise(model, lead, chords)
    new = {i for i, n in enumerate(lead) if n["bar"] >= KEEP}
    gen = [n for n in lead if n["bar"] >= KEEP]
    r = check({**p, "lead": lead, "chords": chords, "bars": BARS})
    reasons = [a["reason"] for a in r["accidents"] if a["bar"] > KEEP]
    empty = [b for b in range(KEEP, BARS) if not any(n["bar"] == b for n in gen)]
    reasons += ["メロディが無い小節"] * len(empty)
    gen_chords = [c for c in chords if c["bar"] >= KEEP]
    return {
        "pitch": mean(s, "pitch", new),
        "rhythm": mean(s, "rhythm", new),
        "accidents": len(reasons),
        "reasons": sorted(set(reasons)),
        "quality": coherence(gen, gen_chords) if gen else 0.0,
        "m": to_m(lead, BARS, 4)[LISTEN_FROM:],
        "notes": len(gen),
    }


def explore_part(model, p):
    lead, chords = section(p, FIRST, BARS)
    bar = p["beats"] * 60 / p["bpm"]
    prompt = [n for n in lead if n["bar"] < KEEP]
    gen_chords = [c for c in chords if c["bar"] >= KEEP]
    lines = {"original": lead, "cliche": prompt + cliche(gen_chords), "noise": prompt + noise(gen_chords)}
    cands = [{"id": cid, "source": cid, **evaluate(model, p, line, chords)} for cid, line in lines.items()]
    for i in range(CANDIDATES):
        top_p = TOP_P[i % len(TOP_P)]
        torch.manual_seed(i)
        raw = amt.infill(model, prompt, chords, KEEP * bar, BARS * bar, top_p)
        gen = quantize([x for x in raw if x[0] >= KEEP * bar - 1e-6], p["bpm"], p["beats"], BARS * bar)
        cid = f"c{i:03d}"
        lines[cid] = prompt + gen
        cands.append({"id": cid, "source": f"top_p={top_p}", "seed": i, **evaluate(model, p, prompt + gen, chords)})
        print("cand", cid, cands[-1]["accidents"], round(cands[-1]["pitch"], 2), round(cands[-1]["rhythm"], 2), flush=True)

    generated = [c for c in cands if "seed" in c]
    cells, xs, ys = elites(generated)
    ok = [c for c in generated if c["accidents"] == 0]
    likely = min(ok, key=lambda c: c["pitch"] + c["rhythm"])
    best = max(ok, key=lambda c: c["quality"])

    # audio: the drop's eight bars
    t0 = LISTEN_FROM * bar
    listen_chords = [{**c, "t": c["t"] - t0} for c in chords if c["bar"] >= LISTEN_FROM]
    audio = {"original", "cliche", "noise", likely["id"], best["id"], *(c["id"] for c in cells.values())}
    (OUT / "audio").mkdir(exist_ok=True)
    for cid in audio:
        notes = [{**n, "t": n["t"] - t0} for n in lines[cid] if n["bar"] >= LISTEN_FROM]
        synth.save_mp3(synth.render(notes, listen_chords, p["bpm"], (BARS - LISTEN_FROM) * bar), OUT / "audio" / f"{cid}.mp3")

    return {
        "slug": p["slug"],
        "title": p["title"],
        "bars": [FIRST + LISTEN_FROM + 1, FIRST + BARS],
        "kept_bars": [FIRST + LISTEN_FROM + 1, FIRST + KEEP],
        "candidates": cands,
        "x_edges": xs,
        "y_edges": ys,
        "elites": {f"{x},{y}": c["id"] for (x, y), c in cells.items()},
        "likely": likely["id"],
        "best": best["id"],
        "audio": sorted(audio),
    }


def main():
    pieces = load_pieces()
    model = amt.load()
    rows, anchors = pieces_part(model, pieces)
    target = next(p for p in pieces if p["slug"] == TARGET)
    result = {
        "model": amt.MODEL,
        "pieces": rows,
        "anchors": anchors,
        "timeline": timeline_part(model, target),
        "explore": explore_part(model, target),
    }
    (OUT / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
