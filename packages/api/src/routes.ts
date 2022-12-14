import {Request, Response, Router} from "express";
import {calculateHandler} from "./handlers/calculateHandler";
import {fetchMatchingHandler} from "./handlers/fetchMatchingHandler";
import {convertPriceHandler} from "./handlers/convertPriceHandler";
import {fetchRoundStatsHandler} from "./handlers/fetchRoundStatsHandler";
import {
  fetchProjectInRoundStatsHandler,
} from "./handlers/fetchProjectInRoundStatsHandler";
import {summaryHandler} from "./handlers/summaryHandler";


const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/calculate", calculateHandler);

router.get("/fetch-matching", fetchMatchingHandler);

router.post("/convert-price", convertPriceHandler);

router.get("/round-stats", fetchRoundStatsHandler); 

router.get("/project-stats", fetchProjectInRoundStatsHandler);

router.get("/summary/:chainId/:roundId", summaryHandler);

export default router;
