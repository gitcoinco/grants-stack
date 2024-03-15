import { Round } from "../types";
import { makeRoundData } from "../../../test-utils";
import { ethers } from "ethers";
import { TransactionBuilder } from "common";
import { UpdateAction } from "common/dist/types";

const mockWallet = {
  address: "0x0",
  signer: {
    getChainId: () => {
      return 1;
    },
  },
};

jest.mock("../../../features/common/Auth", () => ({
  useWallet: () => mockWallet,
}));
jest.mock("wagmi");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

describe("TransactionBuilder", () => {
  const round: Round = makeRoundData();

  let transactionBuilder: TransactionBuilder;

  beforeEach(() => {
    transactionBuilder = new TransactionBuilder(round.id!);
  });

  it("should initialize correctly", () => {
    expect(transactionBuilder.roundId).toBe(round.id);
    expect(transactionBuilder.transactions).toEqual([]);
    expect(transactionBuilder.contract).toBeInstanceOf(ethers.Contract);
  });

  it("should add a transaction to the builder", () => {
    const action = UpdateAction.UPDATE_APPLICATION_META_PTR;
    const args = [{ protocol: 1, pointer: "abcd" }];
    transactionBuilder.add(action, args);

    const transactions = transactionBuilder.getTransactions();
    expect(transactions.length).toEqual(1);
  });

  it("should add multiple transactions to the builder", () => {
    const action1 = UpdateAction.UPDATE_APPLICATION_META_PTR;
    const args1 = [{ protocol: 1, pointer: "abcd" }];
    transactionBuilder.add(action1, args1);

    const action2 = UpdateAction.UPDATE_MATCH_AMOUNT;
    const args2 = [1];

    transactionBuilder.add(action2, args2);

    const transactions = transactionBuilder.getTransactions();
    expect(transactions.length).toEqual(2);
  });

  it("should throw an error when the wrong param is provided", () => {
    const action = UpdateAction.UPDATE_APPLICATION_META_PTR;
    const args = ["arg1", "arg2"];

    expect(() => transactionBuilder.add(action, args)).toThrowError();
  });

  it("should throw an error when there are no transactions to generate", async () => {
    expect(() => transactionBuilder.generate()).toThrowError(
      "No transactions added"
    );
  });

  it("should return the transactions", () => {
    const transactions = ["transaction1", "transaction2"];
    transactionBuilder.transactions = transactions;

    const result = transactionBuilder.getTransactions();

    expect(result).toBe(transactions);
  });
});
