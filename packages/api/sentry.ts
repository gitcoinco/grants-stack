import { Express } from "express";
import * as Sentry from "@sentry/node";
import {
  ReportingObserver as ReportingObserverIntegration,
  CaptureConsole as CaptureConsoleIntegration,
} from "@sentry/integrations";

export const initSentry = (app: Express) => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    integrations: [
      new ReportingObserverIntegration(),
      new CaptureConsoleIntegration({
        levels: ["error", "warn"],
      }),
    ],

    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
};
