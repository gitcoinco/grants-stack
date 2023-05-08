/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import {
    makeRoundData,
    wrapWithApplicationContext,
    wrapWithBulkUpdateGrantApplicationContext,
    wrapWithReadProgramContext,
    wrapWithRoundContext
} from "../../../test-utils";
import { Round } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";

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

describe("View Round", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  // todo: add edit tests
  it("renders the Round Settings tab", () => {
    render(
      wrapWithApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(
            wrapWithBulkUpdateGrantApplicationContext(<ViewRoundPage />)
          )
        )
      )
    );

    expect(screen.getByText(/Round Settings/i)).toBeInTheDocument();
  })
});
