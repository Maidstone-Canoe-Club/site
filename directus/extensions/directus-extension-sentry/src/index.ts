import * as Sentry from "@sentry/node";

export default defineHook(({init}, {env}) => {
    const {SENTRY_DSN} = env;

    if (SENTRY_DSN) {
        Sentry.init({
            dsn: SENTRY_DSN,
			tracesSampleRate: 1.0
        });

        init('routes.before', ({app}) => {
            app.use(Sentry.Handlers.requestHandler());
            console.log('-- Sentry Request Handler Added --');
        });

        init('routes.custom.after', ({app}) => {
            app.use(Sentry.Handlers.errorHandler());
            console.log('-- Sentry Error Handler Added --');
        });
    }
});
