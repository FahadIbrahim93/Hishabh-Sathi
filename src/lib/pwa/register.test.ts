import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker, SERVICE_WORKER_SCOPE, SERVICE_WORKER_URL } from "./register";

describe("service worker registration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("registers the root worker at the site scope", async () => {
    const register = vi.fn().mockResolvedValue({ scope: "/" });
    await expect(registerServiceWorker({ register })).resolves.toBe(true);
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(SERVICE_WORKER_URL, {
      scope: SERVICE_WORKER_SCOPE,
    });
    expect(SERVICE_WORKER_URL).toBe("/sw.js");
    expect(SERVICE_WORKER_SCOPE).toBe("/");
  });

  it("stays usable when the browser refuses to register a worker", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const register = vi.fn().mockRejectedValue(new Error("blocked by policy"));
    await expect(registerServiceWorker({ register })).resolves.toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("returns false when the browser has no service worker support", async () => {
    await expect(registerServiceWorker(undefined)).resolves.toBe(false);
    await expect(registerServiceWorker({} as unknown as { register: () => void })).resolves.toBe(
      false,
    );
  });
});
