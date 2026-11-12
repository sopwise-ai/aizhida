import { Compass, Home } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "页面不存在",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
        <Compass className="size-7" aria-hidden />
      </span>
      <p className="text-muted-foreground mt-6 text-sm font-medium">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        这个页面不存在
      </h1>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        链接可能已经失效，或者工具已经下架。回到首页继续浏览精选 AI 工具。
      </p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          <Home aria-hidden />
          返回首页
        </Link>
        <Link
          href="/about"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          查看收录标准
        </Link>
      </div>
    </div>
  );
}
