import {Request, Response, Router} from "express";
import {roundSummaryHandler} from "./handlers/roundSummaryHandler";
import {projectSummaryHandler} from "./handlers/projectSummaryHandler";
import {matchHandler} from "./handlers/matchHandler";
import {getProjectMatchDataHandler} from "./handlers/getProjectMatchDataHandler";
import {cacheMiddleware} from "./middleware/cacheMiddleware";
import {getRoundMatchDataHandler} from "./handlers/getRoundMatchDataHandler";
import {getProjectSummaryDataHandler} from "./handlers/getProjectSummaryDataHandler";
import {getRoundSummaryDataHandler} from "./handlers/getRoundSummaryDataHandler";

const router = Router();

router.use(cacheMiddleware);

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/update/round/summary/:chainId/:roundId", roundSummaryHandler);
router.post("/update/project/summary/:chainId/:roundId/:projectId", projectSummaryHandler);
router.post("/update/round/match/:chainId/:roundId", matchHandler);

router.get("/data/project/match/:chainId/:roundId/:projectId", getProjectMatchDataHandler);
router.get("/data/round/match/:chainId/:roundId", getRoundMatchDataHandler);
router.get("/data/project/summary/:chainId/:roundId/:projectId", getProjectSummaryDataHandler);
router.get("/data/round/summary/:chainId/:roundId", getRoundSummaryDataHandler);

export default router;
