import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <output
      aria-label="加载中"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3"
    >
      <Loader className="text-brand size-6 animate-spin" aria-hidden />
      <p className="text-muted-foreground text-[12px]">正在加载精选工具…</p>
    </output>
  );
}
