import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  globalSetup: "./tests/visual/global-setup.mjs",
  use: {
    baseURL: "http://127.0.0.1:3107",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
