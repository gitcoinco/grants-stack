import {
  ProgramCreated as ProgramCreatedEvent
} from "../../generated/Program/ProgramFactory";

import { ProgramImplementation } from  "../../generated/templates";
import { MetaPtr, Program } from "../../generated/schema";
import {
  ProgramImplementation  as ProgramImplementationContract
} from "../../generated/templates/ProgramImplementation/ProgramImplementation";


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

    let metaPtr = new MetaPtr(metaPtrId);

    metaPtr.protocol = programMetaPtr.getProtocol().toI32();
    metaPtr.pointer = programMetaPtr.getPointer().toString();
    metaPtr.save();

    program.metaPtr = metaPtr.id;
  }

  program.save();

  ProgramImplementation.create(programContractAddress)
}

