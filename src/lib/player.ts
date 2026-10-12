import * as Tone from "tone";
import type { ChipPiece, Piece } from "../pieces/types";
import { bossaKit, renderBossa } from "./bossa";
import { chipKit, renderChip } from "./chip";
import { danmaku } from "./danmaku";
import { dnbKit, renderDnb } from "./dnb";
import { dubstepKit, renderDubstep } from "./dubstep";
import { futureKit, renderFuture } from "./future";
import { lofiKit, renderLofi } from "./lofi";
import { pianoKit, renderPiano, sparks } from "./piano";
import { pixels } from "./pixels";
import type { Kit } from "./score";
import { renderSynthwave, synthwaveKit } from "./synthwave";

export function mount(
  piece: Piece,
  els: { canvas: HTMLCanvasElement; button: HTMLButtonElement; status: HTMLElement; volume: HTMLInputElement; timbre?: HTMLSelectElement },
) {
  const chipKits = new Map<string, Kit>();
  const chip = (bpm: number, t: NonNullable<ChipPiece["timbre"]>) => {
    if (!chipKits.has(t)) chipKits.set(t, chipKit(bpm, t));
    return chipKits.get(t)!;
  };
  let kit =
    piece.kind === "chip"
      ? chip(piece.bpm, piece.timbre ?? "square")
      : piece.kind === "future"
        ? futureKit(piece.bpm, piece.style)
        : piece.kind === "lofi"
          ? lofiKit(piece.bpm)
          : piece.kind === "dnb"
            ? dnbKit(piece.bpm)
            : piece.kind === "dubstep"
              ? dubstepKit(piece.bpm)
              : piece.kind === "bossa"
                ? bossaKit(piece.bpm)
                : piece.kind === "synthwave"
                  ? synthwaveKit(piece.bpm)
                  : pianoKit(piece.bpm);
  if (piece.kind === "chip" && els.timbre) {
    const select = els.timbre;
    select.addEventListener("change", () => {
      kit.releaseAll();
      kit = chip(piece.bpm, select.value as NonNullable<ChipPiece["timbre"]>);
    });
  }
  const visual =
    piece.kind === "piano" ? sparks(els.canvas) : piece.visual === "danmaku" ? danmaku(els.canvas, piece.hues ?? [140, 170, 110, 190]) : pixels(els.canvas);
  const transport = Tone.getTransport();
  const setVolume = () => {
    Tone.getDestination().volume.value = Tone.gainToDb(Number(els.volume.value) / 100);
  };
  els.volume.addEventListener("input", setVolume);
  setVolume();
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
    const { events, end } =
      piece.kind === "chip"
        ? renderChip(piece)
        : piece.kind === "future"
          ? renderFuture(piece)
          : piece.kind === "lofi"
            ? renderLofi(piece)
            : piece.kind === "dnb"
              ? renderDnb(piece)
              : piece.kind === "dubstep"
                ? renderDubstep(piece)
                : piece.kind === "bossa"
                  ? renderBossa(piece)
                  : piece.kind === "synthwave"
                    ? renderSynthwave(piece)
                    : renderPiano(piece);
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
