import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ApplicationDirectPayout from "../ApplicationDirectPayout";
import { makeGrantApplicationData, makeRoundData } from "../../../test-utils";
import { ROUND_PAYOUT_DIRECT } from "../../common/Utils";

import { useWallet } from "../../common/Auth";
import { useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import { ethers } from "ethers";
import moment from "moment";
import { parseUnits } from "ethers/lib/utils.js";

jest.mock("../../common/Auth");
jest.mock("wagmi");

const mockAddress = ethers.constants.AddressZero;
const mockWallet = {
  provider: {
    network: {
      chainId: 1,
    },
  },
  address: mockAddress,
  signer: {
    getChainId: () => {
      /* do nothing */
    },
  },
  chain: {
    name: "abc",
  },
};
const mockNetwork = {
  chain: {
    blockExplorers: {
      default: {
        url: "https://mock-blockexplorer.com",
      },
    },
  },
};

describe("<ApplicationDirectPayout />", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockImplementation(() => mockWallet);
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});
    (useNetwork as jest.Mock).mockReturnValue(mockNetwork);
  });

  it('should display "Payouts have not been made yet." when there are no payouts', () => {
    // Mocking props with no payouts
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [], // Empty payouts array
        },
      }),
      answerBlocks: [
        {
          questionId: 0,
          question: "Email Address",
          answer: "johndoe@example.com",
        },
        {
          questionId: 1,
          question: "Payout token",
          answer: "DAI",
        },
      ],
    };

    render(<ApplicationDirectPayout {...mockProps} />);

    expect(
      screen.queryByText("Payouts have not been made yet.")
    ).toBeInTheDocument();
  });

  it("should display payout information when there are payouts", () => {
    // Mocking props with no payouts
    const mockProps = {
      round: makeRoundData({
        operatorWallets: [mockAddress],
      }),
      application: makeGrantApplicationData({
        applicationIndex: 1,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [
            {
              amount: parseUnits("1", 18).toString(),
              applicationIndex: 1,
              createdAt: (
                moment().subtract(3, "day").valueOf() / 1000
              ).toString(),
              txnHash: "0x00001",
            },
            {
              amount: parseUnits("2", 18).toString(),
              applicationIndex: 1,
              createdAt: (
                moment().subtract(2, "day").valueOf() / 1000
              ).toString(),
              txnHash: "0x00002",
            },
            {
              amount: parseUnits("20", 18).toString(),
              applicationIndex: 2, // NOTE: This payout is for a different application
              createdAt: (
                moment().subtract(1, "day").valueOf() / 1000
              ).toString(),
              txnHash: "0x00003",
            },
          ],
        },
      }),
      answerBlocks: [
        {
          questionId: 0,
          question: "Email Address",
          answer: "johndoe@example.com",
        },
        {
          questionId: 1,
          question: "Payout token",
          answer: "DAI",
        },
      ],
    };

    render(<ApplicationDirectPayout {...mockProps} />);

    const tbody = screen.getByTestId("direct-payout-payments-table");
    const filas = within(tbody).getAllByRole("row");
    const totalPaidOut = screen.getByTestId("direct-payout-payments-total");

    expect(filas.length).toBe(2);
    expect(filas[0].textContent).toContain("0x00001");
    expect(filas[1].textContent).toContain("0x00002");
    expect(totalPaidOut.textContent).toContain("3.0 DAI");
  });
});
