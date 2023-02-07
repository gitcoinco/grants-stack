import { test, assert, newMockEvent , createMockedFunction, describe, beforeEach, clearStore, afterEach, logStore } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleProgramCreated } from "../../src/program/factory";
import { ProgramCreated  as ProgramCreatedEvent } from "../../generated/Program/ProgramFactory";
import { MetaPtr, Program } from "../../generated/schema";

let programContractAddress: Address;
let programImplementation: Address;
let newProgramEvent: ProgramCreatedEvent;

let protocol: BigInt;
let pointer: string;

function createNewProgramCreatedEvent(programContractAddress: Address, programImplementation: Address): ProgramCreatedEvent {
  const newProgramEvent = changetype<ProgramCreatedEvent>(newMockEvent());

  const programContractAddressParam = new ethereum.EventParam("programContractAddress", ethereum.Value.fromAddress(programContractAddress));
  const programImplementationParam = new ethereum.EventParam("programImplementation", ethereum.Value.fromAddress(programImplementation));

  newProgramEvent.parameters.push(programContractAddressParam);
  newProgramEvent.parameters.push(programImplementationParam);

  return newProgramEvent;
}

describe("handleProgramCreated", () => {

  beforeEach(() => {

    programContractAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
    programImplementation = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2B");
    protocol = new BigInt(1);
    pointer = "randomIPFSHash";

    createMockedFunction(
      programContractAddress,
      "metaPtr",
      "metaPtr():(uint256,string)"
    ).returns([
      ethereum.Value.fromUnsignedBigInt(protocol),
      ethereum.Value.fromString(pointer)
    ]);

    newProgramEvent = createNewProgramCreatedEvent(
      programContractAddress,
      programImplementation
    );

  })

  afterEach(() => {
    clearStore();
  })

  test("program entity is created when handleProgramCreated is called", () => {

    handleProgramCreated(newProgramEvent);

    const program = Program.load(programContractAddress.toHex())
    assert.assertNotNull(program);

    assert.entityCount("Program", 1);
    assert.fieldEquals("Program", programContractAddress.toHex(), "id", programContractAddress.toHex());
  });

  test("MetaPtr entity is created when handleProgramCreated is called ", () => {
    handleProgramCreated(newProgramEvent);

    const metaPtrId = `metaPtr-${programContractAddress.toHex()}`

    const metaPtr = MetaPtr.load(metaPtrId);
    assert.assertNotNull(metaPtr);

    assert.stringEquals(metaPtr!.protocol.toString(), protocol.toString());
    assert.stringEquals(metaPtr!.pointer!, pointer);
  });


  test("MetaPtr entity is linked to Program entity when handleProgramCreated is called", () => {
    handleProgramCreated(newProgramEvent);

    const program = Program.load(programContractAddress.toHex())
    const metaPtr = MetaPtr.load(program!.metaPtr);

    assert.assertNotNull(program);
    assert.assertNotNull(metaPtr);

    assert.entityCount("MetaPtr", 1);
    assert.stringEquals(metaPtr!.protocol.toString(), protocol.toString());
    assert.stringEquals(metaPtr!.pointer!, pointer);
  });

});