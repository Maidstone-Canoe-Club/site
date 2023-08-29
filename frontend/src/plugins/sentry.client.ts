import * as Sentry from "@sentry/vue";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  Sentry.init({
    enabled: config.public.SENTRY_ENABLED,
    app: nuxtApp.vueApp,
    autoSessionTracking: true,
    debug: config.public.ENV !== "production",
    dsn: config.public.SENTRY_DSN,
    release: config.public.SENTRY_RELEASE,
    environment: config.public.SENTRY_ENVIRONMENT,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(nuxtApp.$router as Router)
      })
    ],
    trackComponents: true,
    hooks: ["activate", "create", "destroy", "mount", "update"],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.2,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1
  });

  return {
    provide: {
      sentrySetContext: Sentry.setContext,
      sentrySetUser: Sentry.setUser,
      sentrySetTag: Sentry.setTag,
      sentryAddBreadcrumb: Sentry.addBreadcrumb,
      sentryCaptureException: Sentry.captureException
    }
  };
});
