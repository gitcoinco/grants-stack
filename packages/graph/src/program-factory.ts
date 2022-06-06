import { 
  ProgramCreated as ProgramCreatedEvent
} from "../generated/Program/ProgramFactory";


import {
  ProgramImplementation
} from  "../generated/templates";

import { Program} from "../generated/schema";


export function handleProgramCreated(event: ProgramCreatedEvent): void {

  const programContractAddress = event.params.programContractAddress;
  let program = Program.load(programContractAddress.toHex());

  program = new Program(programContractAddress.toHex());

  if (!program) {
    // create if program does not exist
    program = new Program(programContractAddress.toHex());
  }

  program.save();

  ProgramImplementation.create(programContractAddress)
}

