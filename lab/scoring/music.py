"""Rule checks on a piece's lead line: accidents to reject, deviations to keep."""

import json
from pathlib import Path

import numpy as np

OUT = Path(__file__).parent / "out"

# Krumhansl-Kessler key profiles
MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NAMES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
MAJOR_SCALE = {0, 2, 4, 5, 7, 9, 11}
# natural, harmonic and melodic minor together
MINOR_SCALE = {0, 2, 3, 5, 7, 8, 9, 10, 11}


def load_pieces():
    return json.loads((OUT / "pieces.json").read_text())


def chord_at(chords, t):
    for c in chords:
        if c["t"] - 1e-6 <= t < c["t"] + c["dur"] - 1e-6:
            return {p % 12 for p in c["pitches"]}
    return set()


def find_key(lead, chords):
    hist = np.zeros(12)
    for n in lead:
        hist[n["pitch"] % 12] += n["dur"]
    for c in chords:
        for p in c["pitches"]:
            hist[p % 12] += c["dur"] / len(c["pitches"])
    if not hist.any():
        return None
    best = max(
        ((np.corrcoef(hist, np.roll(prof, tonic))[0, 1], tonic, mode) for tonic in range(12) for prof, mode in ((MAJOR, "major"), (MINOR, "minor"))),
    )
    return {"tonic": best[1], "mode": best[2], "name": NAMES[best[1]] + ("" if best[2] == "major" else "m"), "r": float(best[0])}


def in_key(pc, key):
    return (pc - key["tonic"]) % 12 in (MAJOR_SCALE if key["mode"] == "major" else MINOR_SCALE)


def semitone_clash(pc, chord):
    # a semitone above a chord tone (b9 against it); a semitone below, like a major seventh, is a colour
    return pc not in chord and any((pc - c) % 12 == 1 for c in chord)


def check(piece):
    lead, chords, beats = piece["lead"], piece["chords"], piece["beats"]
    key = find_key(lead, chords)
    accidents, deviations = [], []

    def at(n, kind, reason):
        return {"bar": n["bar"] + 1, "beat": round(n["beat"] + 1, 2), "pitch": n["pitch"], "kind": kind, "reason": reason}

    for i, n in enumerate(lead):
        pc = n["pitch"] % 12
        chord = chord_at(chords, n["t"])
        nxt = lead[i + 1] if i + 1 < len(lead) else None
        gap = nxt["t"] - (n["t"] + n["dur"]) if nxt else 1e9
        beat_sec = n["dur"] / n["beats"]
        phrase_end = gap >= beat_sec - 1e-6
        step = nxt is not None and not phrase_end and abs(nxt["pitch"] - n["pitch"]) <= 2
        resolves = step and (nxt["pitch"] % 12) in chord_at(chords, nxt["t"])
        long = n["beats"] >= 1 - 1e-6
        # sounds within the last beat before the chord changes, and belongs to the next chord
        next_chord = chord_at(chords, n["t"] + beat_sec)
        anticipates = next_chord != chord and pc in next_chord

        if chord and semitone_clash(pc, chord):
            if anticipates:
                deviations.append(at(n, "anticipation", "次の和音の音を先取りする"))
            elif (long or phrase_end) and not resolves:
                accidents.append(at(n, "clash", "和音と半音でぶつかったまま伸びる・終わる"))
            else:
                deviations.append(at(n, "tension", "半音のぶつかりを隣の音で解決する"))
        elif chord and pc not in chord and resolves:
            deviations.append(at(n, "passing", "和音の外の音から隣の和音の音へ進む"))

        if key and not in_key(pc, key):
            if step and abs(nxt["pitch"] - n["pitch"]) == 1:
                deviations.append(at(n, "chromatic", "調の外から半音で寄る"))
            elif not chord or pc not in chord:
                deviations.append(at(n, "outside", "調の外の音"))

        if nxt and not phrase_end and abs(nxt["pitch"] - n["pitch"]) >= 12:
            deviations.append(at(n, "leap", "オクターブ以上の跳躍"))

        offbeat = abs(n["beat"] - round(n["beat"])) > 1e-6
        crosses = int(np.floor(n["beat"] + n["beats"] - 1e-6)) > int(np.floor(n["beat"]))
        if offbeat and crosses:
            deviations.append(at(n, "syncopation", "裏拍から拍をまたいで伸ばす"))

    # a 4-bar window whose own key differs from the piece's key, kept for at least two windows
    modulations = []
    if key:
        windows = []
        for start in range(0, piece["bars"], 4):
            w = [n for n in lead if start <= n["bar"] < start + 4]
            wc = [c for c in chords if start <= c["bar"] < start + 4]
            k = find_key(w, wc)
            windows.append((start, k["name"] if k else None))
        for (s, k), (_, k2) in zip(windows, windows[1:]):
            if k and k == k2 and k != key["name"] and (not modulations or modulations[-1]["to"] != k):
                modulations.append({"bar": s + 1, "to": k})
    for m in modulations:
        deviations.append({"bar": m["bar"], "beat": 1, "pitch": None, "kind": "modulation", "reason": f"{m['to']} へ転調"})

    return {"key": key, "accidents": accidents, "deviations": deviations}


