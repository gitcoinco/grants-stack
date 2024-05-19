/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { faker } from "@faker-js/faker";
import { fireEvent, render, screen } from "@testing-library/react";
import { useTokenPrice } from "common";
import { useParams } from "react-router-dom";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useSigner,
  useSwitchNetwork,
} from "wagmi";
import {
  makeRoundData,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { ProgressStatus, Round } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";
import {
  getTokensByChainId,
  TPayoutToken,
} from "@grants-labs/gitcoin-chain-data";
import { useContractAmountFunded } from "../FundContract";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextDecoder } = require("util");
global.TextDecoder = TextDecoder;

jest.mock("../../common/Auth");
jest.mock("wagmi");
jest.mock("@grants-labs/gitcoin-chain-data", () => ({
  getTokensByChainId: jest.fn(),
}));
jest.mock("../FundContract", () => ({
  useContractAmountFunded: jest.fn(),
}));

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

let mockRoundData: Round = makeRoundData();

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
  useDataLayer: () => ({}),
  useApplicationsByRoundId: () => {},
}));

describe("fund contract tab", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
        payoutToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("displays fund contract tab", async () => {
    mockRoundData = makeRoundData({
      // Ensure the token address matches the mocked token data
      token: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      chainId: 1,
    });

    (useTokenPrice as jest.Mock).mockImplementation(() => ({
      data: "100",
      error: null,
      loading: false,
    }));

    (useBalance as jest.Mock).mockImplementation(() => ({
      data: { formatted: "0", value: { toBigInt: () => 0n } },
      error: null,
      loading: false,
    }));

    (useAccount as jest.Mock).mockImplementation(() => ({
      address: faker.finance.ethereumAddress(),
    }));

    (useSigner as jest.Mock).mockImplementation(() => ({
      signer: {
        getBalance: () => Promise.resolve("0"),
      },
    }));

    (getTokensByChainId as jest.Mock).mockImplementation((chainId) => {
      console.log(`Mock getTokensByChainId called with chainId: ${chainId}`);
      return {
        data: [
          {
            name: "USDC",
            chainId: 1,
            address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            redstoneTokenId: "USDC",
            decimal: 6,
            logo: "path/to/usdc/logo.png",
          },
        ],
      };
    });

    // (useContractAmountFunded as jest.Mock).mockImplementation(
    //   ({ round, payoutToken }: { round: Round; payoutToken: TPayoutToken }) => {
    //     console.log("useContractAmountFunded args:", { round, payoutToken });
    //     if (!round || !payoutToken) {
    //       return {
    //         isLoading: true,
    //         error: undefined,
    //         data: undefined,
    //       };
    //     }
    //     return {
    //       isLoading: false,
    //       error: undefined,
    //       data: {
    //         fundedAmount: BigInt(1e18), // 1 token in 18 decimals
    //         fundedAmountInUsd: 1000,
    //       },
    //     };
    //   }
    // );

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
