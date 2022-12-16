import { Router, Request, Response } from "express";
import { calculateHandler } from "./handlers/calculateHandler";
import { fetchMatchingHandler } from "./handlers/fetchMatchingHandler";
import { convertPriceHandler } from "./handlers/convertPriceHandler";
import { fetchRoundStatsHandler } from "./handlers/fetchRoundStatsHandler";
import { fetchProjectInRoundStatsHandler } from "./handlers/fetchProjectInRoundStatsHandler";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/calculate", calculateHandler);

router.get("/fetch-matching", fetchMatchingHandler);

router.post("/convert-price", convertPriceHandler);

router.get("/round-stats", fetchRoundStatsHandler);

router.get("/project-stats", fetchProjectInRoundStatsHandler);

export default router;
