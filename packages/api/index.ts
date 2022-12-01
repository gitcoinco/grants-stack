import express, { Express } from "express";
import dotenv from "dotenv";
import routes from "./src/routes"

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());

app.listen(port, () => {
  console.log(`⚡️[server]: running on : ${port}`);
});

app.use(routes)