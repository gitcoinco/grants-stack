import { selectPermitType, signPermit2612, signPermitDai } from "../voting";
import { MAINNET_TOKENS, OPTIMISM_MAINNET_TOKENS } from "../utils";
import { Hex, zeroAddress } from "viem";
import { faker } from "@faker-js/faker";
import { ChainId } from "common";
import { WalletClient } from "wagmi";
import { expect } from "vitest";

describe("selectPermitType", () => {
  it("selects dai permit type correctly for mainnet", () => {
    expect(
      selectPermitType(MAINNET_TOKENS.find((token) => token.name === "DAI")!)
    ).toBe("dai");
  });

  it("selects dai permit type correctly for optimism", () => {
    expect(
      selectPermitType(
        OPTIMISM_MAINNET_TOKENS.find((token) => token.name === "DAI")!
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
      chainId: ChainId.MAINNET,
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
      chainId: ChainId.MAINNET,
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
