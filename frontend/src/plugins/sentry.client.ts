import * as Sentry from "@sentry/vue";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const router = useRouter();

  if (!config.public.sentry.dsn) {
    return;
  }

  Sentry.init({
    app: nuxtApp.vueApp,
    autoSessionTracking: true,
    debug: config.public.ENV !== "production",
    dsn: config.public.sentry.dsn,
    environment: config.public.sentry.environment,
    integrations: [
      Sentry.browserTracingIntegration({ router })
    ],
    tracePropagationTargets: ["localhost", config.public.BASE_URL],
    tracesSampleRate: 1.0
  });
});
