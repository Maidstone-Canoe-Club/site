import * as Sentry from "@sentry/node";

export default ({ init }, { env }) => {
  const { SENTRY_DSN } = env;

  Sentry.init({
    dsn: SENTRY_DSN,
  });

  init("routes.before", ({ app }) => {
    app.use(Sentry.Handlers.requestHandler());
    console.log("-- Sentry Request Handler Added --");
  });

  init("routes.custom.after", ({ app }) => {
    app.use(Sentry.Handlers.errorHandler());
    console.log("-- Sentry Error Handler Added --");
  });
};
