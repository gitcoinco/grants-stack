import { ethers } from "ethers";
import roundImplementationContract from "./abis/allo-v1/RoundImplementation";

export class TransactionBuilder {
  roundId: string;
  transactions: any[];
  contract: any;

  constructor(roundId: string) {
    this.roundId = roundId;
    this.transactions = [];
    try {
      this.contract = new ethers.Contract(roundId, roundImplementationContract);
    } catch (e) {
      throw new Error("Invalid roundId");
    }
  }

  add(action: any, args: any[]) {
    this.transactions.push(
      this.contract.interface.encodeFunctionData(action, args)
    );
  }

  generate() {
    if (this.transactions.length === 0) {
      throw new Error("No transactions added");
    }

    const data = this.contract.interface.encodeFunctionData("multicall", [
      this.transactions,
    ]);

    return {
      to: this.contract.address,
      data,
      value: 0n,
    };
  }

  getTransactions() {
    return this.transactions;
  }
}
