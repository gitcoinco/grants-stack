import { test, assert, newMockEvent, describe, beforeEach, clearStore, afterEach } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleFundsDistributed } from "../../../src/payoutStrategy/merkle/implementation";
import { FundsDistributed as FundsDistributedEvent } from "../../../generated/MerklePayoutStrategyFactory/MerklePayoutStrategyImplementation";
import { Payout, Round, PayoutStrategy, VotingStrategy } from "../../../generated/schema";
import { generateID } from "../../../src/utils";
import { Bytes } from '@graphprotocol/graph-ts'

let amount: BigInt;
let grantee: Address;
let token: Address;
let projectId: Bytes;
let roundAddress: Address;

let newFundsDistributedEvent: FundsDistributedEvent;

let payoutStrategyAddress: Address;

function createNewFundsDistributedEvent(
  amount: BigInt,
  grantee: Address,
  token: Address,
  projectId: Bytes,
): FundsDistributedEvent {
  const newFundsDistributedEvent = changetype<FundsDistributedEvent>(newMockEvent());

  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount));
  const granteeParam = new ethereum.EventParam("grantee", ethereum.Value.fromAddress(grantee));
  const tokenParam = new ethereum.EventParam("token", ethereum.Value.fromAddress(token));
  const projectIdParam = new ethereum.EventParam("projectId",ethereum.Value.fromBytes(projectId));

  newFundsDistributedEvent.parameters.push(amountParam);
  newFundsDistributedEvent.parameters.push(granteeParam);
  newFundsDistributedEvent.parameters.push(tokenParam);
  newFundsDistributedEvent.parameters.push(projectIdParam);

  newFundsDistributedEvent.address = payoutStrategyAddress;

  return newFundsDistributedEvent;
}

describe("handleFundsDistributed", () => {

  beforeEach(() => {

    amount = new BigInt(1);
    grantee = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2B");
    token = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
    projectId = Bytes.fromHexString("0x72616e646f6d50726f6a6563744964"); // bytes32 projectId

    roundAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2E");

    // Create PayoutStrategy entity
    payoutStrategyAddress = Address.fromString("0xB16081F360e3847006dB660bae1c6d1b2e17eC2A");

    const payoutStrategyEntity = new PayoutStrategy(payoutStrategyAddress.toHex());
    payoutStrategyEntity.strategyName = "MERKLE";
    payoutStrategyEntity.strategyAddress = "0xA16081F360e3847006dB660bae1c6d1b2e17eC2G";
    payoutStrategyEntity.version = "0.2.0";
    payoutStrategyEntity.save();


    // Create VotingStrategy entity
    let votingStrategy = Address.fromString("0xB16081F360e3847006dB660bae1c6d1b2e17eC2C");
    let votingStrategyEntity = new VotingStrategy(votingStrategy.toHex());
    votingStrategyEntity.strategyName = "LINEAR_QUADRATIC_FUNDING";
    votingStrategyEntity.strategyAddress = "0xA16081F360e3847006dB660bae1c6d1b2e17eC2G";
    votingStrategyEntity.version = "0.1.0";
    votingStrategyEntity.save();


    // Create Round entity
    const roundEntity = new Round(roundAddress.toHex());
    roundEntity.program = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2B";
    roundEntity.votingStrategy = votingStrategyEntity.id;
    roundEntity.payoutStrategy = payoutStrategyEntity.id;
    roundEntity.applicationsStartTime = new BigInt(10).toString();
    roundEntity.applicationsEndTime = new BigInt(20).toString();
    roundEntity.roundStartTime = new BigInt(30).toString();
    roundEntity.roundEndTime = new BigInt(40).toString();
    roundEntity.token = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2D";
    roundEntity.roundMetaPtr = "roundMetaPtr";
    roundEntity.applicationMetaPtr = "applicationMetaPtr";
    roundEntity.createdAt = new BigInt(50);
    roundEntity.updatedAt = new BigInt(60);
    roundEntity.version = "1.0.0";

    roundEntity.save();

    // Link PayoutStrategy to Round entity
    payoutStrategyEntity.round = roundEntity.id;
    payoutStrategyEntity.save();

    newFundsDistributedEvent = createNewFundsDistributedEvent(
      amount,
      grantee,
      token,
      projectId
    );

  })

  afterEach(() => {
    clearStore();
  })

  test("Payout entity is created when handleFundsDistributed is called", () => {

    handleFundsDistributed(newFundsDistributedEvent);

    const id = generateID([
      newFundsDistributedEvent.transaction.hash.toHex(),
      projectId.toHex()
    ]);
    newFundsDistributedEvent.transaction.hash.toHex();
    const payout = Payout.load(id);
    assert.assertNotNull(payout);

    assert.entityCount("Payout", 1);
    assert.stringEquals(payout!.id, id);
  });

  test("init values are set correctly when handleFundsDistributed is called", () => {

    handleFundsDistributed(newFundsDistributedEvent);

    const id = generateID([
      newFundsDistributedEvent.transaction.hash.toHex(),
      projectId.toHex()
    ]);
    const payout = Payout.load(id);

    assert.stringEquals(payout!.payoutStrategy, payoutStrategyAddress.toHex());
    assert.bigIntEquals(payout!.amount, amount);
    assert.stringEquals(payout!.token, token.toHex());
    assert.stringEquals(payout!.grantee, grantee.toHex());
    assert.bytesEquals(Bytes.fromHexString(payout!.projectId), projectId);
    assert.stringEquals(payout!.version, "0.1.0");

  });

  test("Payout is linked to PayoutStrategy when handleFundsDistributed is called", () => {

    handleFundsDistributed(newFundsDistributedEvent);

    const id = generateID([
      newFundsDistributedEvent.transaction.hash.toHex(),
      projectId.toHex()
    ]);
    const payout = Payout.load(id);
    const payoutStrategy = PayoutStrategy.load(payout!.payoutStrategy);

    assert.assertNotNull(payoutStrategy);
  });

  test("created 2 Payout when 2 when handleFundsDistributed is called twice", () => {

    const anotherAmount = new BigInt(10);
    const anotherProjectId = Bytes.fromHexString("0x72616e646f6d50726f6a6563744964"); // bytes32 projectId

    const anotherNewFundsDistributedEvent = createNewFundsDistributedEvent(
      anotherAmount,
      grantee,
      token,
      anotherProjectId
    );

    handleFundsDistributed(newFundsDistributedEvent);
    handleFundsDistributed(anotherNewFundsDistributedEvent);

    const id = generateID([
      newFundsDistributedEvent.transaction.hash.toHex(),
      projectId.toHex()
    ]);
    assert.assertNotNull(Payout.load(id));

    const anotherId = generateID([
      newFundsDistributedEvent.transaction.hash.toHex(),
      anotherProjectId.toHex()
    ]);
    assert.assertNotNull(Payout.load(anotherId));
  });

});