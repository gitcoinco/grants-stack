import {
  RoundCreated as RoundCreatedEvent
} from "../../generated/Round/RoundFactory"

import { MetaPtr, Round } from "../../generated/schema";
import { RoundImplementation } from  "../../generated/templates";
import {
  RoundImplementation  as RoundImplementationContract
} from "../../generated/templates/RoundImplementation/RoundImplementation";
import { updateMetaPtr } from "../utils";

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
    round.votingStrategy = roundContract.votingStrategy().toHex();
    round.applicationsStartTime = roundContract.applicationsStartTime().toString();
    round.applicationsEndTime = roundContract.applicationsEndTime().toString();
    round.roundStartTime = roundContract.roundStartTime().toString();
    round.roundEndTime = roundContract.roundEndTime().toString();
    round.token = roundContract.token().toHex();

    // set roundMetaPtr
    const roundMetaPtrId = ['roundMetaPtr', roundContractAddress.toHex()].join('-');
    let roundMetaPtr = roundContract.roundMetaPtr();
    let metaPtr = updateMetaPtr(
      roundMetaPtrId,
      roundMetaPtr.getProtocol().toI32(),
      roundMetaPtr.getPointer().toString()
    );
    round.roundMetaPtr = metaPtr.id;


    // set applicationsMetaPtr
    const applicationsMetaPtrId = ['applicationsMetaPtr', roundContractAddress.toHex()].join('-');
    let applicationsMetaPtr = roundContract.applicationMetaPtr();
    metaPtr = updateMetaPtr(
      applicationsMetaPtrId,
      applicationsMetaPtr.getProtocol().toI32(),
      applicationsMetaPtr.getPointer().toString()
    );
    round.applicationMetaPtr = metaPtr.id;

  }

  // link round to program
  round.program = event.params.ownedBy.toHex();

  round.save();

  RoundImplementation.create(roundContractAddress);
}