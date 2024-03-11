/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import {
  makeDirectGrantRoundData,
  makeGrantApplicationData,
  makeRoundData,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { GrantApplication, ProgressStatus, Round } from "../../api/types";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";
import ViewRoundPage from "../ViewRoundPage";

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: jest.fn(),
}));

jest.mock("../../common/Auth");
jest.mock("wagmi");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  useDataLayer: () => ({
   getRoundById: jest.fn(),
  }),
}));

jest.mock("../../common/useApplicationsByRoundId");

Object.assign(navigator, {
  clipboard: {
    writeText: () => {
      /* do nothing.*/
    },
  },
});

const mockRoundData: Round = makeRoundData();

const mockDirectGrantRoundData: Round = makeDirectGrantRoundData();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {
      name: "Ethereum",
    },
    address: mockRoundData.operatorWallets![0],
    signer: {
      getChainId: () => {
        /* do nothing */
      },
    },
    provider: {
      network: {
        chainId: 1,
      },
      getNetwork: async () => {
        return { chainId: 1 };
      },
    },
  }),
}));

describe("View Round", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it("displays a 404 when there no round is found", () => {
    (useParams as jest.Mock).mockReturnValueOnce({
      id: undefined,
    });

    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [],
            fetchRoundStatus: ProgressStatus.IS_ERROR,
          }),
          { programs: [] }
        )
      )
    );

    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
  });

  it("displays access denied when wallet accessing is not round operator", () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [{ ...mockRoundData, operatorWallets: [] }],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          { programs: [] }
        )
      )
    );
    expect(screen.getByText("Access Denied!")).toBeInTheDocument();
  });

  it("displays Round application button", () => {
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
    expect(screen.getByText("Round Application")).toBeInTheDocument();
  });

  it("displays copy when there are no applicants for a given round", () => {
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
    expect(screen.getByText("No Applications")).toBeInTheDocument();
  });

  it("displays side navigation bar in the round page", () => {
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

    expect(screen.getByTestId("side-nav-bar")).toBeInTheDocument();
    expect(screen.getByText("Fund Round")).toBeInTheDocument();
    expect(screen.getByText("Grant Applications")).toBeInTheDocument();
    expect(screen.getByText("Round Settings")).toBeInTheDocument();
    expect(screen.getByText("Round Stats")).toBeInTheDocument();
    expect(screen.getByText("Round Results")).toBeInTheDocument();
    expect(screen.getByText("Fund Grantees")).toBeInTheDocument();
    expect(screen.getByText("Reclaim Funds")).toBeInTheDocument();
  });

  it("displays fixed side navigation bar for Direct Grant rounds in the round page", () => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockDirectGrantRoundData.id,
      };
    });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [mockDirectGrantRoundData],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          { programs: [] }
        )
      )
    );

    expect(screen.getByTestId("side-nav-bar")).toBeInTheDocument();
    expect(screen.getByText("Grant Applications")).toBeInTheDocument();
    expect(screen.getByText("Round Settings")).toBeInTheDocument();
    expect(screen.queryAllByText("Fund Contract").length).toBe(0);
    expect(screen.queryAllByText("Round Stats").length).toBe(0);
    expect(screen.queryAllByText("Round Results").length).toBe(0);
    expect(screen.queryAllByText("Fund Grantees").length).toBe(0);
    expect(screen.queryAllByText("Reclaim Funds").length).toBe(0);
  });

  it("indicates how many of each kind of application there are", () => {
    const mockApplicationData: GrantApplication[] = [
      makeGrantApplicationData(),
      makeGrantApplicationData(),
      makeGrantApplicationData(),
      makeGrantApplicationData(),
    ];

    mockApplicationData[0].status = "PENDING";
    mockApplicationData[1].status = "PENDING";
    mockApplicationData[2].status = "REJECTED";
    mockApplicationData[3].status = "APPROVED";

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: mockApplicationData,
      error: undefined,
      isLoading: false,
    });

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

    expect(
      parseInt(screen.getByTestId("received-application-counter").textContent!)
    ).toBe(2);
    expect(
      parseInt(screen.getByTestId("rejected-application-counter").textContent!)
    ).toBe(1);
    expect(
      parseInt(screen.getByTestId("approved-application-counter").textContent!)
    ).toBe(1);
  });

  it("displays loading spinner when round is loading", () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [mockRoundData],
            fetchRoundStatus: ProgressStatus.IN_PROGRESS,
          }),
          { programs: [] }
        )
      )
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("displays option to view round's explorer", () => {
    render(
      wrapWithReadProgramContext(
        wrapWithRoundContext(<ViewRoundPage />, {
          data: [mockRoundData],
          fetchRoundStatus: ProgressStatus.IS_SUCCESS,
        })
      )
    );
    const roundExplorer = screen.getByTestId("round-explorer");

    expect(roundExplorer).toBeInTheDocument();
  });
});
