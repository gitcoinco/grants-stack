import { test, assert, newMockEvent, describe, beforeEach, clearStore, afterEach } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleFundsDistributed } from "../../../src/payoutStrategy/merkle/implementation";
import { FundsDistributed as FundsDistributedEvent } from "../../../generated/MerklePayoutStrategyFactory/MerklePayoutStrategyImplementation";
import { Payout, Round, PayoutStrategy } from "../../../generated/schema";
import { generateID } from "../../../src/utils";
import { Bytes } from '@graphprotocol/graph-ts'

let token: Address;
let amount: BigInt;
let voter: Address;
let grantAddress: Address;
let roundAddress: Address;
let projectId: Bytes;

let newVoteEvent: FundsDistributedEvent;

let payoutStrategyAddress: Address;

function createNewFundsDistributedEvent(
  token: Address,
  amount: BigInt,
  voter: Address,
  grantAddress: Address,
  projectId: Bytes,
  roundAddress: Address,
  payoutStrategyAddress: Address
): FundsDistributedEvent {
  const newVoteEvent = changetype<FundsDistributedEvent>(newMockEvent());

  const tokenParam = new ethereum.EventParam("token", ethereum.Value.fromAddress(token));
  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount));
  const voterParam = new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter));
  const grantAddressParam = new ethereum.EventParam("grantAddress", ethereum.Value.fromAddress(grantAddress));
  const projectIdParam = new ethereum.EventParam("projectId",ethereum.Value.fromBytes(projectId));
  const roundAddressParam = new ethereum.EventParam("roundAddress", ethereum.Value.fromAddress(roundAddress));

  newVoteEvent.parameters.push(tokenParam);
  newVoteEvent.parameters.push(amountParam);
  newVoteEvent.parameters.push(voterParam);
  newVoteEvent.parameters.push(grantAddressParam);
  newVoteEvent.parameters.push(projectIdParam);
  newVoteEvent.parameters.push(roundAddressParam);

  newVoteEvent.address = payoutStrategyAddress;

  return newVoteEvent;
}

describe("handleFundsDistributed", () => {

  beforeEach(() => {

    amount = new BigInt(1);
    token = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
    voter = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2B");
    grantAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2D");
    roundAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2E");
    projectId = Bytes.fromHexString("0x72616e646f6d50726f6a6563744964"); // bytes32 projectId

    // Create PayoutStrategy entity
    payoutStrategyAddress = Address.fromString("0xB16081F360e3847006dB660bae1c6d1b2e17eC2A");

    const votingStrategyEntity = new PayoutStrategy(payoutStrategyAddress.toHex());
    votingStrategyEntity.strategyName = "MERKLE";
    votingStrategyEntity.strategyAddress = "0xA16081F360e3847006dB660bae1c6d1b2e17eC2G";
    votingStrategyEntity.version = "0.2.0";
    votingStrategyEntity.save();

    // Create Round entity
    const roundEntity = new Round(roundAddress.toHex());
    roundEntity.program = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2B";
    roundEntity.votingStrategy = votingStrategyEntity.id;
    roundEntity.payoutStrategy = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2C";
    roundEntity.applicationsStartTime = new BigInt(10).toString();
    roundEntity.applicationsEndTime = new BigInt(20).toString();
    roundEntity.roundStartTime = new BigInt(30).toString();
    roundEntity.roundEndTime = new BigInt(40).toString();
    roundEntity.token = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2D";
    roundEntity.roundMetaPtr = "roundMetaPtr";
    roundEntity.applicationMetaPtr = "applicationMetaPtr";

    roundEntity.save();

    // Link PayoutStrategy to Round entity
    votingStrategyEntity.round = roundEntity.id;
    votingStrategyEntity.save();

    newVoteEvent = createNewFundsDistributedEvent(
      token,
      amount,
      voter,
      grantAddress,
      projectId,
      roundAddress,
      payoutStrategyAddress
    );

  })

  afterEach(() => {
    clearStore();
  })

  test("Payout entity is created when handleFundsDistributed is called", () => {

    handleFundsDistributed(newVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex()
    ]);
    newVoteEvent.transaction.hash.toHex();
    const payout = Payout.load(id);
    assert.assertNotNull(payout);

    assert.entityCount("Payout", 1);
    assert.stringEquals(payout!.id, id);
  });

  test("init values are set correctly when handleFundsDistributed is called", () => {

    handleFundsDistributed(newVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex()
    ]);
    const payout = Payout.load(id);

    assert.stringEquals(payout!.votingStrategy, payoutStrategyAddress.toHex());
    assert.stringEquals(payout!.token, token.toHex());
    assert.bigIntEquals(payout!.amount, amount);
    assert.stringEquals(payout!.from, voter.toHex());
    assert.stringEquals(payout!.to, grantAddress.toHex());
    assert.bytesEquals(Bytes.fromHexString(payout!.projectId), projectId);
    assert.stringEquals(payout!.version, "0.2.0");

  });

  test("QF vote is linked to PayoutStrategy when handledVote is called", () => {

    handleFundsDistributed(newVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex()
    ]);
    const payout = Payout.load(id);
    const votingStrategy = PayoutStrategy.load(payout!.votingStrategy);

    assert.assertNotNull(votingStrategy);
  });

  test("created 2 QF votes when 2 when handledVote is called twice", () => {

    const anotherAmount = new BigInt(10);
    const anotherGrantAddress = Address.fromString("0xB16081F360e3847006dB660bae1c6d1b2e17eC2A");

    const anotherVoteEvent =createNewFundsDistributedEvent(
      token,
      anotherAmount,
      voter,
      anotherGrantAddress,
      projectId,
      roundAddress,
      payoutStrategyAddress
    );

    handleFundsDistributed(newVoteEvent);
    handleFundsDistributed(anotherVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex()
    ]);
    assert.assertNotNull(Payout.load(id));

    const anotherId = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex()
    ]);
    assert.assertNotNull(Payout.load(anotherId));
  });

});