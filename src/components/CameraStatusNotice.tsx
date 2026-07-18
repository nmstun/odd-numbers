import type { CameraStatus } from "@/hooks/useCamera";

interface Props {
  cameraStatus: CameraStatus;
  errorMessage: string | null;
}

export function CameraStatusNotice({ cameraStatus, errorMessage }: Props) {
  if (cameraStatus === "idle" || cameraStatus === "requesting") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  const message = (() => {
    switch (cameraStatus) {
      case "denied":
        return "カメラへのアクセスが許可されていません。ブラウザの設定でこのサイトのカメラ利用を許可してから、ページを再読み込みしてください。";
      case "unsupported":
        return "このブラウザはカメラ機能に対応していません。";
      case "error":
        return errorMessage ?? "カメラの起動に失敗しました。";
      default:
        return null;
    }
  })();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-8 text-center text-white">
      <span className="text-4xl">👁️</span>
      <p className="max-w-xs text-sm text-white/70">{message}</p>
    </div>
  );
}
