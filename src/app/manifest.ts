import type { MetadataRoute } from "next";

// ホーム画面に追加したときのアイコンと名称を定義する。
// Next.jsがこのファイルを検出して /manifest.webmanifest を配信し、link タグも自動で挿入する
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "odd numbers",
    short_name: "odd numbers",
    description:
      "カメラに映った人の頭上にランダムな数字が浮かんで見えるジョークアプリ",
    start_url: "/",
    theme_color: "#000000",
    background_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
