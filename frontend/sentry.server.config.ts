import * as Sentry from "@sentry/nuxt";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});
