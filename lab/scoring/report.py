"""Builds out/report.html from out/results.json, with the audio embedded."""

import base64
import json

from music import OUT

TEMPLATE = OUT.parent / "report.template.html"


def main():
    data = json.loads((OUT / "results.json").read_text())
    audio = {cid: "data:audio/mpeg;base64," + base64.b64encode((OUT / "audio" / f"{cid}.mp3").read_bytes()).decode() for cid in data["explore"]["audio"]}
    payload = json.dumps({**data, "audioData": audio}, ensure_ascii=False).replace("</", "<\\/")
    (OUT / "report.html").write_text(TEMPLATE.read_text().replace("/*DATA*/null", payload))


if __name__ == "__main__":
    main()
