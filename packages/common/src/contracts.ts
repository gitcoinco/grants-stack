import roundImplementation from "./abi/roundImplementation";
import merklePayoutStrategyImplementation from "./abi/merklePayoutStrategyImplementation";

/* RoundImplementation */
const abi = {
  roundImplementation,
  merklePayoutStrategyImplementation,
};


/** Base Contract interface */
export interface Contract {
  /**
   * Contract address
   */
  address?: string;
  /**
   * Contract ABI in Human Readable ABI format
   */
  abi: Array<string>;
  /**
   * Contract ABI in binary format
   */
  bytecode?: string;
}

export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation,
};
/* MerklePayoutStrategyImplementation */
export const merklePayoutStrategyImplementationContract: Contract = {
  abi: abi.merklePayoutStrategyImplementation,
};
