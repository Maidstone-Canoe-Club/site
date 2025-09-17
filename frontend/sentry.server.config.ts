import { config } from "dotenv";
import * as Sentry from "@sentry/nuxt";

config();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
    tracesSampleRate: 1.0,
    profileSessionSampleRate: 0.3
  });
}
