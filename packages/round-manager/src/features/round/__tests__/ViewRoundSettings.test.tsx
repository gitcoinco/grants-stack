/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useNetwork } from "wagmi";
import {
  makeDirectGrantRoundData,
  makeRoundData,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { ProgressStatus, Round } from "../../api/types";
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

jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  useDataLayer: () => ({
    useApplicationsByRoundId: () => {},
  }),
}));

const mockRoundData: Round = makeRoundData();

const mockDirectGrantRoundData: Round = makeDirectGrantRoundData();

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
        wrapWithReadProgramContext(
          wrapWithRoundContext(<ViewRoundPage />, {
            data: [mockRoundData],
            fetchRoundStatus: ProgressStatus.IS_SUCCESS,
          }),
          { programs: [] }
        )
      )
    );
    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const editButton = await screen.findByTestId("edit-round-button");
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
      const cancelButton = await screen.findByTestId("cancel-button");
      expect(cancelButton).toBeInTheDocument();
      const updateRoundButton = await screen.findByTestId(
        "update-round-button"
      );
      expect(updateRoundButton).toBeInTheDocument();
    });
  });

  it("when cancel is clicked, it disables the imputs for editing and hides the update round button and cancel button", async () => {
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

    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const editButton = await screen.findByTestId("edit-round-button");
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
      const cancelButton = await screen.findByTestId("cancel-button");
      expect(cancelButton).toBeInTheDocument();
      const updateRoundButton = await screen.findByTestId(
        "update-round-button"
      );
      expect(updateRoundButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
      expect(cancelButton).not.toBeInTheDocument();
      expect(updateRoundButton).not.toBeInTheDocument();
    });
  });

  it("when update round is clicked, it updates the round name", async () => {
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

    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const editButton = await screen.findByTestId("edit-round-button");
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
      const cancelButton = await screen.findByTestId("cancel-button");
      expect(cancelButton).toBeInTheDocument();
      const updateRoundButton = await screen.findByTestId(
        "update-round-button"
      );
      expect(updateRoundButton).toBeInTheDocument();

      const roundNameInput = screen.queryByTestId("round-name-input");
      expect(roundNameInput).toBeInTheDocument();
      fireEvent.input(roundNameInput!, {
        target: {
          value: "new round name",
        },
      });
      expect(roundNameInput).toHaveValue("new round name");
      fireEvent.click(updateRoundButton);

      await waitFor(() => {
        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      });
    });
  });

  it("adds a requirement successfully", async () => {
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

    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const editButton = await screen.findByTestId("edit-round-button");
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });
  });

  it("removes a requirement successfully", async () => {
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

    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const editButton = await screen.findByTestId("edit-round-button");
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });
  });

  it("round and application periods tab for quadratic funding round settings", async () => {
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

    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const periodTab = await screen.findAllByText(
        "Round & Application Period"
      );
      expect(periodTab.length).toBe(1);
    });
  });

  it("round period tab for direct grant round settings", async () => {
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

    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const periodTab = await screen.findAllByText("Round Period");
      expect(periodTab.length).toBe(1);
    });
  });

  it("round period tab for direct grant round settings does not displays application period inputs", async () => {
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

    act(async () => {
      const roundSettingsTab = await screen.findByTestId("round-settings");
      expect(roundSettingsTab).toBeInTheDocument();
      fireEvent.click(roundSettingsTab);
      const periodTab = await screen.findAllByText("Round Period");
      expect(periodTab.length).toBe(1);
      fireEvent.click(periodTab[0]);
      const applicationPeriodInput = await screen.findAllByText("Application");
      expect(applicationPeriodInput.length).toBe(0);
    });
  });

  it("validates that requirement(s) are not left blank", async () => {
    // todo: implement
  });

  it("validates round start date is greater than today", async () => {
    // todo: implement
  });

  it("validates when a date has passed, you can still select a data in the future", async () => {
    // todo: implement
  });

  it("validates round end date is greater than round start date", async () => {
    // todo: implement
  });

  it("validates applications end date is greater than applications start date", async () => {
    // todo: implement
  });

  it("validates that match amount is greater than previous amount, error message otherwise", async () => {
    // todo: implement
  });

  it("validates that matching cap % is editable when yes is selected and disabled otherwise", async () => {
    // todo: implement
    // todo: shows the amount of the matching cap % in ETH(tokens)
  });

  it("validates that minimum donation threshold amount is editable when yes is selected and disabled otherwise", async () => {
    // todo: implement
    // todo: shows the amount of the minimum donation threshold in USD
  });
});
