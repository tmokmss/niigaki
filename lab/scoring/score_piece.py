"""Scores one exported piece: accidents to fix, deviations kept, and where the melody surprises.

usage: uv run python score_piece.py <slug>
"""

import sys
from collections import Counter

import numpy as np

import amt
from music import NAMES, check, load_pieces


def name(p):
    return f"{NAMES[p % 12]}{p // 12 - 1}"


def main(slug):
    pieces = load_pieces()
    p = next(x for x in pieces if x["slug"] == slug)
    r = check(p)
    print(f"{p['title']}: key {r['key']['name']}, {len(p['lead'])} notes")
    print(f"accidents: {len(r['accidents'])}")
    for a in r["accidents"]:
        print(f"  bar {a['bar']} beat {a['beat']} {name(a['pitch'])}: {a['reason']}")
    print("deviations:", dict(Counter(d["kind"] for d in r["deviations"])))

    model = amt.load()
    s = amt.surprise(model, p["lead"], p["chords"])
    pitch = np.array([x["pitch"] for x in s])
    rhythm = np.array([x["rhythm"] for x in s])
    print(f"surprise: pitch {pitch.mean():.2f} / rhythm {rhythm.mean():.2f} bits per note")
    for start in range(0, p["bars"], 4):
        idx = [i for i, n in enumerate(p["lead"]) if start <= n["bar"] < start + 4]
        if idx:
            print(f"  bars {start + 1:>2}-{start + 4:<2} pitch {pitch[idx].mean():.2f} rhythm {rhythm[idx].mean():.2f}  {'#' * round(pitch[idx].mean() * 10)}")
    print("peaks:")
    for i in np.argsort(-pitch)[:8]:
        n = p["lead"][i]
        print(f"  bar {n['bar'] + 1} beat {n['beat'] + 1:g} {name(n['pitch'])}: {pitch[i]:.2f}")


if __name__ == "__main__":
    main(sys.argv[1])
