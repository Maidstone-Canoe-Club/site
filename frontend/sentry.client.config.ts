import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();

if (config.public.sentry.dsn) {
  Sentry.init({
    dsn: config.public.sentry.dsn,
    environment: config.public.sentry.environment,
    tracePropagationTargets: ["localhost", config.public.BASE_URL],
    tracesSampleRate: 1.0,
    trackComponents: true
  });
}
