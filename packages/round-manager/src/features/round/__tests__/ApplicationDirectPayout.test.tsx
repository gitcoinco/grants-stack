import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ApplicationDirectPayout from "../ApplicationDirectPayout";
import { makeGrantApplicationData, makeRoundData } from "../../../test-utils";
import { ROUND_PAYOUT_DIRECT } from "../../common/Utils";

import { useWallet } from "../../common/Auth";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { ethers } from "ethers";

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

describe("<ApplicationDirectPayout />", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockImplementation(() => mockWallet);
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});
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
      ], // Add necessary mock data for the answerBlocks prop
    };

    render(<ApplicationDirectPayout {...mockProps} />);

    expect(
      screen.queryByText("Payouts have not been made yet.")
    ).toBeInTheDocument();
  });
});
