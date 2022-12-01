import { Router, Request, Response } from "express";
import { calculateHandler, fetchMatchingHandler } from "./handlers";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/calculate", calculateHandler);

router.get("/fetch-matching", fetchMatchingHandler);

export default router;
