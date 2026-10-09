import * as Tone from "tone";
import type { Piece } from "../pieces/types";
import { chipKit, renderChip } from "./chip";
import { pianoKit, renderPiano, sparks } from "./piano";
import { pixels } from "./pixels";

export function mount(piece: Piece, els: { canvas: HTMLCanvasElement; button: HTMLButtonElement; status: HTMLElement }) {
  const kit = piece.kind === "chip" ? chipKit(piece.bpm) : pianoKit(piece.bpm);
  const visual = piece.kind === "chip" ? pixels(els.canvas) : sparks(els.canvas);
  const transport = Tone.getTransport();
  const draw = Tone.getDraw();
  const label = els.status.textContent;
  let playing = false;

  els.button.addEventListener("click", async () => {
    if (playing) {
      transport.stop();
      transport.cancel();
      kit.releaseAll();
      playing = false;
      els.button.textContent = "PLAY";
      return;
    }
    els.button.disabled = true;
    els.status.textContent = "音源を読み込み中…";
    await Tone.start();
    await Tone.loaded();
    els.status.textContent = label;
    els.button.disabled = false;

    transport.cancel();
    transport.position = 0;
    const { events, end } = piece.kind === "chip" ? renderChip(piece) : renderPiano(piece);
    for (const e of events) {
      transport.schedule((time) => {
        kit.play(e, time);
        draw.schedule(() => visual(e), time);
      }, e.t);
    }
    transport.setLoopPoints(0, end);
    transport.loop = true;
    transport.start("+0.1");
    playing = true;
    els.button.textContent = "STOP";
  });
}
