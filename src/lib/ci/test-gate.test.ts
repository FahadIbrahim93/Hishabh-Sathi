import { describe, expect, it } from "vitest";
import { evaluateTestGate } from "../../../scripts/check-test-gate.mjs";

const browserFile = "/repo/src/lib/hishab/receipt.browser.test.ts";
const unitFile = "/repo/src/lib/hishab/money.test.ts";

type Status = "passed" | "failed" | "skipped";

function file(name: string, statuses: Status[]) {
  return {
    name,
    assertionResults: statuses.map((status, index) => ({
      fullName: `${name} case ${index}`,
      status,
    })),
  };
}

/** A report that meets the floor: three browser specs plus filler unit tests. */
function healthyReport(total = 110): unknown {
  return {
    testResults: [
      file(browserFile, ["passed", "passed", "passed"]),
      file(unitFile, Array(total - 3).fill("passed")),
    ],
  };
}

describe("test gate", () => {
  it("passes a report where every test ran and the browser specs executed", () => {
    const result = evaluateTestGate(healthyReport());
    expect(result.ok).toBe(true);
    expect(result.problems).toEqual([]);
    expect(result.stats).toMatchObject({
      passed: 110,
      skipped: 0,
      browserPassed: 3,
      minTests: 110,
    });
  });

  it("fails when a browser spec is skipped even though the run exited cleanly", () => {
    const report = {
      testResults: [
        file(browserFile, ["passed", "passed", "skipped"]),
        file(unitFile, Array(107).fill("passed")),
      ],
    };
    const result = evaluateTestGate(report);
    expect(result.ok).toBe(false);
    expect(result.problems.join("\n")).toMatch(/skipped or not run/);
    expect(result.stats.browserPassed).toBe(2);
  });

  it("fails when the browser spec did not run at all", () => {
    const report = { testResults: [file(unitFile, Array(110).fill("passed"))] };
    const result = evaluateTestGate(report);
    expect(result.ok).toBe(false);
    expect(result.problems.join("\n")).toMatch(/did not run at all/);
  });

  it("fails when the suite shrank below the recorded baseline", () => {
    const report = {
      testResults: [
        file(browserFile, ["passed", "passed", "passed"]),
        file(unitFile, Array(100).fill("passed")),
      ],
    };
    const result = evaluateTestGate(report);
    expect(result.ok).toBe(false);
    expect(result.problems.join("\n")).toMatch(/at least 110/);
    expect(result.stats.passed).toBe(103);
  });

  it("fails when a test failed", () => {
    const report = {
      testResults: [
        file(browserFile, ["passed", "failed", "passed"]),
        file(unitFile, Array(107).fill("passed")),
      ],
    };
    const result = evaluateTestGate(report);
    expect(result.ok).toBe(false);
    expect(result.problems.join("\n")).toMatch(/1 test\(s\) failed/);
  });

  it("honours an explicit lower floor for smaller suites", () => {
    const report = {
      testResults: [
        file(browserFile, ["passed", "passed", "passed"]),
        file(unitFile, ["passed", "passed"]),
      ],
    };
    expect(evaluateTestGate(report).ok).toBe(false);
    expect(evaluateTestGate(report, { minTests: 5 }).ok).toBe(true);
  });

  it("treats an unreadable report shape as a failure rather than a pass", () => {
    const result = evaluateTestGate({});
    expect(result.ok).toBe(false);
    expect(result.problems.join("\n")).toMatch(/did not run at all/);
  });
});
