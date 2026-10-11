# scoring

曲データのメロディを採点する実験。サイトのビルドには含まれない。

1. 事故（和音の半音上でぶつかったまま伸びる音・メロディの無い小節）と、減点しない逸脱（経過音・先取り・跳躍・シンコペーション・転調など）を分ける（`music.py`）
2. Anticipatory Music Transformer（`stanford-crfm/music-medium-800k`）で、メロディの一音ごとの意外さ（音高・リズム、ビット）を測る（`amt.py`）
3. 一つの区間のメロディを多数書かせ、意外さの 2 軸を 3×3 に分けたマスごとに、まとまりの一番高い候補を残す（`explore.py`）

## 実行

リポジトリのルートで:

```sh
mkdir -p lab/scoring/out
npx tsx lab/scoring/export.mts > lab/scoring/out/pieces.json
cd lab/scoring
uv run python run.py      # out/results.json と out/audio/*.mp3（初回はモデルを約 1.4GB ダウンロード）
uv run python report.py   # out/report.html
```

`ffmpeg` が必要。題材の区間と候補の数は `run.py` の先頭の定数で変える。
