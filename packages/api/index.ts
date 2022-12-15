import express, { Express } from "express";
import cors from 'cors';
import dotenv from "dotenv";
import routes from "./src/routes"

dotenv.config();

// TODO: include necessary middlewares for prod deploy

const app: Express = express();
const port = process.env.PORT;

// TODO: Add allowed origins to env
const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options));

app.use(express.json());

app.listen(port, () => {
  console.log(`⚡️[server]: running on : ${port}`);
});

app.use(routes)