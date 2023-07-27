import abi from "./abi";
import { Contract } from "./types";

/* ERC20 */
export const ERC20Contract: Contract = {
  abi: abi.erc20,
};

/* RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation,
};

export const multiRoundCheckoutContract: Contract = {
  abi: abi.multiRoundCheckout,
  /*TODO: this is for goerli, but we can use create2 to have the same address on all chains */
  address: "0x521Bb00DA4273E1882D2FB690388caD81bDD5E55",
};
