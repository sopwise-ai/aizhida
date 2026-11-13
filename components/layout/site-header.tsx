"use client";

import { BookOpen, Home, Menu, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE_NAME } from "@/lib/site-meta";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "全部工具", icon: Home },
  { href: "/about", label: "收录标准", icon: BookOpen },
] as const;

export function SiteHeader({ toolCount }: { toolCount: number }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "top-0 z-40 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-200",
        isHome ? "fixed" : "sticky",
        isHome && !scrolled
          ? "border-transparent bg-transparent"
          : "border-border/80 bg-background/90 shadow-sm backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group focus-visible:ring-ring/50 focus-visible:ring-offset-background flex shrink-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={`${SITE_NAME}首页`}
        >
          <BrandMark className="text-brand size-7 transition-transform duration-200 group-hover:-rotate-3 sm:size-8" />
          <span className="text-[15px] font-semibold tracking-[-0.025em] sm:text-[17px]">
            {SITE_NAME}
          </span>
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring/50 relative rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {link.label}
                {active ? (
                  <span
                    aria-hidden
                    className="bg-brand absolute inset-x-3 -bottom-[13px] h-px"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-search"))}
            aria-label="快速搜索工具"
            className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-brand/35 flex size-10 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none md:hidden"
          >
            <Search className="size-4" aria-hidden />
          </button>

          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <Link
            href="/submit"
            aria-label="提交工具"
            className={cn(
              buttonVariants({ size: "sm" }),
              "ml-1 hidden h-10 gap-1.5 px-3 md:inline-flex",
            )}
          >
            <Plus className="size-3.5" aria-hidden />
            <span>提交工具</span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "ml-0.5 size-10 md:hidden",
                )}
                aria-label="打开菜单"
              >
                <Menu className="size-4" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(20rem,calc(100%-2rem))] p-0"
            >
              <SheetHeader className="border-border border-b p-5">
                <SheetTitle className="flex items-center gap-2.5">
                  <BrandMark className="text-brand size-7" />
                  {SITE_NAME}
                </SheetTitle>
                <SheetDescription>
                  {toolCount} 个精选工具，只收王牌。
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4">
                {isHome ? (
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new Event("open-search"))
                      }
                      className="border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-brand/35 mb-4 flex h-11 w-full items-center gap-2 rounded-lg border px-3 text-[13px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Search className="size-4" aria-hidden />
                      搜索所有工具…
                    </button>
                  </SheetClose>
                ) : null}

                <nav aria-label="移动端导航" className="grid gap-1">
                  {navLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        aria-current={
                          pathname === link.href ? "page" : undefined
                        }
                        className={cn(
                          "flex h-11 items-center gap-2.5 rounded-lg px-3 text-[14px] font-medium transition-colors",
                          pathname === link.href
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        <link.icon className="size-4" aria-hidden />
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <Separator className="my-4" />

                <div className="mt-4 grid gap-2">
                  <SheetClose asChild>
                    <Link
                      href="/submit"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-11 w-full rounded-lg",
                      )}
                    >
                      <Plus className="size-4" aria-hidden />
                      提交工具
                    </Link>
                  </SheetClose>
                  <div className="flex h-11 items-center justify-between rounded-lg px-3">
                    <span className="text-muted-foreground text-[14px]">
                      外观
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
