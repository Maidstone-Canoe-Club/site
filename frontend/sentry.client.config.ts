import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();

if (!config.public.sentry.dsn) {
  return;
}

Sentry.init({
  dsn: config.public.sentry.dsn,
  environment: config.public.sentry.environment,
  tracePropagationTargets: ["localhost", config.public.BASE_URL],
  tracesSampleRate: 1.0,
  profilesSampleRate: 0.5,
  trackComponents: true,
  integrations: [
    Sentry.browserTracingIntegration()
  ]
});
