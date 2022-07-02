import { clearStore, test, assert, newMockEvent } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { Program } from "../../generated/schema";
import { handleProgramCreated } from "../../src/program/factory";
import { ProgramCreated  as ProgramCreatedEvent } from "../../generated/Program/ProgramFactory";

let PROGRAM_ENTITY_TYPE = "Program"


function createNewProgramCreatedEvent(programContractAddress: Address) {
  let addressParam = new ethereum.EventParam("programContractAddress", ethereum.Value.fromAddress(programContractAddress));

  let event = <ProgramCreatedEvent>(newMockEvent())
  event.parameters.push(addressParam)
  return event;
}

export function runTests(): void {
  test("Create Program", () => {

    let addressString = "0xA16081F360e3847006dB660bae1c6d1b2e17eC2A"
    let address = Address.fromString(addressString)

    assert.assertNull(Program.load(address.toHexString()))

    let event = createNewProgramCreatedEvent(address);

    handleProgramCreated(event);

    let program = Program.load(address.toHexString())
    assert.assertNotNull(program)

    clearStore();
  });
}