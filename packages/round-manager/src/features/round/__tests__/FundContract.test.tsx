/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fireEvent, render, screen } from "@testing-library/react";
import ViewRoundPage from "../ViewRoundPage";
import { ProgressStatus, Round } from "../../api/types";
import {
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useSwitchNetwork,
  WagmiConfig,
} from "wagmi";
import { useParams } from "react-router-dom";
import { useTokenPrice } from "common";
import { client } from "../../../app/wagmi";

let mockRoundData: Round = makeRoundData();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../api/utils", () => ({
  ...jest.requireActual("../../api/utils"),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useTokenPrice: jest.fn(),
}));

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useSwitchNetwork: jest.fn(),
  useBalance: jest.fn(),
  useAccount: jest.fn(),
  useDisconnect: jest.fn(),
  useWalletClient: () => ({
    data: {
      getChainId: () => 5,
    },
  }),
}));

describe("fund contract tab", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("displays fund contract tab", async () => {
    mockRoundData = makeRoundData();

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

    (useAccount as jest.Mock).mockImplementation(() => ({
      address: mockRoundData.operatorWallets
        ? mockRoundData.operatorWallets[0]
        : "",
    }));

    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(
              <WagmiConfig config={client}>
                <ViewRoundPage />
              </WagmiConfig>,
              {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              }
            ),
            { programs: [] }
          ),
          {
            applications: [],
            isLoading: false,
          }
        )
      )
    );

    const fundContractTab = screen.getByTestId("fund-contract");
    fireEvent.click(fundContractTab);
    expect(screen.getByText("Contract Details")).toBeInTheDocument();
    expect(screen.getByText("Contract Address:")).toBeInTheDocument();
    expect(screen.getByText("Payout token:")).toBeInTheDocument();
    expect(screen.getByText("Matching pool size:")).toBeInTheDocument();
    expect(screen.getByText("Protocol fee:")).toBeInTheDocument();
    expect(screen.getByText("Round fee:")).toBeInTheDocument();
    expect(screen.getByText("Amount in contract:")).toBeInTheDocument();
    expect(screen.getByTestId("fund-contract-btn")).toBeInTheDocument();
    expect(screen.getByTestId("view-contract-btn")).toBeInTheDocument();
  });
});
