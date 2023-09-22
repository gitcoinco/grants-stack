import { MRC_CONTRACTS } from "./contracts";
import {
  encodeAbiParameters,
  getAddress,
  Hex,
  hexToNumber,
  pad,
  parseAbiParameters,
  parseUnits,
  slice,
  toHex,
  TypedDataDomain,
  zeroAddress,
} from "viem";
import { CartProject, VotingToken } from "./types";
import mrcAbi from "./abi/multiRoundCheckout";
import { ChainId } from "common";
import { WalletClient } from "wagmi";
import { getContract, getPublicClient } from "@wagmi/core";
import { allChains } from "../../app/chainConfig";

export type PermitSignature = {
  v: number;
  r: string;
  s: string;
};

export type PermitType = "dai" | "eip2612";
/** Given a payout token, selects the correct permit type.
 * - DAI is the old permit type without `value` and with the `allowed` prop
 * - eip2612 is the standard permit interface, as specified in https://eips.ethereum.org/EIPS/eip-2612
 *
 * Old DAI permit type is only implemented on Ethereum and Polygon PoS. Check /docs/DAI.md for more info.
 * */
export const getPermitType = (token: VotingToken): PermitType => {
  if (
    /DAI/i.test(token.name) &&
    token.chainId ===
      1 /* || token.chainId === 137 Polygon not yet supported, but soon */
  ) {
    return "dai";
  } else {
    return "eip2612";
  }
};

export const voteUsingMRCContract = async (
  walletClient: WalletClient,
  chainId: ChainId,
  token: VotingToken,
  groupedVotes: Record<string, Hex[]>,
  groupedAmounts: Record<string, bigint>,
  nativeTokenAmount: bigint,
  permit?: {
    sig: PermitSignature;
    deadline: number;
    nonce: bigint;
  }
) => {
  const mrcImplementation = getContract({
    address: MRC_CONTRACTS[(await walletClient.getChainId()) as ChainId],
    abi: mrcAbi,
    walletClient,
    chainId,
  });

  let tx;

  /* decide which function to use based on whether token is native, permit-compatible or DAI */
  if (token.address === zeroAddress) {
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
    if (getPermitType(token) === "dai") {
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
  ownerAddress: Hex;
  spenderAddress: Hex;
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
  ownerAddress,
  spenderAddress,
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

  let domainData: TypedDataDomain = {
    name: erc20Name,
    version: permitVersion ?? "1",
    chainId: chainId,
    verifyingContract: contractAddress,
  };
  if (chainId === 137 && erc20Name === "USD Coin (PoS)") {
    domainData = {
      name: erc20Name,
      version: permitVersion ?? "1",
      verifyingContract: contractAddress,
      salt: pad(toHex(137), { size: 32 }),
    };
  }

  const message = {
    owner: ownerAddress,
    spender: spenderAddress,
    value,
    nonce,
    deadline,
  };

  const signature = await walletClient.signTypedData({
    account: ownerAddress,
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
  ownerAddress,
  spenderAddress,
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
    holder: ownerAddress,
    spender: spenderAddress,
    nonce,
    expiry: deadline,
    allowed: true,
  };

  const signature = await walletClient.signTypedData({
    account: ownerAddress,
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

export function encodeQFVotes(
  donationToken: VotingToken,
  donations: Pick<
    CartProject,
    "amount" | "recipient" | "projectRegistryId" | "applicationIndex"
  >[]
): Hex[] {
  return donations.map((donation) => {
    const vote = [
      getAddress(donationToken.address),
      parseUnits(donation.amount, donationToken.decimal),
      getAddress(donation.recipient),
      donation.projectRegistryId as Hex,
      BigInt(donation.applicationIndex),
    ] as const;

    return encodeAbiParameters(
      parseAbiParameters(["address,uint256,address,bytes32,uint256"]),
      vote
    );
  });
}
