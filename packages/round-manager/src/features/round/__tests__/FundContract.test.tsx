// import { fireEvent, render, screen } from "@testing-library/react";
// import { useTokenPrice } from "common";
import { useParams } from "react-router-dom";
import {
  makeRoundData,
  // wrapWithBulkUpdateGrantApplicationContext,
  // wrapWithReadProgramContext,
  // wrapWithRoundContext,
} from "../../../test-utils";
import { Round } from "../../api/types";
// import ViewRoundPage from "../ViewRoundPage";
// import { useBalance } from "wagmi";

const mockRoundData: Round = makeRoundData();
jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useSwitchChain: () => ({
    switchChain: jest.fn(),
  }),
  useDisconnect: jest.fn(),
  useAccount: () => ({
    chainId: 1,
    address: mockRoundData.operatorWallets![0],
  }),
  useBalance: () => ({
    data: { formatted: "0", value: "0" },
    error: null,
    loading: false,
  }),
}));
jest.mock("../../common/Auth");
jest.mock("../../../app/wagmi", () => ({
  getEthersProvider: (chainId: number) => ({
    getNetwork: () => Promise.resolve({ network: { chainId } }),
    network: { chainId },
  }),
}));
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
  getDefaultConfig: jest.fn(),
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

describe("fund contract tabr", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    const currentTime = new Date();
    const roundEndTime = new Date(currentTime.getTime() - 1000 * 60 * 60 * 24);
    mockRoundData.roundEndTime = roundEndTime;
  });

  it("displays fund contract tab", () => {
    // (useTokenPrice as jest.Mock).mockImplementation(() => ({
    //   data: "100",
    //   error: null,
    //   loading: false,
    // }));
    // render(
    //   wrapWithBulkUpdateGrantApplicationContext(
    //     wrapWithReadProgramContext(
    //       wrapWithRoundContext(<ViewRoundPage />, {
    //         data: [mockRoundData],
    //         fetchRoundStatus: ProgressStatus.IS_SUCCESS,
    //       }),
    //       { programs: [] }
    //     )
    //   )
    // );

    // const fundContractTab = screen.getByTestId("fund-contract");
    // fireEvent.click(fundContractTab);

    // expect(screen.getByText("Details")).toBeInTheDocument();

    // if (process.env.REACT_APP_ALLO_VERSION === "allo-v1") {
    //   expect(screen.getByText("Contract Address:")).toBeInTheDocument();
    //   expect(screen.getByTestId("fund-contract-btn")).toBeInTheDocument();
    //   expect(screen.getByTestId("view-contract-btn")).toBeInTheDocument();
    // }

    // expect(screen.getByText("Payout token:")).toBeInTheDocument();
    // expect(screen.getByText("Matching pool size:")).toBeInTheDocument();
    // expect(screen.getByText("Protocol fee:")).toBeInTheDocument();
    // expect(screen.getByText("Round fee:")).toBeInTheDocument();
    // expect(screen.getByText("Amount funded:")).toBeInTheDocument();
  });
});
