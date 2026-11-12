import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <output
      aria-label="加载中"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <Loader
        className="text-muted-foreground size-6 animate-spin"
        aria-hidden
      />
    </output>
  );
}
