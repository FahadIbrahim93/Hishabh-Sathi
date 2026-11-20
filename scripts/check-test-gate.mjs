#!/usr/bin/env node
/**
 * Fail the test gate when tests that are supposed to run did not run.
 *
 * `vitest` treats `it.skip` / `describe.skip` / a filtered-out file as a pass:
 * the process exits 0 while the guarantees those tests encode silently stop
 * being enforced. The IndexedDB browser specs are the clearest case — they skip
 * themselves when no Chromium binary exists, so a broken runner would look green
 * while nothing about durable writes was actually checked.
 *
 * This gate reads a `--reporter=json` report and refuses to pass when:
 *   1. any test was skipped, pending or todo,
 *   2. any test failed,
 *   3. the browser spec file did not run at all, or ran fewer than the expected
 *      number of cases,
 *   4. fewer than MIN_TESTS tests passed (guards against a silently shrunken
 *      suite as well as skip-by-omission).
 *
 * Usage: node scripts/check-test-gate.mjs .vitest-report.json
 * Env:   MIN_TESTS (default 110) — same or better than the recorded baseline.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const DEFAULT_MIN_TESTS = 110;
export const BROWSER_SPEC = "receipt.browser.test.ts";
export const MIN_BROWSER_TESTS = 4;

/**
 * @typedef {{ fullName?: string, title?: string, status?: string }} RawAssertion
 * @typedef {{ name?: string, testFilePath?: string, assertionResults?: RawAssertion[] }} RawFile
 * @typedef {{ name: string, assertions: { title: string, status: string }[] }} SpecFile
 */

/**
 * @param {unknown} report
 * @returns {SpecFile[]}
 */
function collect(report) {
  const raw = /** @type {{ testResults?: RawFile[] }} */ (report ?? {});
  const files = Array.isArray(raw.testResults) ? raw.testResults : [];
  return files.map((file) => ({
    name: file.name ?? file.testFilePath ?? "",
    assertions: (file.assertionResults ?? []).map((assertion) => ({
      title: assertion.fullName ?? assertion.title ?? "",
      status: assertion.status ?? "unknown",
    })),
  }));
}

/**
 * @param {unknown} report parsed vitest JSON report
 * @param {{ minTests?: number, browserSpec?: string, minBrowserTests?: number }} [options]
 */
export function evaluateTestGate(report, options = {}) {
  /** @type {{ minTests?: number, browserSpec?: string, minBrowserTests?: number }} */
  const settings = options;
  const minTests = settings.minTests ?? DEFAULT_MIN_TESTS;
  const browserSpec = settings.browserSpec ?? BROWSER_SPEC;
  const minBrowserTests = settings.minBrowserTests ?? MIN_BROWSER_TESTS;

  const files = collect(report);
  const all = files.flatMap((file) => file.assertions.map((a) => ({ ...a, file: file.name })));
  const problems = [];

  const notRun = all.filter((a) => a.status !== "passed" && a.status !== "failed");
  if (notRun.length > 0) {
    problems.push(
      `${notRun.length} test(s) were skipped or not run, so their guarantee is not enforced:\n` +
        notRun.map((a) => `  - ${a.file} > ${a.title} (${a.status})`).join("\n"),
    );
  }

  const failed = all.filter((a) => a.status === "failed");
  if (failed.length > 0) {
    problems.push(
      `${failed.length} test(s) failed:\n` +
        failed.map((a) => `  - ${a.file} > ${a.title}`).join("\n"),
    );
  }

  const browserFiles = files.filter((file) => file.name.includes(browserSpec));
  const browserAssertions = browserFiles.flatMap((file) => file.assertions);
  const browserPassed = browserAssertions.filter((a) => a.status === "passed").length;
  if (browserFiles.length === 0) {
    problems.push(
      `the browser spec ${browserSpec} did not run at all — the durable-write evidence is missing`,
    );
  } else if (browserPassed < minBrowserTests) {
    problems.push(
      `only ${browserPassed} of the ${minBrowserTests} required browser specs passed in ${browserSpec}`,
    );
  }

  const passed = all.filter((a) => a.status === "passed").length;
  if (passed < minTests) {
    problems.push(`only ${passed} tests passed; at least ${minTests} are required`);
  }

  return {
    ok: problems.length === 0,
    problems,
    stats: {
      passed,
      failed: failed.length,
      skipped: notRun.length,
      browserPassed,
      files: files.length,
      minTests,
    },
  };
}

/** @param {string[]} argv */
function main(argv) {
  const reportPath = argv[2] ?? ".vitest-report.json";
  let report;
  try {
    report = JSON.parse(readFileSync(reportPath, "utf8"));
  } catch (error) {
    console.error(
      `test gate: cannot read ${reportPath}: ${error instanceof Error ? error.message : error}`,
    );
    console.error("test gate: run the suite with --reporter=json --outputFile=<path> first");
    return 1;
  }

  const minTests = Number(process.env.MIN_TESTS ?? DEFAULT_MIN_TESTS);
  const result = evaluateTestGate(report, { minTests });
  const { stats } = result;

  if (!result.ok) {
    console.error("test gate: FAILED");
    for (const problem of result.problems) console.error(`  ${problem}`);
    return 1;
  }

  console.log(
    `test gate: ok — ${stats.passed} passed, ${stats.failed} failed, ${stats.skipped} skipped, ` +
      `${stats.browserPassed} browser specs across ${stats.files} files (floor ${stats.minTests})`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv));
}
