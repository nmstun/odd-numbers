import type { Metadata, Viewport } from "next";
import "./globals.css";
import { version as APP_VERSION } from "../../package.json";

export const metadata: Metadata = {
  title: "odd numbers",
  description: "カメラに映った人の頭上にランダムな数字が浮かんで見えるジョークアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
        {/* 全画面共通で常時表示するアプリバージョン。動作確認・問い合わせ時にどの
            ビルドを見ているか分かるようにする目的。右上はカメラ切替ボタンと被るため左上に配置 */}
        <div
          className="fixed z-50 text-[10px] text-white/40 select-none pointer-events-none"
          style={{
            top: "max(0.5rem, env(safe-area-inset-top))",
            left: "max(0.5rem, env(safe-area-inset-left))",
          }}
        >
          v{APP_VERSION}
        </div>
      </body>
    </html>
  );
}
