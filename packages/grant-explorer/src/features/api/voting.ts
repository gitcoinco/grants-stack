import { MRC_CONTRACTS } from "./contracts";
import { Hex, hexToNumber, slice, zeroAddress } from "viem";
import { PayoutToken } from "./types";
import mrcAbi from "./abi/multiRoundCheckout";
import { ChainId } from "common";
import { WalletClient } from "wagmi";
import { getContract, getPublicClient, PublicClient } from "@wagmi/core";
import { allChains } from "../../app/wagmi";

export type PermitSignature = {
  v: number;
  r: string;
  s: string;
};

export const voteUsingMRCContract = async (
  walletClient: WalletClient,
  chainId: ChainId,
  token: PayoutToken,
  groupedVotes: Record<string, Hex[]>,
  groupedAmounts: Record<string, bigint>,
  nativeTokenAmount: bigint,
  permit?: {
    sig: PermitSignature;
    deadline: number;
    nonce: bigint;
  }
) => {
  console.log("chainId in mrc vote", chainId);
  const mrcImplementation = getContract({
    address: MRC_CONTRACTS[(await walletClient.getChainId()) as ChainId],
    abi: mrcAbi,
    walletClient,
    chainId,
  });

  let tx;

  /* decide which function to use based on whether token is native, permit-compatible or DAI */
  if (token.address === zeroAddress) {
    // const { request } = await publicClient.simulateContract({
    //   account: walletClient.account,
    //   address: mrcImplementation.address,
    //   abi: mrcAbi,
    //   functionName: "vote",
    //   args: [
    //     Object.values(groupedVotes),
    //     Object.keys(groupedVotes) as Hex[],
    //     Object.values(groupedAmounts),
    //   ],
    //   value: nativeTokenAmount,
    // });

    tx = await mrcImplementation.write.vote(
      [
        Object.values(groupedVotes),
        Object.keys(groupedVotes) as Hex[],
        Object.values(groupedAmounts),
      ],
      {
        value: nativeTokenAmount,
        chain: allChains.find((chain) => chain.id === chainId),
      }
    );
  } else if (permit) {
    /* Is token DAI? */
    if (/DAI/i.test(token.name)) {
      tx = await mrcImplementation.write.voteDAIPermit([
        Object.values(groupedVotes),
        Object.keys(groupedVotes) as Hex[],
        Object.values(groupedAmounts),
        Object.values(groupedAmounts).reduce((acc, b) => acc + b),
        token.address as Hex,
        BigInt(permit.deadline ?? Number.MAX_SAFE_INTEGER),
        permit.nonce,
        permit.sig.v,
        permit.sig.r as Hex,
        permit.sig.s as Hex,
      ]);
    } else {
      tx = await mrcImplementation.write.voteERC20Permit([
        Object.values(groupedVotes),
        Object.keys(groupedVotes) as Hex[],
        Object.values(groupedAmounts),
        Object.values(groupedAmounts).reduce((acc, b) => acc + b),
        token.address as Hex,
        BigInt(permit.deadline ?? Number.MAX_SAFE_INTEGER),
        permit.sig.v,
        permit.sig.r as Hex,
        permit.sig.s as Hex,
      ]);
    }
  } else {
    debugger;
    /* Tried voting using erc-20 but no permit signature provided */
    throw new Error(
      "Tried voting using erc-20 but no permit signature provided"
    );
  }

  /* Check */
  const pc = getPublicClient({
    chainId,
  });

  return pc.waitForTransactionReceipt({
    hash: tx,
    timeout: 20_000_000,
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
  permitVersion?: string;
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
  permitVersion,
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
    version: permitVersion ?? "1",
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
  permitVersion,
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
    version: permitVersion ?? "1",
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
