"""Many lead lines for one section, kept as elites per (pitch surprise, rhythm surprise) cell instead of a single winner."""

import numpy as np

from music import NAMES


def section(piece, first, bars):
    """The piece's chords and lead in bars [first, first + bars), shifted to start at zero seconds."""
    keep = lambda x: first <= x["bar"] < first + bars
    t0 = next(c["t"] for c in piece["chords"] if c["bar"] == first)
    shift = lambda x: {**x, "bar": x["bar"] - first, "t": x["t"] - t0}
    return [shift(n) for n in piece["lead"] if keep(n)], [shift(c) for c in piece["chords"] if keep(c)]


def quantize(raw, bpm, beats, end):
    """Generated (t, dur, pitch) in seconds snapped to sixteenths, one note at a time (the highest wins)."""
    step = 60 / bpm / 4
    by_onset = {}
    for t, d, p in raw:
        k = round(t / step)
        if k * step < end - 1e-6:
            by_onset[k] = max(by_onset.get(k, (0, -1)), (max(1, round(d / step)), p), key=lambda x: x[1])
    onsets = sorted(by_onset)
    lead = []
    limit = round(end / step)
    for i, k in enumerate(onsets):
        n, p = by_onset[k]
        nxt = onsets[i + 1] if i + 1 < len(onsets) else limit
        # notes never cross a barline, so each bar reads as its own line of the score
        bar_end = (k // (beats * 4) + 1) * beats * 4
        n = min(n, nxt - k, bar_end - k)
        lead.append({"bar": k // (beats * 4), "beat": (k % (beats * 4)) / 4, "beats": n / 4, "t": k * step, "dur": n * step, "pitch": p})
    return lead


def to_m(lead, bars, beats):
    """The piece-file melody string for each bar: "E5:2 -:2 ..." in sixteenths."""
    lines = []
    for b in range(bars):
        x, out = 0, []
        for n in (n for n in lead if n["bar"] == b):
            at = round(n["beat"] * 4)
            if at > x:
                out.append(f"-:{at - x}")
            length = round(n["beats"] * 4)
            out.append(f"{NAMES[n['pitch'] % 12]}{n['pitch'] // 12 - 1}" + (f":{length}" if length != 1 else ""))
            x = at + length
        if x < beats * 4:
            out.append(f"-:{beats * 4 - x}")
        lines.append(" ".join(out))
    return lines


def elites(cands, grid=3):
    """MAP-Elites style archive: the best quality in each cell of a grid x grid split of the two surprise axes."""
    ok = [c for c in cands if c["accidents"] == 0]
    xs = np.quantile([c["pitch"] for c in ok], np.linspace(0, 1, grid + 1)[1:-1])
    ys = np.quantile([c["rhythm"] for c in ok], np.linspace(0, 1, grid + 1)[1:-1])
    cells = {}
    for c in ok:
        cell = (int(np.searchsorted(xs, c["pitch"])), int(np.searchsorted(ys, c["rhythm"])))
        c["cell"] = cell
        if cell not in cells or c["quality"] > cells[cell]["quality"]:
            cells[cell] = c
    return cells, xs.tolist(), ys.tolist()
