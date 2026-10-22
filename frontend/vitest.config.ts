import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  // any custom Vitest config you require,
  test: {
    environment: "nuxt",
    // Each file boots a Nuxt environment, which can take longer than the 10s default
    hookTimeout: 60_000
  }
});
