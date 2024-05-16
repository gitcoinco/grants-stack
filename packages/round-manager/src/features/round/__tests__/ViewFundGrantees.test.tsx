/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { fireEvent, render, screen } from "@testing-library/react";
import { ethers } from "ethers";
import { act } from "react-dom/test-utils";
import { useParams } from "react-router-dom";
import { useBalance, useDisconnect, useSwitchNetwork } from "wagmi";
import {
  makeRoundData,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import * as merklePayoutStrategy from "../../api/payoutStrategy/payoutStrategy";
import { MatchingStatsData, ProgressStatus, Round } from "../../api/types";
import ViewFundGrantees from "../ViewFundGrantees";
import { faker } from "@faker-js/faker";
import { parseEther } from "ethers/lib/utils";

jest.mock("../../common/Auth");
jest.mock("wagmi");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: () => {
      /* do nothing.*/
    },
  },
});

const mockRoundData: Round = makeRoundData();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: jest.fn(),
}));

const useGroupProjectsByPaymentStatusMock = jest.spyOn(
  merklePayoutStrategy,
  "useGroupProjectsByPaymentStatus"
);

describe("View Fund Grantees", () => {
  // TODO: check default values in base.
  // I've added them to avoid typescript errors.
  const matchingStatsData: MatchingStatsData[] = [
    {
      index: 0,
      projectName: "Project 1",
      uniqueContributorsCount: 10,
      matchPoolPercentage: 0.1,
      projectId: "0x1",
      matchAmountInToken: ethers.utils.parseEther("1.11"),
      projectPayoutAddress: "0x00000000000000000000000000000000000000001",
      applicationId: faker.datatype.number().toString(),
      contributionsCount: faker.datatype.number(),
      originalMatchAmountInToken: parseEther(
        faker.datatype.number().toString()
      ),
    },
    {
      index: 1,
      projectName: "Project 2",
      uniqueContributorsCount: 20,
      matchPoolPercentage: 0.2,
      projectId: "0x2",
      matchAmountInToken: ethers.utils.parseEther("2.22"),
      projectPayoutAddress: "0x00000000000000000000000000000000000000002",
      applicationId: faker.datatype.number().toString(),
      contributionsCount: faker.datatype.number(),
      originalMatchAmountInToken: parseEther(
        faker.datatype.number().toString()
      ),
    },
    {
      index: 2,
      projectName: "Project 3",
      uniqueContributorsCount: 30,
      matchPoolPercentage: 0.3,
      projectId: "0x3",
      matchAmountInToken: ethers.utils.parseEther("3.33"),
      projectPayoutAddress: "0x00000000000000000000000000000000000000003",
      applicationId: faker.datatype.number().toString(),
      contributionsCount: faker.datatype.number(),
      originalMatchAmountInToken: parseEther(
        faker.datatype.number().toString()
      ),
    },
    {
      index: 3,
      projectName: "Project 4",
      uniqueContributorsCount: 40,
      matchPoolPercentage: 0.4,
      projectId: "0x4",
      matchAmountInToken: ethers.utils.parseEther("4.44"),
      projectPayoutAddress: "0x00000000000000000000000000000000000000004",
      applicationId: faker.datatype.number().toString(),
      contributionsCount: faker.datatype.number(),
      originalMatchAmountInToken: parseEther(
        faker.datatype.number().toString()
      ),
    },
  ];

  beforeEach(() => {
    useGroupProjectsByPaymentStatusMock.mockReturnValue({
      paid: [matchingStatsData[0], matchingStatsData[1]],
      unpaid: [matchingStatsData[2], matchingStatsData[3]],
      all: matchingStatsData,
    });

    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
    (useParams as jest.Mock).mockReturnValueOnce({
      id: undefined,
    });
  });

  it("displays non-finalized status when round is not finalized", () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(
            <ViewFundGrantees
              isRoundFinalized={false}
              round={makeRoundData()}
            />,
            {
              data: [],
              fetchRoundStatus: ProgressStatus.IS_SUCCESS,
            }
          ),
          { programs: [] }
        )
      )
    );

    expect(screen.getByText("Round not finalized yet")).toBeInTheDocument();
  });

  it("displays finalized status when round is finalized", async () => {
    (useParams as jest.Mock).mockReturnValueOnce({
      id: undefined,
    });

    await act(async () => {
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(
              <ViewFundGrantees
                isRoundFinalized={true}
                round={makeRoundData()}
              />,
              {
                data: undefined,
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }
            ),
            { programs: [] }
          )
        )
      );
    });

    expect(screen.getByText("Unpaid Grantees")).toBeInTheDocument();
    expect(screen.getByText("Paid Grantees")).toBeInTheDocument();
  });

  describe("Unpaid Projects", () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          wrapWithBulkUpdateGrantApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(
                <ViewFundGrantees
                  isRoundFinalized={true}
                  round={makeRoundData()}
                />,
                {
                  data: undefined,
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }
              ),
              { programs: [] }
            )
          )
        );
      });
    });

    it("displays unpaid projects section & table headers on clicking unpaid grantees tab", async () => {
      await act(async () => {
        const unpaidGranteesTab = screen.getByText("Unpaid Grantees");
        fireEvent.click(unpaidGranteesTab);
      });

      expect(screen.getByText("Fund Grantees")).toBeInTheDocument();
      expect(screen.getByText("Unpaid Grantees")).toBeInTheDocument();
      expect(screen.getByText("Paid Grantees")).toBeInTheDocument();
      expect(
        screen.getByText("Select which grantees you wish to allocate funds to.")
      ).toBeInTheDocument();
      expect(screen.getByText("Project")).toBeInTheDocument();
      expect(screen.getByText("Wallet Address")).toBeInTheDocument();
      expect(screen.getByText("Matching %")).toBeInTheDocument();
      expect(screen.getByText("Payout Amount")).toBeInTheDocument();
      expect(screen.getByText("Payout funds")).toBeInTheDocument();
    });

    it("displays exact list of projects in table which are to be paid", async () => {
      await act(async () => {
        const unpaidGranteesTab = screen.getByText("Unpaid Grantees");
        fireEvent.click(unpaidGranteesTab);
      });

      expect(
        screen.getByText(matchingStatsData[2].projectPayoutAddress)
      ).toBeInTheDocument();
      expect(
        screen.getByText(matchingStatsData[3].projectPayoutAddress)
      ).toBeInTheDocument();
    });

    it("Should show the confirmation modal and close on cancel", async () => {
      (useBalance as jest.Mock).mockImplementation(() => ({
        data: { formatted: "0", value: ethers.utils.parseEther("1000") },
        error: null,
        loading: false,
      }));
      await act(async () => {
        const checkboxes = screen.queryAllByTestId("project-checkbox");
        checkboxes[0].click();
      });

      await act(async () => {
        const payoutFundsButton = screen.getByTestId("pay-out-funds-button");
        fireEvent.click(payoutFundsButton);
      });

      expect(screen.getByText("Confirm Decision")).toBeInTheDocument();

      await act(async () => {
        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);
      });

      expect(screen.queryByText("Confirm Decision")).not.toBeInTheDocument();
    });

    it("Should show the progress modal", async () => {
      (useBalance as jest.Mock).mockImplementation(() => ({
        data: { formatted: "0", value: ethers.utils.parseEther("1000") },
        error: null,
        loading: false,
      }));
      await act(async () => {
        const checkboxes = screen.queryAllByTestId("project-checkbox");
        checkboxes[0].click();
      });

      await act(async () => {
        const payoutFundsButton = screen.getByTestId("pay-out-funds-button");
        fireEvent.click(payoutFundsButton);
      });

      expect(screen.getByText("Confirm Decision")).toBeInTheDocument();

      await act(async () => {
        const confirmButton = screen.getByTestId("confirm-button");
        fireEvent.click(confirmButton);
      });
    });

    it("Should show the warning when not enough funds in contract", async () => {
      (useBalance as jest.Mock).mockImplementation(() => ({
        data: { formatted: "0", value: "0" },
        error: null,
        loading: false,
      }));
      await act(async () => {
        const checkboxes = screen.queryAllByTestId("project-checkbox");
        checkboxes[0].click();
      });

      await act(async () => {
        const payoutFundsButton = screen.getByTestId("pay-out-funds-button");
        fireEvent.click(payoutFundsButton);
      });

      const warning = await screen.findByText(
        "You don’t have enough funds in the contract to pay out the selected grantees. Please either add more funds to the contract or select fewer grantees."
      );

      expect(warning).toBeInTheDocument();
    });
  });

  describe("Paid Projects", () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          wrapWithBulkUpdateGrantApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(
                <ViewFundGrantees
                  isRoundFinalized={true}
                  round={makeRoundData()}
                />,
                {
                  data: undefined,
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }
              ),
              { programs: [] }
            )
          )
        );
      });
    });
    it("displays paid projects section on clicking paid grantees tab", async () => {
      await act(async () => {
        const paidGranteesTab = screen.getByText("Paid Grantees");
        fireEvent.click(paidGranteesTab);
      });

      // tests that the table without data is displayed
      expect(screen.getByText("Grantees")).toBeInTheDocument();
      expect(screen.getByText("Project")).toBeInTheDocument();
      expect(screen.getByText("Wallet Address")).toBeInTheDocument();
      expect(screen.getByText("Matching Percent %")).toBeInTheDocument();
      expect(screen.getByText("Payout Amount")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Transaction")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Transaction history of grantees you have paid out funds to."
        )
      ).toBeInTheDocument();
    });

    it("displays exact list of projects in table which have been paid", async () => {
      await act(async () => {
        const paidGranteesTab = screen.getByText("Paid Grantees");
        fireEvent.click(paidGranteesTab);
      });

      expect(
        screen.getByText(matchingStatsData[0].projectName!)
      ).toBeInTheDocument();
      expect(
        screen.getByText(matchingStatsData[1].projectName!)
      ).toBeInTheDocument();

      expect(
        screen.getByText(matchingStatsData[0].projectPayoutAddress)
      ).toBeInTheDocument();
      expect(
        screen.getByText(matchingStatsData[1].projectPayoutAddress)
      ).toBeInTheDocument();

      expect(
        screen.getByText(matchingStatsData[0].matchPoolPercentage * 100 + "%")
      ).toBeInTheDocument();
      expect(
        screen.getByText(matchingStatsData[1].matchPoolPercentage * 100 + "%")
      ).toBeInTheDocument();

      await act(async () => {
        const statuses = screen.getAllByText("Success");
        expect(statuses[0]).toBeInTheDocument();
        expect(statuses[1]).toBeInTheDocument();
      });

      // NOTE: this could be added to for each transaction hash that the link is correct and not just there.
      await act(async () => {
        const links = screen.getAllByText("View");
        fireEvent.click(links[0]);
        fireEvent.click(links[1]);
      });
    });
  });
});
