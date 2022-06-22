import { 
  ProgramCreated as ProgramCreatedEvent
} from "../../generated/Program/ProgramFactory";

import { ProgramImplementation } from  "../../generated/templates";
import { Program } from "../../generated/schema";


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
  }

  program.save();

  ProgramImplementation.create(programContractAddress)
}

