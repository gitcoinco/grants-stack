import express, { Express } from "express";
import dotenv from "dotenv";
import routes from "./src/routes";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://d65e33d74350481b82b7b4efc62bcbb0@o4504301442957312.ingest.sentry.io/4504326423052288",
});

dotenv.config();

// TODO: include necessary middlewares for prod deploy

const app: Express = express();
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
