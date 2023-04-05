import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import {
  ReportingObserver as ReportingObserverIntegration,
  CaptureConsole as CaptureConsoleIntegration,
} from "@sentry/integrations";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN || "",
    integrations: [
      new BrowserTracing(),
      new ReportingObserverIntegration(),
      new CaptureConsoleIntegration({
        levels: ["error", "warn"],
      }),
      new Sentry.Replay(),
    ],
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,
  });
};
