import {
  ProgramCreated as ProgramCreatedEvent
} from "../../generated/Program/ProgramFactory";

import { ProgramImplementation } from  "../../generated/templates";
import { MetaPtr, Program } from "../../generated/schema";
import {
  ProgramImplementation  as ProgramImplementationContract
} from "../../generated/templates/ProgramImplementation/ProgramImplementation";
import { updateMetaPtr } from "../utils";


/**
 * @dev Handles indexing on ProgramCreated event.
 * @param event ProgramCreatedEvent
 */
export function handleProgramCreated(event: ProgramCreatedEvent): void {

  const programContractAddress = event.params.programContractAddress;
  let program = Program.load(programContractAddress.toHex());

  if (!program) {
    // create if program does not exist
    program = new Program(programContractAddress.toHex());

    // load program contract
    const programContract = ProgramImplementationContract.bind(programContractAddress);

    // set metaPtr
    const metaPtrId = ['metaPtr', programContractAddress.toHex()].join('-');
    let programMetaPtr = programContract.metaPtr();
    let metaPtr = updateMetaPtr(
      metaPtrId,
      programMetaPtr.getProtocol().toI32(),
      programMetaPtr.getPointer().toString()
    );
    program.metaPtr = metaPtr.id;
  }

  program.save();

  ProgramImplementation.create(programContractAddress)
}

