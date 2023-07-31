import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { handleTransaction } from "common/src/transactions";
import { multiRoundCheckoutContract } from "./contracts";
import { signERC2612Permit } from "eth-permit";
import { zeroAddress } from "viem";
import { getPayoutTokenOptions } from "./utils";
import { PayoutToken } from "./types";
import { PermitSignature } from "../../context/QFDonationContext";

export const voteUsingMRCContract = async (
  signer: Signer,
  token: PayoutToken,
  groupedVotes: Record<string, BytesLike[]>,
  groupedAmounts: Record<string, BigNumber>,
  nativeTokenAmount: BigNumber,
  permitSignature?: PermitSignature
): Promise<{ txBlockNumber: number; txHash: string }> => {
  const mrcImplementation = new ethers.Contract(
    multiRoundCheckoutContract.address as string,
    multiRoundCheckoutContract.abi,
    signer
  );

  let tx;

  /* decide which function to use based on whether token is native, permit-compatible or DAI */
  if (token.address === zeroAddress) {
    tx = await mrcImplementation.vote(
      Object.values(groupedVotes),
      Object.keys(groupedVotes),
      Object.values(groupedAmounts),
      {
        value: nativeTokenAmount,
      }
    );
  } else if (permitSignature) {
    /* Is token DAI? */
    if (/DAI/i.test(token.name)) {
      /*TODO: DAI Handling*/
    } else {
      tx = await mrcImplementation.voteERC20Permit(
        Object.values(groupedVotes),
        Object.keys(groupedVotes),
        Object.values(groupedAmounts),
        Object.values(groupedAmounts).reduce((acc, b) => acc.add(b)),
        token.address,
        permitSignature.v,
        permitSignature.r,
        permitSignature?.s
      );
    }
  } else {
    /* Tried voting using erc-20 but no permit signature provided */
    throw new Error(
      "Tried voting using erc-20 but no permit signature provided"
    );
  }

  const result = await handleTransaction(tx);

  if (result.error) {
    // handle error case
    throw new Error(result.error);
  } else {
    console.log("✅ Transaction hash: ", result.txHash);

    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      txBlockNumber: result.txBlockNumber!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      txHash: result.txHash!,
    };
  }
};

export async function signPermit(
  signer: Signer,
  token: PayoutToken,
  amount: number,
  deadline: number
) {
  const address = await signer.getAddress();
  return signPermit2612(
    signer,
    token,
    "Test",
    address,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    multiRoundCheckoutContract.address!,
    amount,
    deadline
  );
}

export async function signPermit2612(
  signer: Signer,
  token: PayoutToken,
  erc20Name: string,
  owner: string,
  spender: string,
  value: number,
  deadline: number
) {
  const { v, r, s } = await signERC2612Permit(
    signer,
    token.address,
    owner,
    spender,
    value,
    deadline
  );

  return { v, r, s, deadline };
}

export function signPermitDAI() {
  /*TODO*/
}
