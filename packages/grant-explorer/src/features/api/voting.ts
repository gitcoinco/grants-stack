import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { handleTransaction } from "common/src/transactions";
import { multiRoundCheckoutContract } from "./contracts";
import { signERC2612Permit } from "eth-permit";
import { zeroAddress } from "viem";

export const voteOnRoundContract = async (
  signer: Signer,
  token: string,
  groupedVotes: Record<string, BytesLike[]>,
  groupedAmounts: Record<string, BigNumber>,
  nativeTokenAmount: BigNumber
): Promise<{ txBlockNumber: number; txHash: string }> => {
  const mrcImplementation = new ethers.Contract(
    multiRoundCheckoutContract.address as string,
    multiRoundCheckoutContract.abi,
    signer
  );

  let tx;

  /* decide which function to use based on whether token is native, permit-compatible or DAI */
  if (token === zeroAddress) {
    tx = await mrcImplementation.vote(
      Object.values(groupedVotes),
      Object.keys(groupedVotes),
      Object.values(groupedAmounts),
      {
        value: nativeTokenAmount,
      }
    );
  } else {
    /* Is token DAI? */
    if (token in [""] /*TODO: DAi addresses*/) {
      /*DAI Handling*/
    } else {
      /* TODO: Verify token supports permit */
    }
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
  tokenAddress: string,
  amount: number,
  deadline: number
) {
  const address = await signer.getAddress();
  return signPermit2612(
    signer,
    tokenAddress,
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
  tokenAddress: string,
  erc20Name: string,
  owner: string,
  spender: string,
  value: number,
  deadline: number
) {
  const { v, r, s } = await signERC2612Permit(
    signer,
    tokenAddress,
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
