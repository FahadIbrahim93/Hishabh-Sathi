import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const PUBLIC = join(ROOT, "public");

type Icon = { src: string; sizes: string; type: string; purpose?: string };

const manifest = JSON.parse(readFileSync(join(PUBLIC, "manifest.webmanifest"), "utf8")) as {
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: Icon[];
};

const ICONS = new Map(
  manifest.icons.map((icon) => [`${icon.sizes}:${icon.purpose ?? "any"}`, icon]),
);

/** Reads width and height from a PNG IHDR chunk; also proves it is a PNG. */
function pngSize(bytes: Buffer): { width: number; height: number } {
  const signature = "89504e470d0a1a0a";
  expect(bytes.subarray(0, 8).toString("hex")).toBe(signature);
  expect(bytes.subarray(12, 16).toString("ascii")).toBe("IHDR");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("web app manifest", () => {
  it("identifies the app for installation", () => {
    expect(manifest.id).toBe("/");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.lang).toBe("bn");
    expect(manifest.name).toContain("হিসাব সাথী");
    expect(manifest.short_name).toBe("হিসাব সাথী");
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.description.length).toBeGreaterThan(20);
    expect(manifest.theme_color.toUpperCase()).toBe("#0F6B4C");
    expect(manifest.background_color.toUpperCase()).toBe("#F3EFE4");
  });

  it("ships the four required icon slots", () => {
    expect([...ICONS.keys()].sort()).toEqual([
      "192x192:any",
      "192x192:maskable",
      "512x512:any",
      "512x512:maskable",
    ]);
  });

  it("ships real PNG files whose pixels match their declared size", () => {
    for (const icon of manifest.icons) {
      expect(icon.type).toBe("image/png");
      expect(icon.src.startsWith("/icons/")).toBe(true);
      const file = join(PUBLIC, icon.src);
      expect(existsSync(file), icon.src).toBe(true);
      const bytes = readFileSync(file);
      const [width, height] = icon.sizes.split("x").map(Number);
      expect(pngSize(bytes)).toEqual({ width, height });
      expect(statSync(file).size).toBeGreaterThan(1_000);
      expect(statSync(file).size).toBeLessThan(200_000);
    }
  });

  it("ships a self-contained offline page", () => {
    const offline = readFileSync(join(PUBLIC, "offline.html"), "utf8");
    expect(offline).toContain('lang="bn"');
    expect(offline).toContain("ইন্টারনেট নেই");
    // No external stylesheet, script, font or image: it must render with no
    // network at all.
    expect(offline).not.toMatch(/(?:src|href)="https?:/i);
    expect(offline).not.toMatch(/<script/i);
    expect(offline).not.toMatch(/@import/i);
  });
});
