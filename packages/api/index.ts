import express, { Express } from "express";
import cors from 'cors';
import dotenv from "dotenv";
import routes from "./src/routes";
import * as Sentry from "@sentry/node";
import {
  ReportingObserver as ReportingObserverIntegration,
  CaptureConsole as CaptureConsoleIntegration
} from "@sentry/integrations";


Sentry.init({
  dsn: `${process.env.SENTRY_DSN}`,
  integrations: [
    new ReportingObserverIntegration(),
    new CaptureConsoleIntegration(
      {
        levels: ['error', 'warn']
      }
    )
  ],
});

dotenv.config();


const app: Express = express();

// TODO: Add allowed origins to env
const options: cors.CorsOptions = {
  origin: ['http://localhost:3000']
};
app.use(cors(options));

app.use(Sentry.Handlers.requestHandler());
app.use(express.json());

app.use(routes);

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use(Sentry.Handlers.errorHandler());

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`⚡️[server]: running on : ${port}`);
});
