import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/app-providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE_URL } from "@/lib/site";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-meta";
import { tools } from "@/lib/tools";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI 直达 · 只收王牌，一键直达官网",
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI 工具",
    "AI 导航",
    "AI 工具大全",
    "写作工具",
    "绘画工具",
    "编程工具",
    "视频工具",
    "AI Agent",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: SITE_NAME,
    title: "AI 直达 · 只收王牌，一键直达官网",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "AI 直达 · 只收王牌，一键直达官网",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 直达 · 只收王牌，一键直达官网",
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  other: {
    "format-detection": "telephone=no",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b10" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={GeistSans.variable}>
      <body>
        <AppProviders>
          <a
            href="#main"
            className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2.5 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            跳到主要内容
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader toolCount={tools.length} />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
