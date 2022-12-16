import {Request, Response, Router} from "express";
import {calculateHandler} from "./handlers/calculateHandler";
import {fetchMatchingHandler} from "./handlers/fetchMatchingHandler";
import {convertPriceHandler} from "./handlers/convertPriceHandler";
import {fetchRoundStatsHandler} from "./handlers/fetchRoundStatsHandler";
import {
  fetchProjectInRoundStatsHandler,
} from "./handlers/fetchProjectInRoundStatsHandler";
import {roundSummaryHandler} from "./handlers/roundSummaryHandler";
import {projectSummaryHandler} from "./handlers/projectSummaryHandler";


const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/calculate", calculateHandler);

router.get("/fetch-matching", fetchMatchingHandler);

router.post("/convert-price", convertPriceHandler);

router.get("/round-stats", fetchRoundStatsHandler);

router.get("/project-stats", fetchProjectInRoundStatsHandler);

router.get("/summary/:chainId/:roundId", roundSummaryHandler);

router.get("/summary/:chainId/:roundId/:projectId", projectSummaryHandler);

export default router;
