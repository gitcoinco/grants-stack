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
import { CartProject } from "./types";
import { WalletClient } from "wagmi";
import { VotingToken } from "common";
import { NATIVE } from "common/dist/allo/common";

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

export function encodedQFAllocation(
  donationToken: VotingToken,
  donations: Pick<
    CartProject,
    | "amount"
    | "recipient"
    | "projectRegistryId"
    | "applicationIndex"
    | "anchorAddress"
  >[]
): Hex[] {
  const tokenAddress =
    donationToken.address === zeroAddress ? NATIVE : donationToken.address;

  const encodedData = donations.map((donation) => {
    if (!donation.anchorAddress) {
      throw new Error("Anchor address is required for QF allocation");
    }
    return encodeAbiParameters(
      parseAbiParameters(
        "address,uint8,(((address,uint256),uint256,uint256),bytes)"
      ),
      [
        getAddress(donation.anchorAddress),
        0, // permit type of none on the strategy
        [
          [
            [
              getAddress(tokenAddress),
              parseUnits(donation.amount, donationToken.decimal),
            ],
            0n, // nonce, since permit type is none
            0n, // deadline, since permit type is none
          ],
          "0x0000000000000000000000000000000000000000000000000000000000000000", // signature, since permit type is none
        ],
      ]
    );
  });

  return encodedData;
}
