import * as Sentry from "@sentry/nuxt";
import { useRuntimeConfig } from "#imports";

const config = useRuntimeConfig();

Sentry.init({
  dsn: config.public.sentry.dsn,
  environment: config.public.sentry.environment
});
