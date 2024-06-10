import { fireEvent, render, screen } from "@testing-library/react";
import { useTokenPrice } from "common";
import { useParams } from "react-router-dom";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";
import {
  makeRoundData,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { ProgressStatus, Round } from "../../api/types";
import ReclaimFunds from "../ReclaimFunds";
import ViewRoundPage from "../ViewRoundPage";

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
  useAllo: jest.fn(),
}));

jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  useDataLayer: () => ({
    getApplicationsForManager: () => [],
  }),
  useApplicationsByRoundId: () => {},
}));

const mockRoundData: Round = makeRoundData();

describe("fund contract tabr", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchChain as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});

    (useAccount as jest.Mock).mockImplementation(() => ({
      address: mockRoundData.operatorWallets![0],
    }));

    const currentTime = new Date();
    const roundEndTime = new Date(currentTime.getTime() - 1000 * 60 * 60 * 24);
    mockRoundData.roundEndTime = roundEndTime;
  });

  it("displays fund contract tab", () => {
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
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [mockRoundData],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          { programs: [] }
        )
      )
    );
    const fundContractTab = screen.getByTestId("fund-contract");
    fireEvent.click(fundContractTab);
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Contract Address:")).toBeInTheDocument();
    expect(screen.getByText("Payout token:")).toBeInTheDocument();
    expect(screen.getByText("Matching pool size:")).toBeInTheDocument();
    expect(screen.getByText("Protocol fee:")).toBeInTheDocument();
    expect(screen.getByText("Round fee:")).toBeInTheDocument();
    expect(screen.getByText("Amount funded:")).toBeInTheDocument();
    expect(screen.getByTestId("fund-contract-btn")).toBeInTheDocument();
    expect(screen.getByTestId("view-contract-btn")).toBeInTheDocument();
  });
});
