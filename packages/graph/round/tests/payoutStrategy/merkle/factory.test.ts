import { test, assert, newMockEvent, describe, beforeEach, clearStore, afterEach, logStore } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handlePayoutContractCreated } from "../../../src/payoutStrategy/merkle/factory";
import { PayoutContractCreated  as PayoutContractCreatedEvent } from "../../../generated/MerklePayoutStrategyFactory/MerklePayoutStrategyFactory";
import { PayoutStrategy } from "../../../generated/schema";

let payoutContractAddress: Address;
let payoutImplementation: Address;
let newPayoutContractEvent: PayoutContractCreatedEvent;


function createNewPayoutContractCreatedEvent(payoutContractAddress: Address, payoutImplementation: Address): PayoutContractCreatedEvent {
  const newPayoutContractEvent = changetype<PayoutContractCreatedEvent>(newMockEvent());

  const payoutContractAddressParam = new ethereum.EventParam("payoutContractAddress", ethereum.Value.fromAddress(payoutContractAddress));
  const payoutImplementationParam = new ethereum.EventParam("payoutImplementation", ethereum.Value.fromAddress(payoutImplementation));

  newPayoutContractEvent.parameters.push(payoutContractAddressParam);
  newPayoutContractEvent.parameters.push(payoutImplementationParam);

  return newPayoutContractEvent;
}

describe("handlePayoutContractCreated", () => {

  beforeEach(() => {

    payoutContractAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
    payoutImplementation = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2B");

    newPayoutContractEvent = createNewPayoutContractCreatedEvent(
      payoutContractAddress,
      payoutImplementation
    );

  })

  afterEach(() => {
    clearStore();
  })

  test("PayoutStrategy entity is created when handlePayoutContractCreated is called", () => {

    handlePayoutContractCreated(newPayoutContractEvent);

    const payoutStrategy = PayoutStrategy.load(payoutContractAddress.toHex())
    assert.assertNotNull(payoutStrategy);
    assert.entityCount("PayoutStrategy", 1);
  
    assert.stringEquals(payoutStrategy!.strategyName, "MERKLE");
    assert.stringEquals(payoutStrategy!.strategyAddress, payoutImplementation.toHex());
    assert.stringEquals(payoutStrategy!.id, payoutContractAddress.toHex());
    assert.stringEquals(payoutStrategy!.version, "0.1.0");
  });
  
});