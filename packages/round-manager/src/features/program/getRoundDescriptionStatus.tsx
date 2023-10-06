import { Round } from "../api/types";
import moment from "moment";

type RoundDescriptionParams = Partial<Round> & {
  roundStartTime: Date;
  roundEndTime: Date;
  applicationsStartTime: Date;
  applicationsEndTime: Date;
};

export function getRoundDescriptionStatus(round: RoundDescriptionParams) {
  const now = moment();

  if (now.isAfter(round.roundEndTime)) {
    return "Round ended";
  }

  if (now.isBetween(round.roundStartTime, round.roundEndTime)) {
    return "Round in progress";
  }

  if (now.isAfter(round.applicationsEndTime)) {
    return "Applications ended";
  }

  if (
    now.isBetween(round.applicationsStartTime, round.applicationsEndTime || now)
  ) {
    return "Applications in progress";
  }

  return "Applications not started";
}
