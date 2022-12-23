import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import {
  ReportingObserver as ReportingObserverIntegration,
  CaptureConsole as CaptureConsoleIntegration
} from "@sentry/integrations";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN || "",
    integrations: [
      new BrowserTracing(),
      new ReportingObserverIntegration(),
      new CaptureConsoleIntegration(
        {
          levels: ['error', 'warn']
        }
      )
    ],
    tracesSampleRate: 1.0,
  });
};
