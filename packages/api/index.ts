import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./src/controllers/v1/routes";
import { initSentry } from "./sentry";

dotenv.config();

const app: Express = express();

// TODO: Add allowed origins to env
const options: cors.CorsOptions = {
  origin: "*",
};
app.use(cors(options));

initSentry(app);

app.use(express.json());

app.use("/api/v1", routes);

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(
    `
     ▄▀  █ ▀█▀ ▄▀▀ ▄▀▄ █ █▄ █   ▄▀  █▀▄ ▄▀▄ █▄ █ ▀█▀ ▄▀▀   ▄▀▄ █▀▄ █
     ▀▄█ █  █  ▀▄▄ ▀▄▀ █ █ ▀█   ▀▄█ █▀▄ █▀█ █ ▀█  █  ▄██   █▀█ █▀  █
    `
  );
  console.log(`🟢️ [server]: running on : ${port}`);
});

process.on("SIGINT", () => {
  console.log("😵 SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("🔴 HTTP server closed");
  });
});
