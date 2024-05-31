import { encodeQFVotes, signPermit2612, signPermitDai } from "../voting";
import {
  bytesToString,
  formatUnits,
  Hex,
  stringToBytes,
  zeroAddress,
} from "viem";
import { faker } from "@faker-js/faker";
import { getTokensByChainId } from "common";
import { WalletClient } from "wagmi";
import { expect } from "vitest";
import { getPermitType } from "common/dist/allo/voting";

const MAINNET_TOKENS = getTokensByChainId(1);
const OPTIMISM_MAINNET_TOKENS = getTokensByChainId(10);

describe("getPermitType", () => {
  it("selects dai permit type correctly for mainnet", () => {
    expect(
      getPermitType(MAINNET_TOKENS.find((token) => token.code === "DAI")!, 1)
    ).toBe("dai");
  });

  it("selects dai permit type correctly for optimism", () => {
    expect(
      getPermitType(
        OPTIMISM_MAINNET_TOKENS.find((token) => token.code === "DAI")!,
        10
      )
    ).toBe("eip2612");
  });
});

describe("Permit signatures", () => {
  it("signs a valid eip2612 typed message", async function () {
    const signTypedData = vi
      .fn()
      .mockReturnValue(
        "0x1438526e38f86bf347572817781e6bef1e4d44fdcd28b8dcf2495c19a087864d2636da993a30d95b57a6df1deb1b6aaf59f960fbb6f07ce53ed7c873312dd4e31c"
      );
    const walletClient = {
      signTypedData,
    } as unknown as WalletClient;
    const spenderAddress = faker.finance.ethereumAddress() as Hex;
    const ownerAddress = faker.finance.ethereumAddress() as Hex;

    const sig = await signPermit2612({
      value: 10n,
      spenderAddress,
      chainId: 1,
      ownerAddress,
      permitVersion: "1",
      walletClient,
      contractAddress: zeroAddress,
      deadline: 123123123123n,
      erc20Name: "TEST",
      nonce: 1n,
    });
    expect(signTypedData).toHaveBeenCalledWith({
      account: ownerAddress,
      primaryType: "Permit",
      domain: {
        name: "TEST",
        version: "1",
        chainId: 1,
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      message: {
        owner: ownerAddress,
        spender: spenderAddress,
        value: 10n,
        nonce: 1n,
        deadline: 123123123123n,
      },
      types: {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
    });
    expect(sig).toStrictEqual({
      r: "0x1438526e38f86bf347572817781e6bef1e4d44fdcd28b8dcf2495c19a087864d",
      s: "0x2636da993a30d95b57a6df1deb1b6aaf59f960fbb6f07ce53ed7c873312dd4e3",
      v: 28,
    });
  });

  it("signs a valid dai typed message", async function () {
    const signTypedData = vi
      .fn()
      .mockReturnValue(
        "0x1438526e38f86bf347572817781e6bef1e4d44fdcd28b8dcf2495c19a087864d2636da993a30d95b57a6df1deb1b6aaf59f960fbb6f07ce53ed7c873312dd4e31c"
      );
    const walletClient = {
      signTypedData,
    } as unknown as WalletClient;
    const spenderAddress = faker.finance.ethereumAddress() as Hex;
    const ownerAddress = faker.finance.ethereumAddress() as Hex;

    const sig = await signPermitDai({
      spenderAddress,
      chainId: 1,
      ownerAddress,
      permitVersion: "1",
      walletClient,
      contractAddress: zeroAddress,
      deadline: 123123123123n,
      erc20Name: "TEST",
      nonce: 1n,
    });
    expect(signTypedData).toHaveBeenCalledWith({
      account: ownerAddress,
      primaryType: "Permit",
      domain: {
        name: "TEST",
        version: "1",
        chainId: 1,
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      message: {
        holder: ownerAddress,
        spender: spenderAddress,
        nonce: 1n,
        expiry: 123123123123n,
        allowed: true,
      },
      types: {
        Permit: [
          {
            name: "holder",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "expiry",
            type: "uint256",
          },
          {
            name: "allowed",
            type: "bool",
          },
        ],
      },
    });
    expect(sig).toStrictEqual({
      r: "0x1438526e38f86bf347572817781e6bef1e4d44fdcd28b8dcf2495c19a087864d",
      s: "0x2636da993a30d95b57a6df1deb1b6aaf59f960fbb6f07ce53ed7c873312dd4e3",
      v: 28,
    });
  });
});

describe("encodeQFVOtes", () => {
  it("encodes votes correctly", async () => {
    const votes = encodeQFVotes(MAINNET_TOKENS[0], [
      {
        applicationIndex: 1,
        projectRegistryId: bytesToString(stringToBytes("a", { size: 32 })),
        recipient: zeroAddress,
        amount: formatUnits(10n, 18),
      },
    ]);

    expect(votes).eq([
      "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
    ]);
  });
});