def _note(c, beat, beats, pitch):
    sec = c["dur"] / c["beats"]
    return {"bar": c["bar"], "beat": c["beat"] + beat, "beats": beats, "t": c["t"] + beat * sec, "dur": beats * sec, "pitch": pitch}


def cliche(chords):
    """Quarter notes walking root-third-fifth-third of each chord around C5-B5."""
    lead = []
    for c in chords:
        tones = sorted({72 + p % 12 for p in c["pitches"][:3]})
        walk = [tones[0], tones[1 % len(tones)], tones[2 % len(tones)], tones[1 % len(tones)]]
        lead += [_note(c, b, 1, walk[b % 4]) for b in range(int(c["beats"]))]
    return lead


def noise(chords, seed=0):
    """Uniformly random pitches G4-E6 with random sixteenth, eighth and quarter lengths."""
    rng = np.random.default_rng(seed)
    lead = []
    for c in chords:
        b = 0.0
        while b < c["beats"] - 1e-6:
            n = min(float(rng.choice([0.25, 0.5, 1.0])), c["beats"] - b)
            lead.append(_note(c, b, n, int(rng.integers(67, 89))))
            b += n
    return lead


def coherence(lead, chords):
    """Mean of: chord tones on the beat, chord tones where a phrase lands, and motif repetition."""
    on_beat = [n for n in lead if abs(n["beat"] - round(n["beat"])) < 1e-6]
    landing = [n for n, nxt in zip(lead, lead[1:] + [None]) if nxt is None or nxt["t"] - (n["t"] + n["dur"]) >= n["dur"] / n["beats"] - 1e-6 or n["beats"] >= 2]
    tone = lambda ns: sum(n["pitch"] % 12 in chord_at(chords, n["t"]) for n in ns) / len(ns) if ns else 0.0
    return (tone(on_beat) + tone(landing) + repetition(lead)) / 3


def repetition(lead):
    """Share of 3-note (interval, onset-in-beat, length) patterns that occur more than once: a proxy for a memorable motif."""
    grams = []
    for a, b, c in zip(lead, lead[1:], lead[2:]):
        grams.append(
            (
                b["pitch"] - a["pitch"],
                c["pitch"] - b["pitch"],
                round(a["beat"] % 1, 3),
                round(a["beats"], 3),
                round(b["beats"], 3),
                round(c["beats"], 3),
            )
        )
    if not grams:
        return 0.0
    counts = {}
    for g in grams:
        counts[g] = counts.get(g, 0) + 1
    return sum(1 for g in grams if counts[g] > 1) / len(grams)
