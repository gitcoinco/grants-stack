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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextDecoder } = require("util");
global.TextDecoder = TextDecoder;

jest.mock("../../common/Auth");
jest.mock("wagmi");

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
