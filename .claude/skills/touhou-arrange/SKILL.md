---
name: touhou-arrange
description: niigaki リポジトリで、東方 Project の原曲をチップチューン（Chipzel 風）にアレンジしてローカルで聞けるようにする。楽譜 PDF を探して書き起こし、4 拍子の Chipzel 構成に組み直し、弾幕の背景で鳴らす。「東方の〇〇をアレンジして」「〇〇を Chipzel 風に」と頼まれたときに使う。
---

# 東方アレンジ（niigaki）

原曲の楽譜を書き起こした曲は公開しない。ローカルのブランチにだけコミットし、push しない。

## 1. ローカル用の worktree を用意する

- niigaki のリポジトリで `git branch --list 'local/*'` を見て、一番新しいアレンジ用ブランチから切る（3 拍子・タイ `~`・弾幕 `visual: "danmaku"` はそこにしか無い）
- `git worktree add .claude/worktrees/<slug> -b local/<slug> <base>` → その中で `npm ci`
- dev サーバーは公開用（4377）と分け、空きポートで `npm run dev -- --port <port>` を起動する

## 2. 楽譜を探す

- 「<曲名> 楽譜」「<英語名> MIDI」で探す。MIDI の配布はログイン必須が多い
- 無料 PDF は ALFetite の楽譜置き場（`https://alfetite.com/sheet-music/touhou/`）にあることが多い。サイトの FAQ で利用条件を確かめる
- PDF は空のディレクトリに保存する

## 3. 書き起こす

- `pdftoppm -r 300 -png <pdf> <dir>/p` でページを画像にする
- `bash ~/.claude/skills/touhou-arrange/scripts/crop.sh <dir> <page> <y0> <y1> <x0> <x1> <name>`（座標は 100dpi 換算）で 1 段を左右半分ずつ切り出して読む。16 分音符の段は右手だけを上に余白を取り、2 小節ずつ切る
- 読む前に、その画像の五線の y 座標を決めてから音の高さを数える（ト音記号は下から E4 G4 B4 D5 F5、ヘ音記号は G2 B2 D3 F3 A3）
- 調号・臨時記号（小節の中で持続）・`8va` の範囲・タイを見落とさない
- 右手は一番上の音をメロディに、左手は低音と和音の音から小節ごとの和音を決める
- 同じ音型の繰り返しは 1 回だけ読み、ページ全体の見取り図で繰り返し箇所を確かめる

## 4. 曲データにする

- `src/pieces/<slug>.ts` に書き、`src/pieces/index.ts` に登録する。書き方は `src/pieces/green-eyed.ts` に合わせる
- メロディは `"E4 G4:2 -:4 ~:8"`（`音名:16 分音符の数`、`-` は休符、`~` は前の音を伸ばす）
- 和音は根音が A3〜G4 に入る 3 音で書く（ベースは根音の 2 オクターブ下と 1 オクターブ下を鳴らす）

## 5. Chipzel 風に組み直す

原曲をそのまま鳴らすだけでは Chipzel にならない。次をそろえる。

- 4 拍子・BPM 150〜170・`groove: "four"`
- 3 拍子の原曲は、1 小節の 3 拍を「3＋3＋2」に引き延ばす（`tresillo`）。16 分音符が 12 個続く小節は、和音を駆け上がる 4 音を足して 16 個にする（`flourish`）
- 構成：イントロ 8 → ビルド 4 → ドロップ 16 → ブレイク 8 → 再ビルド 8 → ドロップ 2 16 → ドロップ 3 16
- イントロは原曲の頭の音型を刻んだ呼びかけにし、和音は i→VI→VII→V のような安定した進行にする。刻みの最後の音は和音の音に着地させる（不安定な和音や着地しない音が続くと不安に聞こえる）
- 最後の小節は属和音（V）で終え、頭の小節で主和音に解決させてループのつなぎ目を作る
- ビルドの最後とドロップ 2 の前にスネアロール（`roll`）、各ドロップの頭にクラッシュ（`crash`）、後半のドロップにハモり（`harm`）を入れる
- 背景は `visual: "danmaku"`

## 6. 確かめる

- `npx -p typescript tsc --noEmit -p .` と `npm run build` を `> log 2>&1; echo EXIT:$?` で受ける
- worktree の中で `npx tsx ~/.claude/skills/touhou-arrange/scripts/check.mts <slug>` を実行し、`badBars` が空（意図した休みの小節は除く）・`monoCollisions` が 0 であること、最後の小節から最初の小節への和音とメロディのつながりを見る
- `playwright-cli` でページを開いて PLAY を押し、イントロ・ドロップ 2・つなぎ目の後でスクリーンショットを撮る。コンソールのエラーが favicon の 404 だけであること
- ブラウザのログ（`.playwright-cli/`）を消してから、ローカルのブランチにコミットする。push しない

## 7. 報告する

ローカルの URL（`http://localhost:<port>/niigaki/<slug>/`）、ブランチ名、楽譜の出典、目で読んだので読み違いがあり得ることを伝える。
