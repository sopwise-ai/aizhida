import type { Metadata } from "next";

import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <ToolsExplorer tools={tools} />;
}
