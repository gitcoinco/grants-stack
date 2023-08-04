import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { handleTransaction } from "common/src/transactions";
import { MRC_CONTRACTS } from "./contracts";
import { Hex, hexToNumber, slice, zeroAddress } from "viem";
import { PayoutToken } from "./types";
import mrcAbi from "./abi/multiRoundCheckout";
import { ChainId } from "common";
import { JsonRpcSigner } from "@ethersproject/providers";

export type PermitSignature = {
  v: number;
  r: string;
  s: string;
};

export const voteUsingMRCContract = async (
  signer: Signer,
  token: PayoutToken,
  groupedVotes: Record<string, BytesLike[]>,
  groupedAmounts: Record<string, BigNumber>,
  nativeTokenAmount: BigNumber,
  permitSignature?: PermitSignature,
  deadline?: number,
  nonce?: BigNumber
): Promise<{ txBlockNumber: number; txHash: string }> => {
  const mrcImplementation = new ethers.Contract(
    MRC_CONTRACTS[(await signer.getChainId()) as ChainId],
    mrcAbi,
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
      tx = await mrcImplementation.voteDAIPermit(
        Object.values(groupedVotes),
        Object.keys(groupedVotes),
        Object.values(groupedAmounts),
        Object.values(groupedAmounts).reduce((acc, b) => acc.add(b)),
        token.address,
        deadline,
        nonce,
        permitSignature.v,
        permitSignature.r,
        permitSignature.s
      );
    } else {
      debugger;
      tx = await mrcImplementation.voteERC20Permit(
        Object.values(groupedVotes),
        Object.keys(groupedVotes),
        Object.values(groupedAmounts),
        Object.values(groupedAmounts).reduce((acc, b) => acc.add(b)),
        token.address,
        deadline,
        permitSignature.v,
        permitSignature.r,
        permitSignature.s
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

type SignPermitProps = {
  signer: JsonRpcSigner;
  contractAddress: string;
  erc20Name: string;
  owner: string;
  spender: string;
  deadline: number;
  chainId: number;
};

type Eip2612Props = SignPermitProps & {
  value: BigNumber;
  nonce: BigNumber;
};

type DaiPermit = SignPermitProps & {
  nonce: BigNumber;
};

/* Signs a permit for EIP-2612-compatible ERC-20 tokens */
export const signPermit2612 = async ({
  signer,
  contractAddress,
  erc20Name,
  owner,
  spender,
  value,
  deadline,
  nonce,
  chainId,
}: Eip2612Props) => {
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const domainData = {
    name: erc20Name,
    version: "2",
    chainId: chainId,
    verifyingContract: contractAddress,
  };

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  const signature = (await signer._signTypedData(
    domainData,
    types,
    message
  )) as Hex;
  debugger;
  const [r, s, v] = [
    slice(signature, 0, 32),
    slice(signature, 32, 64),
    slice(signature, 64, 65),
  ];
  return { r, s, v: hexToNumber(v) };
};

export const signPermitDai = async ({
  signer,
  contractAddress,
  erc20Name,
  owner,
  spender,
  deadline,
  nonce,
  chainId,
}: DaiPermit) => {
  const types = {
    Permit: [
      { name: "holder", type: "address" },
      { name: "spender", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "allowed", type: "bool" },
    ],
  };

  const domainData = {
    name: erc20Name,
    version: "1",
    chainId: chainId,
    verifyingContract: contractAddress,
  };

  const message = {
    holder: owner,
    spender,
    nonce,
    expiry: deadline,
    allowed: true,
  };

  const signature = (await signer._signTypedData(
    domainData,
    types,
    message
  )) as Hex;
  const [r, s, v] = [
    slice(signature, 0, 32),
    slice(signature, 32, 64),
    slice(signature, 64, 65),
  ];
  return { r, s, v: hexToNumber(v) };
};
