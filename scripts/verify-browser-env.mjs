#!/usr/bin/env node
/**
 * Verify the environment the IndexedDB browser specs need, before they run.
 *
 * The specs drive a real Chromium, render the Bangla UI and assert on visible
 * text. Two things must exist for that to mean anything:
 *
 *   1. a Chromium binary whose shared libraries all resolve, and
 *   2. at least one Bengali-capable font. Without a font, Chromium lays the
 *      Bangla text out with zero glyphs, the element boxes collapse to zero
 *      height, and Playwright reports the element as hidden — which surfaces as
 *      a confusing assertion failure instead of "the runner has no fonts".
 *
 * Run this after `npx playwright install --with-deps chromium` and the font
 * packages; it is a check, not a provisioner, so CI fails with an actionable
 * message instead of a mystery timeout.
 *
 * Usage: node scripts/verify-browser-env.mjs
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { chromium } from "playwright";

const FONT_EXTENSIONS = [".ttf", ".otf", ".ttc", ".otc"];
const BENGALI_FONT = /beng|lohit/i;

function fontDirectories() {
  const dirs = new Set(["/usr/share/fonts", "/usr/local/share/fonts", "/usr/share/fonts/truetype"]);
  const conf = process.env.FONTCONFIG_FILE;
  if (conf && existsSync(conf)) {
    try {
      for (const match of readFileSync(conf, "utf8").matchAll(/<dir>([^<]+)<\/dir>/g)) {
        dirs.add(match[1].trim());
      }
    } catch {
      /* an unreadable config just means we fall back to the standard dirs */
    }
  }
  return [...dirs].filter((dir) => existsSync(dir));
}

function findBengaliFont(dir, depth = 0) {
  if (depth > 4) return null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findBengaliFont(path, depth + 1);
      if (found) return found;
      continue;
    }
    if (!FONT_EXTENSIONS.some((ext) => entry.name.toLowerCase().endsWith(ext))) continue;
    if (BENGALI_FONT.test(entry.name)) return path;
  }
  return null;
}

function missingLibraries(binary) {
  try {
    const output = execFileSync("ldd", [binary], { encoding: "utf8" });
    return output
      .split("\n")
      .filter((line) => line.includes("not found"))
      .map((line) => line.trim());
  } catch {
    // `ldd` absent or the binary will not load at all — let the launch check speak.
    return [];
  }
}

const problems = [];
const binary = chromium.executablePath();

if (!existsSync(binary)) {
  problems.push(
    `no Chromium binary at ${binary} — run \`npx playwright install chromium\` (it is pinned by package-lock.json)`,
  );
} else {
  const missing = missingLibraries(binary);
  if (missing.length > 0) {
    problems.push(
      `Chromium cannot load ${missing.length} shared library/libraries:\n` +
        missing.map((line) => `  ${line}`).join("\n") +
        "\n  run `npx playwright install-deps chromium` (uses apt; needs sudo)",
    );
  }
}

const fontDirs = fontDirectories();
const bengaliFont = fontDirs.map((dir) => findBengaliFont(dir)).find(Boolean) ?? null;
if (!bengaliFont) {
  problems.push(
    "no Bengali-capable font found in " +
      (fontDirs.length ? fontDirs.join(", ") : "the standard font directories") +
      " — without it Bangla text lays out with zero glyphs and Playwright reports it as hidden.\n" +
      "  install `fonts-noto-core` and `fonts-lohit-beng-bengali` (apt), or point FONTCONFIG_FILE at a config listing them",
  );
}

if (problems.length > 0) {
  console.error("browser environment: NOT READY");
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`browser environment: ok — chromium ${binary}`);
console.log(`browser environment: ok — bengali font ${bengaliFont}`);
