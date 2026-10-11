"""Per-note surprise and melody infilling with the Anticipatory Music Transformer."""

import math

import torch
import torch.nn.functional as F
from anticipation import ops, sample
from anticipation.config import CONTEXT_SIZE, MAX_DUR, MAX_PITCH, MAX_TIME, TIME_RESOLUTION
from anticipation.vocab import AUTOREGRESS, CONTROL_OFFSET, DUR_OFFSET, NOTE_OFFSET, REST, TIME_OFFSET
from transformers import AutoModelForCausalLM

MODEL = "stanford-crfm/music-medium-800k"
# General MIDI programs: square lead, acoustic grand, fingered bass
LEAD, CHORD, BASS = 80, 0, 33
LOG2 = math.log(2)


def load():
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    return AutoModelForCausalLM.from_pretrained(MODEL).to(device).eval()


def accompaniment(chords):
    """(time, order, dur, pitch, instr) for the chords and a bass on each chord's root."""
    out = []
    for c in chords:
        root = min(c["pitches"]) % 12
        out.append((c["t"], 0, c["dur"], 36 + root, BASS))
        out.extend((c["t"], 1, c["dur"], p, CHORD) for p in c["pitches"])
    return out


def events(lead, chords):
    """Tokens sorted by onset, harmony before melody at the same onset, with a rest for each silent second."""
    return ops.pad(_tokens(accompaniment(chords) + [(n["t"], 2, n["dur"], n["pitch"], LEAD) for n in lead]))


def _tokens(items):
    items = sorted(items, key=lambda x: (round(x[0] * TIME_RESOLUTION), x[1]))
    tokens = []
    for t, _, dur, pitch, instr in items:
        tokens += [
            TIME_OFFSET + round(t * TIME_RESOLUTION),
            DUR_OFFSET + min(max(round(dur * TIME_RESOLUTION), 1), MAX_DUR - 1),
            NOTE_OFFSET + instr * MAX_PITCH + pitch,
        ]
    return tokens


@torch.no_grad()
def surprise(model, lead, chords):
    """Bits of surprise for each lead note: pitch given that the lead plays now, and rhythm (onset and length)."""
    tokens = events(lead, chords)
    n = len(tokens) // 3
    per_window = (CONTEXT_SIZE - 1) // 3
    stride = per_window // 2
    scores = {}
    start = 0
    while True:
        w = tokens[3 * start : 3 * (start + per_window)]
        offset = min(w[0::3])
        w[0::3] = [t - offset for t in w[0::3]]
        x = torch.tensor([AUTOREGRESS] + w, device=model.device).unsqueeze(0)
        logits = model(x).logits[0, :-1].float()
        first = 0 if start == 0 else per_window - stride
        for j in range(first, len(w) // 3):
            time_tok, dur_tok, note_tok = w[3 * j : 3 * j + 3]
            if note_tok == REST or not (LEAD * MAX_PITCH <= note_tok - NOTE_OFFSET < (LEAD + 1) * MAX_PITCH):
                continue
            prev = w[3 * j - 3] if j > 0 else TIME_OFFSET
            lt = F.log_softmax(logits[3 * j, prev : TIME_OFFSET + MAX_TIME], -1)[time_tok - prev]
            ld = F.log_softmax(logits[3 * j + 1, DUR_OFFSET : DUR_OFFSET + MAX_DUR], -1)[dur_tok - DUR_OFFSET]
            lead_slice = slice(NOTE_OFFSET + LEAD * MAX_PITCH, NOTE_OFFSET + (LEAD + 1) * MAX_PITCH)
            lp = F.log_softmax(logits[3 * j + 2, lead_slice], -1)[note_tok - lead_slice.start]
            scores[start + j] = (-lp.item() / LOG2, -(lt + ld).item() / LOG2)
        if start + per_window >= n:
            break
        start += stride
    out = [scores[k] for k in sorted(scores)]
    assert len(out) == len(lead), (len(out), len(lead))
    return [{"pitch": p, "rhythm": r} for p, r in out]


def _lead_only(logits, _history):
    keep = slice(NOTE_OFFSET + LEAD * MAX_PITCH, NOTE_OFFSET + (LEAD + 1) * MAX_PITCH)
    mask = torch.full_like(logits, -float("inf"))
    mask[keep] = 0
    # the model marks each silent second with a rest
    mask[REST] = 0
    return logits + mask


_nucleus = sample.nucleus


def infill(model, prompt_lead, chords, start, end, top_p, temperature=1.0):
    """A new lead line from `start` to `end` seconds over fixed chords, continuing `prompt_lead`.

    The whole accompaniment is given as anticipated controls, so the lead is the only instrument the model writes.
    A temperature above 1 loosens the model's grip on a loop it has heard repeated.
    """
    sample.instr_logits = _lead_only
    sample.nucleus = lambda logits, p: _nucleus(logits / temperature, p)
    inputs = _tokens([(n["t"], 2, n["dur"], n["pitch"], LEAD) for n in prompt_lead])
    controls = [CONTROL_OFFSET + tok for tok in _tokens(accompaniment(chords))]
    out = sample.generate(model, start, end, inputs=inputs, controls=controls, top_p=top_p)
    notes = []
    for t, d, note in zip(out[0::3], out[1::3], out[2::3]):
        note -= NOTE_OFFSET
        if note // MAX_PITCH == LEAD and t - TIME_OFFSET >= int(TIME_RESOLUTION * start):
            notes.append(((t - TIME_OFFSET) / TIME_RESOLUTION, (d - DUR_OFFSET) / TIME_RESOLUTION, note % MAX_PITCH))
    return notes
