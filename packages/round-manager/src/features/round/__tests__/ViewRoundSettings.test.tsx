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
    fireEvent.click(screen.getByTestId("round-settings"));
    const editButton = screen.queryByTestId("edit-record-button");
    expect(editButton).toBeInTheDocument();
    editButton?.click();
  });

  it("when cancel is clicked, it disables the imputs for editing and hides the update round button and cancel button", async () => {
    render(
      wrapWithApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(
            wrapWithBulkUpdateGrantApplicationContext(<ViewRoundPage />)
          )
        )
      )
    );
    fireEvent.click(screen.getByTestId("round-settings"));
    const editButton = screen.queryByTestId("edit-record-button");
    expect(editButton).toBeInTheDocument();
    editButton?.click();
    const cancelButton = screen.queryByTestId("cancel-button");
    expect(cancelButton).toBeInTheDocument();
    cancelButton?.click();
  });

  it("when update round is clicked, it updates the round", async () => {
    render(
      wrapWithApplicationContext(
        wrapWithReadProgramContext(
          wrapWithRoundContext(
            wrapWithBulkUpdateGrantApplicationContext(<ViewRoundPage />)
          )
        )
      )
    );
    fireEvent.click(screen.getByTestId("round-settings"));

    const editButton = screen.queryByTestId("edit-record-button");
    expect(editButton).toBeInTheDocument();
    editButton?.click();

    // edit a field
    const roundNameInput = screen.queryByTestId("round-name-input");
    expect(roundNameInput).toBeInTheDocument();

    await act(async () => {
      fireEvent.input(roundNameInput!, {
        target: {
          value: "new round name",
        },
      });
    });
    expect(roundNameInput).toHaveValue("new round name");

    // click update round
  });
});
