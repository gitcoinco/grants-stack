import { fireEvent, render, screen } from "@testing-library/react";
import {
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import ReclaimFunds from "../ReclaimFunds";
import { ProgressStatus, Round } from "../../api/types";
import { useBalance, useDisconnect, useSigner, useSwitchNetwork } from "wagmi";
import ViewRoundPage from "../ViewRoundPage";
import { useParams } from "react-router-dom";
import { useTokenPrice } from "common";

jest.mock("wagmi");
jest.mock("../../common/Auth");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: {
      network: {
        chainId: 1,
      },
    },
  }),
}));

jest.mock("../../api/utils", () => ({
  ...jest.requireActual("../../api/utils"),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useTokenPrice: jest.fn(),
}));

const chainId = "0";
const roundId = "testRoundId";

const mockRoundData: Round = makeRoundData();

describe("ReclaimFunds", () => {
  it("displays NoInformationContent when round is not over", () => {
    const currentTime = new Date();
    const roundEndTime = new Date(currentTime.getTime() + 1000 * 60 * 60 * 24);
    mockRoundData.roundEndTime = roundEndTime;

    const daysLeft = Number(roundEndTime) - Number(currentTime);
    const daysLeftInRound = Number(daysLeft / (1000 * 60 * 60 * 24)).toFixed(0);

    render(
      <ReclaimFunds round={mockRoundData} chainId={chainId} roundId={roundId} />
    );

    expect(
      screen.getByText(`${daysLeftInRound} days until you can reclaim funds`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "If there is a balance left over, you will be able to reclaim funds here."
      )
    ).toBeInTheDocument();
  });

  describe("when round is over", () => {
    beforeEach(() => {
      (useParams as jest.Mock).mockImplementation(() => {
        return {
          id: mockRoundData.id,
        };
      });

      (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
      (useDisconnect as jest.Mock).mockReturnValue({});

      const currentTime = new Date();
      const roundEndTime = new Date(
        currentTime.getTime() - 1000 * 60 * 60 * 24
      );
      mockRoundData.roundEndTime = roundEndTime;
    });

    it("displays ReclaimFundsContent when round is over", () => {
      (useTokenPrice as jest.Mock).mockImplementation(() => ({
        data: "100",
        error: null,
        loading: false,
      }));

      (useBalance as jest.Mock).mockImplementation(() => ({
        data: { formatted: "0", value: "0" },
        error: null,
        loading: false,
      }));

      (useSigner as jest.Mock).mockImplementation(() => ({
        signer: {
          getBalance: () => Promise.resolve("0"),
        },
      }));

      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
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
      const fundContractTab = screen.getByTestId("reclaim-funds");
      fireEvent.click(fundContractTab);

      expect(screen.getByTestId("reclaim-funds-title")).toBeInTheDocument();
      expect(screen.getByText("Contract Balance")).toBeInTheDocument();
      expect(screen.getByText("Payout token:")).toBeInTheDocument();
      expect(screen.getByText("Matching pool size:")).toBeInTheDocument();
      expect(
        screen.getByText("Amount in payout contract:")
      ).toBeInTheDocument();
      expect(screen.getByText("Wallet address:")).toBeInTheDocument();
      expect(screen.getByTestId("reclaim-fund-btn")).toBeInTheDocument();
    });
  });
});
