import logos from "./tool-logos.json";

const LOGOS = logos as Record<string, string>;

export function getToolLogo(id: string): string | undefined {
  return LOGOS[id];
}
