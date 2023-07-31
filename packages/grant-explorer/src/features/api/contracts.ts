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

export const multiRoundCheckoutContract = {
  abi: abi.multiRoundCheckout,
  address: "0x4268900E904aD87903De593AA5424406066d9ea2",
};
