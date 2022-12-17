import {Request, Response, Router} from "express";
import {calculateHandler} from "./handlers/calculateHandler";
import {fetchMatchingHandler} from "./handlers/fetchMatchingHandler";
import {convertPriceHandler} from "./handlers/convertPriceHandler";
import {roundSummaryHandler} from "./handlers/roundSummaryHandler";
import {projectSummaryHandler} from "./handlers/projectSummaryHandler";
import {matchHandler} from "./handlers/matchHandler";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ test: "it works" });
});

router.post("/calculate", calculateHandler);

router.get("/fetch-matching", fetchMatchingHandler);

router.get("/convert-price/:chainName/:tokenContract", convertPriceHandler);

router.get("/summary/:chainId/:roundId", roundSummaryHandler);

router.get("/summary/:chainId/:roundId/:projectId", projectSummaryHandler);

router.get("/match/:chainId/:roundId", matchHandler);

export default router;
