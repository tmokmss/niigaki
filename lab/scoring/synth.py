"""A tiny chip synth so candidates can be heard in the report: pulse lead, triangle chords, square bass, kick on the beat."""

import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 22050


def _hz(pitch):
    return 440 * 2 ** ((pitch - 69) / 12)


def _pulse(f, n, duty):
    return np.where((np.arange(n) * f / SR) % 1 < duty, 1.0, -1.0)


def _triangle(f, n):
    return 2 * np.abs(2 * ((np.arange(n) * f / SR) % 1) - 1) - 1


def _env(n, decay):
    attack = min(n, int(0.004 * SR))
    e = np.exp(-np.arange(n) / (decay * SR))
    e[:attack] *= np.linspace(0, 1, attack)
    release = min(n, int(0.01 * SR))
    e[n - release :] *= np.linspace(1, 0, release)
    return e


def render(lead, chords, bpm, end):
    out = np.zeros(int((end + 0.5) * SR))

    def put(t, x):
        i = int(t * SR)
        out[i : i + len(x)] += x[: len(out) - i]

    for n in lead:
        k = int(n["dur"] * SR * 0.92)
        put(n["t"], 0.22 * _pulse(_hz(n["pitch"]), k, 0.25) * _env(k, 0.6))
    for c in chords:
        k = int(c["dur"] * SR)
        for p in c["pitches"]:
            put(c["t"], 0.06 * _triangle(_hz(p), k) * _env(k, 1.5))
        root = 36 + min(c["pitches"]) % 12
        step = 60 / bpm / 2
        for j in range(round(c["dur"] / step)):
            k = int(step * SR * 0.8)
            put(c["t"] + j * step, 0.1 * _pulse(_hz(root + 12 * (j % 2)), k, 0.5) * _env(k, 0.15))
    beat = 60 / bpm
    kick_n = int(0.12 * SR)
    kick = np.sin(2 * np.pi * np.cumsum(np.linspace(150, 45, kick_n)) / SR) * _env(kick_n, 0.05)
    for j in range(int(end / beat)):
        put(j * beat, 0.35 * kick)
    return out / max(1.0, np.abs(out).max() / 0.9)


def save_mp3(audio, path: Path):
    wav = path.with_suffix(".wav")
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((audio * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "64k", str(path)], check=True)
    wav.unlink()
