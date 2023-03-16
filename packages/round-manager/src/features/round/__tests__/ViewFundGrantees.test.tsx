/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { render, screen } from "@testing-library/react";
import ViewFundGrantees from "../ViewFundGrantees";
import { GrantApplication, ProgressStatus, Round } from "../../api/types";
import {
  makeGrantApplicationData,
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { useParams } from "react-router-dom";

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
  useRoundMatchData: jest.fn(),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

describe("View Fund Grantees", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("displays non finalized status when round is not finalized", () => {
    (useParams as jest.Mock).mockReturnValueOnce({
      id: undefined,
    });

    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewFundGrantees finalized={false} />, {
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

  it("displays finalized status when round is finalized", () => {
    (useParams as jest.Mock).mockReturnValueOnce({
      id: undefined,
    });

    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewFundGrantees finalized={true} />, {
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

    expect(screen.getByText("Unpaid Grantees")).toBeInTheDocument();
    expect(screen.getByText("Paid Grantees")).toBeInTheDocument();
  });
});
