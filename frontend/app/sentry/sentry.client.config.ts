import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();

if (config.public.sentry.dsn) {
  // Browser tracing and the Vue integration are added by the @sentry/nuxt module
  Sentry.init({
    dsn: config.public.sentry.dsn,
    environment: config.public.sentry.environment,
    debug: config.public.ENV !== "production",
    tracePropagationTargets: ["localhost", config.public.BASE_URL],
    tracesSampleRate: 1.0
  });
}
