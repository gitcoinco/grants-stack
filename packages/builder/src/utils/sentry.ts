import * as Sentry from "@sentry/react";
import { extraErrorDataIntegration } from "@sentry/integrations";

export const initSentry = () => {
  Sentry.init({
    dsn: "https://82dd12303aa97d99e4b14f62ba6c8dfe@o4504301442957312.ingest.us.sentry.io/4507153887854592",
    integrations: [
      new Sentry.BrowserProfilingIntegration(),
      new Sentry.Replay(),
      extraErrorDataIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0,
    // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
};
