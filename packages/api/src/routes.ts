import {Request, Response, Router} from "express";
import {updateRoundSummaryHandler} from "./handlers/updateRoundSummaryHandler";
import {updateProjectSummaryHandler} from "./handlers/updateProjectSummaryHandler";
import {updateRoundMatchHandler} from "./handlers/updateRoundMatchHandler";
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

router.post("/update/summary/round/:chainId/:roundId", updateRoundSummaryHandler);
router.post("/update/summary/project/:chainId/:roundId/:projectId", updateProjectSummaryHandler);
router.post("/update/match/round/:chainId/:roundId", updateRoundMatchHandler);

router.get("/data/match/project/:chainId/:roundId/:projectId", getProjectMatchDataHandler);
router.get("/data/match/round/:chainId/:roundId", getRoundMatchDataHandler);
router.get("/data/summary/project/:chainId/:roundId/:projectId", getProjectSummaryDataHandler);
router.get("/data/summary/round/:chainId/:roundId", getRoundSummaryDataHandler);

export default router;
