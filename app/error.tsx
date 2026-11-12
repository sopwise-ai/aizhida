"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-brand font-mono text-sm font-medium tracking-[0.2em]">
        出错了
      </p>
      <h1 className="display-title mt-2 text-3xl font-semibold tracking-tight">
        页面暂时无法加载
      </h1>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        可以刷新重试。如果问题持续出现，请稍后再访问。
      </p>
      <Button type="button" size="lg" onClick={reset} className="mt-7 gap-2">
        <RotateCcw aria-hidden />
        重新加载
      </Button>
    </div>
  );
}
