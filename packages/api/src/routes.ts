import { Router, Request, Response } from "express";
import { calculateHandler } from "./handlers";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/calculate", calculateHandler);

export default router;
