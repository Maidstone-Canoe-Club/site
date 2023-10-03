import * as Sentry from "@sentry/node";
import {
  ProfilingIntegration
} from "@sentry/profiling-node";
import type { H3Event } from "h3";
import { H3Error } from "h3";

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();

  if (!config.public.sentry.dsn) {
    console.warn("Sentry DSN not set, skipping Sentry initialization");
    return;
  }

  Sentry.init({
    dsn: config.public.sentry.dsn,
    environment: config.public.sentry.environment,
    integrations: [
      new ProfilingIntegration()
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1
  });

  nitroApp.hooks.hook("error", (error) => {
    if (error instanceof H3Error) {
      if (error.statusCode === 404 || error.statusCode === 422) {
        return;
      }
    }

    Sentry.captureException(error);
  });

  nitroApp.hooks.hook("request", (event) => {
    event.context.$sentry = Sentry;
  });

  nitroApp.hooks.once("close", async () => {
    await Sentry.close(2000);
  });
});
