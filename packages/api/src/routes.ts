import {Request, Response, Router} from "express";
import {fetchMatchingHandler} from "./handlers/fetchMatchingHandler";
import {convertPriceHandler} from "./handlers/convertPriceHandler";
import {roundSummaryHandler} from "./handlers/roundSummaryHandler";
import {projectSummaryHandler} from "./handlers/projectSummaryHandler";
import {matchHandler} from "./handlers/matchHandler";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.get("/fetch-matching", fetchMatchingHandler);

router.get("/convert-price/:chainName/:tokenContract", convertPriceHandler);

router.post("/summary/:chainId/:roundId", roundSummaryHandler);

router.post("/summary/:chainId/:roundId/:projectId", projectSummaryHandler);

router.post("/match/:chainId/:roundId", matchHandler);

export default router;
