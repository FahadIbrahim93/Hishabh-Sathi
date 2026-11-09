import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.ts?(x)"],
    environment: "node",
    globals: true,
  },
});
