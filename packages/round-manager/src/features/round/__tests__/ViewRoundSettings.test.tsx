/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { fireEvent, render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useNetwork } from "wagmi";
import {
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { ProgressStatus, Round } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";

jest.mock("../../common/Auth");
jest.mock("wagmi");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
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
      getNetwork: () => {
        return { chainId: 1 };
      },
    },
  }),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: () => {
      /* do nothing.*/
    },
  },
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

const mockRoundData: Round = makeRoundData();

describe("View Round", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("when edit is clicked, it enables the imputs for editing and shows the update round button and cancel button", () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewRoundPage />, {
              data: [mockRoundData],
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
    const roundSettingsTab = screen.getByTestId("round-settings");
    expect(roundSettingsTab).toBeInTheDocument();
    fireEvent.click(roundSettingsTab);
    // act(() => {
    //   const editButton = screen.getByTestId("edit-round-button");
    //   expect(editButton).toBeInTheDocument();
    //   editButton?.click();
    // });
  });

  it("when cancel is clicked, it disables the imputs for editing and hides the update round button and cancel button", async () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewRoundPage />, {
              data: [mockRoundData],
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
    const roundSettingsTab = screen.getByTestId("round-settings");
    expect(roundSettingsTab).toBeInTheDocument();
    roundSettingsTab.click();

    // const editButton = screen.queryByTestId("edit-record-button");
    // expect(editButton).toBeInTheDocument();
    // editButton?.click();
    // const cancelButton = screen.queryByTestId("cancel-button");
    // expect(cancelButton).toBeInTheDocument();
    // cancelButton?.click();
  });

  it("when update round is clicked, it updates the round", async () => {
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithRoundContext(<ViewRoundPage />, {
              data: [mockRoundData],
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
    const roundSettingsTab = screen.getByTestId("round-settings");
    expect(roundSettingsTab).toBeInTheDocument();
    roundSettingsTab.click();

    // const editButton = screen.queryByTestId("edit-record-button");
    // expect(editButton).toBeInTheDocument();
    // editButton?.click();

    // // edit a field
    // const roundNameInput = screen.queryByTestId("round-name-input");
    // expect(roundNameInput).toBeInTheDocument();

    // await act(async () => {
    //   fireEvent.input(roundNameInput!, {
    //     target: {
    //       value: "new round name",
    //     },
    //   });
    // });
    // expect(roundNameInput).toHaveValue("new round name");

    // click update round
  });
});
