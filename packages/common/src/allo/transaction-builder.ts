import { BigNumber, Contract, ethers } from "ethers";
import roundImplementationContract from "./abis/allo-v1/RoundImplementation";
import { UpdateAction } from "../types";
import { TransactionData } from "@allo-team/allo-v2-sdk";
import { AnyJson } from "..";

export class TransactionBuilder {
  roundId: string;
  transactions: string[];
  contract: Contract;

  constructor(roundId: string) {
    this.roundId = roundId;
    this.transactions = [];
    try {
      this.contract = new ethers.Contract(roundId, roundImplementationContract);
    } catch (e) {
      throw new Error("Invalid roundId");
    }
  }

  add(
    action: UpdateAction,
    args: Array<number | string | `0x${string}` | bigint | AnyJson | BigNumber>
  ) {
    this.transactions.push(
      this.contract.interface.encodeFunctionData(action, args)
    );
  }

  generate(): TransactionData {
    if (this.transactions.length === 0) {
      throw new Error("No transactions added");
    }

    const data = this.contract.interface.encodeFunctionData("multicall", [
      this.transactions,
    ]);

    return {
      to: this.contract.address as `0x${string}`,
      data: data as `0x${string}`,
      value: "0",
    };
  }

  getTransactions() {
    return this.transactions;
  }
}
