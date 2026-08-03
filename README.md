# odd numbers

カメラをかざすと、映った人の頭上にランダムな数字が赤くにじんで浮かんで見える
ジョークWebアプリ。デスノートの死神の目をイメージしています。

## 仕組み

- `getUserMedia` でカメラ映像(背面カメラ優先)を取得し `<video>` に表示
- [`@mediapipe/tasks-vision`](https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector) の `FaceDetector`(BlazeFace, WASM/ブラウザ内推論)でフレームごとに顔を検出
- 検出結果をフレーム間でIoU(重なり率)マッチングして人物を追跡し、
  同一人物には最初に検出した瞬間に決めたランダムな数字(7〜8桁)を固定で表示し続ける
- `<video>` は `object-fit: cover` で表示しているため、実際の表示サイズ・トリミング量を
  計算してから正規化座標を画面座標に変換してオーバーレイを配置
- 数字は初出現時だけスロットのように一瞬揺れてから確定する演出付き

すべてブラウザ内で完結するクライアントサイドのみの構成で、サーバーやDBは使用していません。

## 構成

- Next.js (App Router) + TypeScript + Tailwind CSS
- `src/hooks/useCamera.ts` — `getUserMedia` によるカメラ取得・権限状態の管理
- `src/hooks/useFaceTracking.ts` — MediaPipe `FaceDetector` の初期化と `requestAnimationFrame` による検出ループ
- `src/lib/faceTracker.ts` — IoUベースの人物追跡・固定番号割り当て(iOS版 `FaceTracker.swift` の移植)
- `src/components/CameraStage.tsx` — カメラプレビューとオーバーレイをまとめるメイン画面
- `src/components/NumberOverlay.tsx` / `ShinigamiNumber.tsx` — 数字オーバーレイの座標変換と描画・演出
- `src/components/CameraStatusNotice.tsx` — 権限リクエスト中・拒否時などの案内画面
- `src/app/icon.svg` — アプリアイコン。漆黒に赤くにじむ数字「47」を7セグ風の線で描いたもの。フォントに依存させないため文字要素は使っていない
- `src/app/manifest.ts` — ホーム画面に追加したときの名称とアイコン(Next.jsが `/manifest.webmanifest` として配信し `link` タグも自動挿入する)

`src/app/apple-icon.png`(180px)と `public/icon-192.png` / `public/icon-512.png` は
`src/app/icon.svg` から `rsvg-convert` で書き出している。図形を変えるときはSVG側だけを直し、
以下でPNGを作り直す。

```sh
rsvg-convert -w 180 -h 180 src/app/icon.svg -o src/app/apple-icon.png
rsvg-convert -w 192 -h 192 src/app/icon.svg -o public/icon-192.png
rsvg-convert -w 512 -h 512 src/app/icon.svg -o public/icon-512.png
```

## セットアップ

```sh
npm install
npm run dev
```

`http://localhost:3000`(または `.claude/launch.json` で指定したポート)を開いてください。
カメラAPIはHTTPS、または `localhost` でのみ動作します。実機のスマートフォンで試す場合は
Vercel等にデプロイするか、HTTPSでトンネリングしてアクセスしてください。

## 依存関係の更新

Renovate（`renovate.json`）により、依存パッケージの更新PRが週次で自動作成されます（実際に動かすにはGitHub Appとして[Renovate](https://github.com/apps/renovate)を本リポジトリにインストールしてください）。lockfile（`package-lock.json`）によりインストールされるバージョンは常に固定されているため、PRを確認してからマージする運用です。

## 既知の制限 (V1)

- フロント/バックカメラの切り替えは未実装(`facingMode: environment` で背面カメラを優先)
- 複数人が大きく重なった場合、追跡がまれに入れ替わることがある(IoUによる簡易追跡のため)
