import { Round } from "data-layer";
import { ethers } from "ethers";
import roundImplementationContract from "./abis/allo-v1/RoundImplementation";

export class TransactionBuilder {
  round: Round;
  transactions: any[];
  contract: any;

  constructor(round: Round) {
    this.round = round;
    this.transactions = [];
    if (round.id) {
      this.contract = new ethers.Contract(
        round.id,
        roundImplementationContract
      );
    } else {
      throw new Error("Round ID is undefined");
    }
  }

  add(action: any, args: any[]) {
    this.transactions.push(
      this.contract.interface.encodeFunctionData(action, args)
    );
  }

  // async execute(): Promise<TransactionResponse> {
  //   if (this.transactions.length === 0) {
  //     throw new Error("No transactions to execute");
  //   }
  //   return await this.contract.multicall(this.transactions);
  // }

  generate() {
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
