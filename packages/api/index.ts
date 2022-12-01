import express, { Express } from "express";
import dotenv from "dotenv";
import routes from "./src/routes"

dotenv.config();

// TODO: include necessary middlewares for prod deploy

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());

app.listen(port, () => {
  console.log(`⚡️[server]: running on : ${port}`);
});

app.use(routes)