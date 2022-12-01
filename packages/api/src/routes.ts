import { Router, Request, Response } from "express";
import { calculateHandler, getAllHandler } from "./handlers";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/calculate", async (req: Request, res: Response) => {
  // Get parameters
  const body = req.body;

  // Invoke calculate handler
  const response = await calculateHandler(body);

  res.json(response);
});

router.get("/all", async (req: Request, res: Response) => {
  const response = await getAllHandler();
  res.json(response);
});

export default router
