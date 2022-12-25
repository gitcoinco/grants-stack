import NodeCache from "node-cache";

const TIME_TO_LIVE = 60 * 10; // 10 minutes
const CHECK_PERIOD = 60 * 10; // 10 minutes

export const cache = new NodeCache({
  stdTTL: TIME_TO_LIVE,
  checkperiod: CHECK_PERIOD,
});
