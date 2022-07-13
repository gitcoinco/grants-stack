import {
  RoundCreated as RoundCreatedEvent
} from "../../generated/Round/RoundFactory"

import { Round } from "../../generated/schema";
import { RoundImplementation } from  "../../generated/templates";
import {
  RoundImplementation  as RoundImplementationContract
} from "../../generated/templates/RoundImplementation/RoundImplementation";

/**
 * @dev Handles indexing on RoundCreatedEvent event.
 * @param event RoundCreatedEvent
 */
export function handleRoundCreated(event: RoundCreatedEvent): void {

  const roundContractAddress = event.params.roundAddress;
  let round = Round.load(roundContractAddress.toHex());

  if (!round) {
    // create if round does not exist
    round = new Round(roundContractAddress.toHex());

    // load round contract
    const roundContract = RoundImplementationContract.bind(roundContractAddress);

    // index global variables
    round.applicationsStartTime = roundContract.applicationsStartTime().toString();
    round.applicationsEndTime = roundContract.applicationsEndTime().toString();
    round.roundStartTime = roundContract.roundStartTime().toString();
    round.roundEndTime = roundContract.roundEndTime().toString();
    round.token = roundContract.token().toHex();

    // set roundMetaPtr

    // set applicationsMetaPtr
  }

  // link round to program
  round.program = event.params.ownedBy.toHex();

  round.save();

  RoundImplementation.create(roundContractAddress);
}

