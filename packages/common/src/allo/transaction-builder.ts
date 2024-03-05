import { ethers } from "ethers";
import roundImplementationContract from "./abis/allo-v1/RoundImplementation";

export class TransactionBuilder {
  roundId: string;
  transactions: any[];
  contract: any;

  constructor(roundId: string) {
    this.roundId = roundId;
    this.transactions = [];
    this.contract = new ethers.Contract(
      roundId,
      roundImplementationContract
    )
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
