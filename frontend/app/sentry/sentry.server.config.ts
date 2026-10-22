import * as Sentry from "@sentry/nuxt";

// Runs before Nitro starts, so runtime config isn't available yet: read the environment directly
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
    tracesSampleRate: 1.0
  });
}
else {
  console.warn("Sentry DSN not set, skipping Sentry initialization");
}
