/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useDisconnect, useNetwork } from "wagmi";
import {
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { Round } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";

jest.mock("../../common/Auth");
jest.mock("wagmi");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: mockRoundData.operatorWallets![0],
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: () => {
      /* do nothing.*/
    },
  },
});

const mockRoundData: Round = makeRoundData();

describe("View Round", () => {
  beforeEach(() => {
    (useNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("when edit is clicked, it enables the imputs for editing and shows the update round button and cancel button", () => {
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

    const roundSettingsTab = screen.getByText(/Round Settings/i);
    roundSettingsTab.click();
    const editButton = screen.queryByTestId("edit-record-button");
    editButton?.click();
  });

  it("when cancel is clicked, it disables the imputs for editing and hides the update round button and cancel button", () => {
    render(
      wrapWithApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(
            wrapWithBulkUpdateGrantApplicationContext(<ViewRoundPage />)
          )
        )
      )
    );
    const roundSettingsTab = screen.getByText(/Round Settings/i);
    expect(roundSettingsTab).toBeInTheDocument();
    roundSettingsTab.click();
    const editButton = screen.queryByTestId("edit-record-button");
    editButton?.click();
    const cancelButton = screen.queryByTestId("cancel-button");
    cancelButton?.click();
  });

  it.only("when update round is clicked, it updates the round", async () => {
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

    const roundSettingsTab = screen.getByText(/Round Settings/i);
    expect(roundSettingsTab).toBeInTheDocument();
    roundSettingsTab.click();
    const editButton = screen.queryByTestId("edit-record-button");
    editButton?.click();
    // edit a field
    const roundNameInput = screen.getByTestId("round-name-input");
    await act(async () => {
      fireEvent.input(roundNameInput, {
        target: {
          value: "new round name",
        },
      });
    });
    expect(roundNameInput).toHaveValue("new round name");

    // click update round
  });
});
