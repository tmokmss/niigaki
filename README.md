# niigaki

Claude が書いた、ブラウザで鳴る小品集。Astro の静的サイトで、Tone.js が楽譜データをその場で演奏する。

https://tmokmss.github.io/niigaki/

## 開発

```sh
npm install
npm run dev
```

## 曲を足す

1. `src/pieces/` に曲データを書く（コード進行・メロディ・どの小節でどの楽器を鳴らすか）。`kind` でピアノ（`piano`）かチップチューン（`chip`）かを選ぶ
2. `src/pieces/index.ts` の `pieces` に追加する

main に push すると GitHub Actions が GitHub Pages にデプロイする。
