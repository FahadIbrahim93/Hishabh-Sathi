import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { brokerCredentialsReady } from "./broker-config.ts";

describe("broker OAuth credentials fail closed", () => {
  it("disables federation when no credentials are supplied", () => {
    assert.equal(brokerCredentialsReady({ authDisabled: false }), false);
  });

  it("disables federation when only one credential is present", () => {
    assert.equal(brokerCredentialsReady({ authDisabled: false, clientId: "example-client" }), false);
    assert.equal(brokerCredentialsReady({ authDisabled: false, clientSecret: "example-secret" }), false);
  });

  it("rejects whitespace-only values", () => {
    assert.equal(
      brokerCredentialsReady({
        authDisabled: false,
        clientId: "example-client",
        clientSecret: "   ",
      }),
      false,
    );
  });

  it("respects the explicit off-switch even with credentials", () => {
    assert.equal(
      brokerCredentialsReady({
        authDisabled: true,
        clientId: "example-client",
        clientSecret: "example-secret",
      }),
      false,
    );
  });

  it("enables federation only for explicit complete credentials", () => {
    assert.equal(
      brokerCredentialsReady({
        authDisabled: false,
        clientId: "example-client",
        clientSecret: "example-secret",
      }),
      true,
    );
  });

  it("has no baked preview credentials or silent broker fallback", () => {
    const preview = readFileSync(new URL("./preview.ts", import.meta.url), "utf8");
    const server = readFileSync(new URL("./server.ts", import.meta.url), "utf8");
    assert.doesNotMatch(preview, /PREVIEW_CLIENT_SECRET|PREVIEW_CLIENT_ID/);
    assert.doesNotMatch(server, /PREVIEW_CLIENT_SECRET|PREVIEW_CLIENT_ID/);
    assert.match(server, /const grokClientId = env\("GROK_AUTH_CLIENT_ID"\);/);
    assert.match(server, /const grokClientSecret = env\("GROK_AUTH_CLIENT_SECRET"\);/);
  });
});
