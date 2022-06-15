import {
  RoundCreated as RoundCreatedEvent
} from "../../generated/Round/RoundFactory"

import { Round, Program } from "../../generated/schema";
import { RoundImplementation } from  "../../generated/templates";

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
  }

  // link round to program
  const program = Program.load(event.params.ownedBy.toHex());
  if (program) {
    round.program = program.id;
  }

  round.save();

  RoundImplementation.create(roundContractAddress);
}

