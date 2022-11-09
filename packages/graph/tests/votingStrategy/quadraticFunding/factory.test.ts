import { test, assert, newMockEvent, describe, beforeEach, clearStore, afterEach, logStore } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleVotingContractCreated } from "../../../src/votingStrategy/quadraticFunding/factory";
import { VotingContractCreated  as VotingContractCreatedEvent } from "../../../generated/QuadraticFundingVotingStrategy/QuadraticFundingVotingStrategyFactory";
import { VotingStrategy } from "../../../generated/schema";

let votingContractAddress: Address;
let votingImplementation: Address;
let newProgramEvent: VotingContractCreatedEvent;


function createNewVotingContractCreatedEvent(votingContractAddress: Address, votingImplementation: Address): VotingContractCreatedEvent {
  const newProgramEvent = changetype<VotingContractCreatedEvent>(newMockEvent());

  const votingContractAddressParam = new ethereum.EventParam("votingContractAddress", ethereum.Value.fromAddress(votingContractAddress));
  const votingImplementationParam = new ethereum.EventParam("votingImplementation", ethereum.Value.fromAddress(votingImplementation));

  newProgramEvent.parameters.push(votingContractAddressParam);
  newProgramEvent.parameters.push(votingImplementationParam);

  return newProgramEvent;
}

describe("handleVotingContractCreated", () => {

  beforeEach(() => {

    votingContractAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
    votingImplementation = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2B");

    newProgramEvent = createNewVotingContractCreatedEvent(
      votingContractAddress,
      votingImplementation
    );

  })

  afterEach(() => {
    clearStore();
  })

  test("VotingStrategy entity is created when handleVotingContractCreated is called", () => {

    handleVotingContractCreated(newProgramEvent);

    const votingStrategy = VotingStrategy.load(votingContractAddress.toHex())
    assert.assertNotNull(votingStrategy);
    assert.entityCount("VotingStrategy", 1);
  
    assert.stringEquals(votingStrategy!.strategyName, "quadraticFunding");
    assert.stringEquals(votingStrategy!.strategyAddress, votingImplementation.toHex());
    assert.stringEquals(votingStrategy!.id, votingContractAddress.toHex());
  });
  
});