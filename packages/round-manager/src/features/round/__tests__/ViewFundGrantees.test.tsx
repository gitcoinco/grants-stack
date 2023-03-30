/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import {
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext
} from "../../../test-utils";
import { ProgressStatus, Round, MatchingStatsData } from "../../api/types";
import ViewFundGrantees from "../ViewFundGrantees";
import * as merklePayoutStrategy from '../../api/payoutStrategy/merklePayoutStrategy';
import * as roundTs from '../../api/round';
import { BigNumber } from "ethers";


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

jest.mock("../../api/api", () => ({
  ...jest.requireActual("../../api/api"),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

const useFetchMatchingDistributionFromContractMock = jest.spyOn(
  merklePayoutStrategy,
  "useFetchMatchingDistributionFromContract"
)

const useGroupProjectsByPaymentStatusMock = jest.spyOn(
  merklePayoutStrategy,
  "useGroupProjectsByPaymentStatus"
)

const fetchMatchingDistributionMock = jest.spyOn(
  roundTs,
  "fetchMatchingDistribution"
)

describe("View Fund Grantees", () => {

  const matchingStatsData: MatchingStatsData[] = [
    {
      index: 0,
      projectName: "Project 1",
      uniqueContributorsCount: 10,
      matchPoolPercentage: 0.1,
      projectId: "0x1",
      matchAmountInToken: BigNumber.from("100"),
      projectPayoutAddress: "0x00000000000000000000000000000000000000001",
    },
    {
      index: 1,
      projectName: "Project 2",
      uniqueContributorsCount: 20,
      matchPoolPercentage: 0.2,
      projectId: "0x2",
      matchAmountInToken: BigNumber.from("200"),
      projectPayoutAddress: "0x00000000000000000000000000000000000000002",
    },
    {
      index: 2,
      projectName: "Project 3",
      uniqueContributorsCount: 30,
      matchPoolPercentage: 0.3,
      projectId: "0x3",
      matchAmountInToken: BigNumber.from("300"),
      projectPayoutAddress: "0x00000000000000000000000000000000000000003",
    },
  ]


  beforeEach(() => {
    useFetchMatchingDistributionFromContractMock.mockReturnValue({
      distributionMetaPtr: "some-meta-ptr",
      matchingDistributionContract: matchingStatsData,
      isLoading: false,
      isError: false,
    });

    fetchMatchingDistributionMock.mockReturnValue(Promise.resolve({
      distributionMetaPtr: "some-meta-ptr",
      matchingDistribution: matchingStatsData
    }));

    useGroupProjectsByPaymentStatusMock.mockReturnValue({
      paid: [matchingStatsData[0], matchingStatsData[1]],
      unpaid: [matchingStatsData[2]],
    })
  });

  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("displays non-finalized status when round is not finalized", () => {
    (useParams as jest.Mock).mockReturnValueOnce({
      id: undefined,
    });

    useFetchMatchingDistributionFromContractMock.mockReturnValue({
      distributionMetaPtr: "some-meta-ptr",
      matchingDistributionContract: [],
      isLoading: false,
      isError: false,
    });

    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewFundGrantees isRoundFinalized={false} round={makeRoundData()} />, {
              data: [],
              fetchRoundStatus: ProgressStatus.IS_SUCCESS,
            }),
            { programs: [] }
          ),
          {
            applications: [],
            isLoading: false,
          }
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
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewFundGrantees isRoundFinalized={true} round={makeRoundData()} />, {
                data: undefined,
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      );
    });

    expect(screen.getByText("Unpaid Grantees")).toBeInTheDocument();
    expect(screen.getByText("Paid Grantees")).toBeInTheDocument();
  });

  describe("Unpaid Projects", () => {

    it("displays unpaid projects section on clicking unpaid grantees tab", async () => {
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewFundGrantees isRoundFinalized={true} round={makeRoundData()} />, {
                data: undefined,
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      );

      await act(async () => {
        const unpaidGranteesTab = screen.getByText("Unpaid Grantees");
        fireEvent.click(unpaidGranteesTab);
      });
      expect(screen.getByText("Pay out funds")).toBeInTheDocument();
    });

    it('displays exact list of projects in table which are to be paid', async () => {

      await act(async () => {
        render(
          wrapWithBulkUpdateGrantApplicationContext(
            wrapWithApplicationContext(
              wrapWithReadProgramContext(
                wrapWithRoundContext(<ViewFundGrantees isRoundFinalized={true} round={makeRoundData()} />, {
                  data: undefined,
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }),
                { programs: [] }
              ),
              {
                applications: [],
                isLoading: false,
              }
            )
          )
        );
      });

      await act(async () => {
        const unpaidGranteesTab = screen.getByText("Unpaid Grantees");
        fireEvent.click(unpaidGranteesTab);
      });

      expect(screen.getByText(matchingStatsData[2].projectPayoutAddress)).toBeInTheDocument();
    });
  });

  describe("Paid Projects", () => {
    it("displays paid projects section on clicking paid grantees tab", async () => {
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewFundGrantees isRoundFinalized={true} round={makeRoundData()} />, {
                data: undefined,
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }),
              { programs: [] }
            ),
            {
              applications: [],
              isLoading: false,
            }
          )
        )
      );

      await act(async () => {
        const paidGranteesTab = screen.getByText("Paid Grantees");
        fireEvent.click(paidGranteesTab);
      })

      expect(screen.getByText("Transaction history of grantees you have paid out funds to.")).toBeInTheDocument();
    });

    it('displays exact list of projects in table which have been be paid', async () => {
      await act(async () => {
        render(
          wrapWithBulkUpdateGrantApplicationContext(
            wrapWithApplicationContext(
              wrapWithReadProgramContext(
                wrapWithRoundContext(<ViewFundGrantees isRoundFinalized={true} round={makeRoundData()} />, {
                  data: undefined,
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }),
                { programs: [] }
              ),
              {
                applications: [],
                isLoading: false,
              }
            )
          )
        );
      });

      await act(async () => {
        const paidGranteesTab = screen.getByText("Paid Grantees");
        fireEvent.click(paidGranteesTab);
      });

      expect(screen.getByText(matchingStatsData[0].projectPayoutAddress)).toBeInTheDocument();
      expect(screen.getByText(matchingStatsData[1].projectPayoutAddress)).toBeInTheDocument();
    });

  });
});

