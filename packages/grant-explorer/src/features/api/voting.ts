import { MRC_CONTRACTS } from "./contracts";
import { Hex, hexToNumber, slice, zeroAddress } from "viem";
import { PayoutToken } from "./types";
import mrcAbi from "./abi/multiRoundCheckout";
import { ChainId } from "common";
import { WalletClient } from "wagmi";
import { getContract, PublicClient } from "@wagmi/core";

export type PermitSignature = {
  v: number;
  r: string;
  s: string;
};

export const voteUsingMRCContract = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  token: PayoutToken,
  groupedVotes: Record<string, Hex[]>,
  groupedAmounts: Record<string, bigint>,
  nativeTokenAmount: bigint,
  permitSignature?: PermitSignature,
  deadline?: number,
  nonce?: bigint
) => {
  const mrcImplementation = getContract({
    address: MRC_CONTRACTS[(await walletClient.getChainId()) as ChainId],
    abi: mrcAbi,
    walletClient: walletClient,
  });

  let tx;

  /* decide which function to use based on whether token is native, permit-compatible or DAI */
  if (token.address === zeroAddress) {
    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: mrcImplementation.address,
      abi: mrcAbi,
      functionName: "vote",
      args: [
        Object.values(groupedVotes),
        Object.keys(groupedVotes) as Hex[],
        Object.values(groupedAmounts),
      ],
      value: nativeTokenAmount,
    });

    tx = await walletClient.writeContract(request);
  } else if (permitSignature && nonce) {
    /* Is token DAI? */
    if (/DAI/i.test(token.name)) {
      tx = await mrcImplementation.write.voteDAIPermit([
        Object.values(groupedVotes),
        Object.keys(groupedVotes) as Hex[],
        Object.values(groupedAmounts),
        Object.values(groupedAmounts).reduce((acc, b) => acc + b),
        token.address as Hex,
        BigInt(deadline ?? Number.MAX_SAFE_INTEGER),
        nonce,
        permitSignature.v,
        permitSignature.r as Hex,
        permitSignature.s as Hex,
      ]);
    } else {
      tx = await mrcImplementation.write.voteERC20Permit([
        Object.values(groupedVotes),
        Object.keys(groupedVotes) as Hex[],
        Object.values(groupedAmounts),
        Object.values(groupedAmounts).reduce((acc, b) => acc + b),
        token.address as Hex,
        BigInt(deadline ?? Number.MAX_SAFE_INTEGER),
        permitSignature.v,
        permitSignature.r as Hex,
        permitSignature.s as Hex,
      ]);
    }
  } else {
    /* Tried voting using erc-20 but no permit signature provided */
    throw new Error(
      "Tried voting using erc-20 but no permit signature provided"
    );
  }

  return publicClient.waitForTransactionReceipt({
    hash: tx,
  });
};

type SignPermitProps = {
  walletClient: WalletClient;
  contractAddress: Hex;
  erc20Name: string;
  owner: Hex;
  spender: Hex;
  deadline: bigint;
  chainId: number;
};

type Eip2612Props = SignPermitProps & {
  value: bigint;
  nonce: bigint;
};

type DaiPermit = SignPermitProps & {
  nonce: bigint;
};

/* Signs a permit for EIP-2612-compatible ERC-20 tokens */
export const signPermit2612 = async ({
  walletClient,
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

  const signature = await walletClient.signTypedData({
    account: owner,
    message,
    domain: domainData,
    primaryType: "Permit",
    types,
  });
  const [r, s, v] = [
    slice(signature, 0, 32),
    slice(signature, 32, 64),
    slice(signature, 64, 65),
  ];
  return { r, s, v: hexToNumber(v) };
};

export const signPermitDai = async ({
  walletClient,
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

  const signature = await walletClient.signTypedData({
    account: owner,
    domain: domainData,
    primaryType: "Permit",
    types,
    message,
  });
  const [r, s, v] = [
    slice(signature, 0, 32),
    slice(signature, 32, 64),
    slice(signature, 64, 65),
  ];
  return { r, s, v: hexToNumber(v) };
};
