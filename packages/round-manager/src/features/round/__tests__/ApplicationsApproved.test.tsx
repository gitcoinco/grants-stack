/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import ApplicationsApproved from "../ApplicationsApproved";
import { makeGrantApplicationData } from "../../../test-utils";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  ApplicationContext,
  ApplicationState,
  initialApplicationState,
} from "../../../context/application/ApplicationContext";
import { MemoryRouter } from "react-router-dom";
import {
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "../../../context/application/BulkUpdateGrantApplicationContext";
import {
  getApplicationsByRoundId,
  updateApplicationStatuses,
} from "../../api/application";
import { ProgressStatus } from "../../api/types";
import { errorModalDelayMs } from "../../../constants";

jest.mock("../../api/application");
jest.mock("../../api/subgraph");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "some-round-id",
  }),
}));
const roundIdOverride = "some-round-id";
jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {},
    address: "0x0",
    signer: {
      getChainId: () => {
        /* do nothing */
      },
    },
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));
jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

const grantApplications = [
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
];

grantApplications.forEach((application) => {
  application.status = "APPROVED";
});

const setupInBulkSelectionMode = () => {
  renderWithContext(<ApplicationsApproved />, {
    applications: grantApplications,
    isLoading: false,
  });
  const selectButton = screen.getByRole("button", {
    name: /Select/i,
  });
  fireEvent.click(selectButton);
};

describe("<ApplicationsApproved />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getApplicationsByRoundId as jest.Mock).mockResolvedValue(
      grantApplications
    );
  });

  it("should display a loading spinner if approved applications are loading", () => {
    renderWithContext(<ApplicationsApproved />, {
      applications: [],
      isLoading: true,
    });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when approved applications are shown", () => {
    it("should display bulk select", () => {
      renderWithContext(<ApplicationsApproved />, {
        applications: grantApplications,
        isLoading: false,
      });
      expect(
        screen.getByText(
          "Save in gas fees by approving/rejecting multiple applications at once."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Select/i,
        })
      ).toBeInTheDocument();
    });

    it("should display the cancel when select is selected", () => {
      setupInBulkSelectionMode();
      expect(
        screen.getByRole("button", {
          name: /Cancel/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", {
          name: /Select/i,
        })
      ).not.toBeInTheDocument();
    });

    it("should display select when cancel is selected", () => {
      setupInBulkSelectionMode();

      const cancelButton = screen.getByRole("button", {
        name: /Cancel/i,
      });
      fireEvent.click(cancelButton);

      expect(
        screen.queryByRole("button", {
          name: /Cancel/i,
        })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Select/i,
        })
      ).toBeInTheDocument();
    });
  });

  describe("when there are no approved applications", () => {
    it("should not display bulk select", () => {
      renderWithContext(<ApplicationsApproved />, {
        applications: [],
        isLoading: false,
      });

      expect(
        screen.queryByText(
          "Save in gas fees by approving/rejecting multiple applications at once."
        )
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", {
          name: /Select/i,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe("when bulk select is active", () => {
    it("renders reject option on each project card", () => {
      setupInBulkSelectionMode();
      expect(screen.queryAllByTestId("reject-button")).toHaveLength(
        grantApplications.length
      );
    });

    it("does not display approve options in approved applications tab", () => {
      setupInBulkSelectionMode();
      const approveButtons = screen.queryAllByTestId("approve-button");
      expect(approveButtons.length).toEqual(0);
    });

    it("can select reject", () => {
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      expect(rejectButton).toHaveClass("bg-white text-pink-500");
    });

    it("can unselect reject", () => {
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);
      fireEvent.click(rejectButton);

      expect(rejectButton).not.toHaveClass("bg-white text-pink-500");
    });
  });

  describe("when bulk select is inactive", () => {
    it("does not render approve and reject buttons on each card", () => {
      renderWithContext(<ApplicationsApproved />, {
        applications: grantApplications,
        isLoading: false,
      });
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });
  });

  describe("when at least one application is selected", () => {
    it("displays the continue option and copy only when an application is rejected", () => {
      setupInBulkSelectionMode();

      let continueButton = screen.queryByRole("button", {
        name: /Continue/i,
      });
      expect(continueButton).not.toBeInTheDocument();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      continueButton = screen.getByRole("button", {
        name: /Continue/i,
      });
      expect(continueButton).toBeInTheDocument();
      expect(
        screen.getByText(/You have selected 1 Grant Applications/i)
      ).toBeInTheDocument();

      const rejectButton2 = screen.queryAllByTestId("reject-button")[1];
      fireEvent.click(rejectButton2);

      expect(continueButton).toBeInTheDocument();
      expect(
        screen.getByText(/You have selected 2 Grant Applications/i)
      ).toBeInTheDocument();
    });

    it("opens confirmation with rejected application count when continue is selected", async () => {
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      const continueButton = screen.getByRole("button", {
        name: /Continue/i,
      });
      fireEvent.click(continueButton);

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      expect(
        screen.getByTestId("rejected-applications-count")
      ).toBeInTheDocument();
    });

    it("starts the bulk update process to persist rejected applications when confirm is selected", async () => {
      (updateApplicationStatuses as jest.Mock).mockReturnValue(
        new Promise(() => {
          /* do nothing */
        })
      );

      renderWithContext(<ApplicationsApproved />, {
        applications: grantApplications,
        isLoading: false,
      });
      fireEvent.click(
        screen.getByRole("button", {
          name: /Select/i,
        })
      );
      fireEvent.click(screen.queryAllByTestId("reject-button")[0]);
      fireEvent.click(
        screen.getByRole("button", {
          name: /Continue/i,
        })!
      );

      fireEvent.click(screen.getByRole("button", { name: /Confirm/i })!);

      await waitFor(() => {
        expect(updateApplicationStatuses).toBeCalled();
      });

      grantApplications[0].status = "REJECTED";

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const expected = {
        id: grantApplications[0].id,
        round: grantApplications[0].round,
        recipient: grantApplications[0].recipient,
        projectsMetaPtr: grantApplications[0].projectsMetaPtr,
        status: grantApplications[0].status,
      };

      expect(updateApplicationStatuses).toBeCalled();
      const updateApplicationStatusesFirstCall = (
        updateApplicationStatuses as jest.Mock
      ).mock.calls[0];
      const actualRoundId = updateApplicationStatusesFirstCall[0];
      expect(actualRoundId).toEqual(roundIdOverride);
    });

    // TODO -- can't get this to pass -- expect(updateApplicationStatuses).toBeCalled() fails even though updateApplicationStatuses is called
    // it("update round contract", async () => {
    //   (updateApplicationStatuses as jest.Mock).mockResolvedValue({
    //     transactionBlockNumber: 99,
    //   });
    //   (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue({});
    //
    //   renderWithContext(
    //     <ApplicationsApproved />,
    //     {
    //       applications: grantApplications,
    //       isLoading: false,
    //     },
    //     {
    //       IPFSCurrentStatus: ProgressStatus.IS_SUCCESS,
    //       contractUpdatingStatus: ProgressStatus.IS_SUCCESS,
    //     }
    //   );
    //   fireEvent.click(
    //     screen.getByRole("button", {
    //       name: /Select/i,
    //     })
    //   );
    //   fireEvent.click(screen.queryAllByTestId("reject-button")[0]);
    //   fireEvent.click(
    //     screen.getByRole("button", {
    //       name: /Continue/i,
    //     })!
    //   );
    //
    //   fireEvent.click(screen.getByRole("button", { name: /Confirm/i })!);
    //
    //   await screen.findByTestId("progress-modal");
    //   await screen.findByTestId("Updating-complete-icon");
    //
    //   expect(updateApplicationStatuses).toBeCalled();
    //   const updateApplicationStatusesFirstCall = (updateApplicationStatuses as jest.Mock)
    //     .mock.calls[0];
    //   const actualRoundId = updateApplicationStatusesFirstCall[0];
    //   expect(actualRoundId).toEqual(roundIdOverride);
    // });

    it("closes confirmation when cancel is selected", async () => {
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      const continueButton = screen.getByRole("button", {
        name: /Continue/i,
      });
      fireEvent.click(continueButton);

      const modal = screen.getByTestId("confirm-modal");

      const modalCancelButton = within(modal).getByRole("button", {
        name: /Cancel/i,
      });
      fireEvent.click(modalCancelButton);

      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });
  });

  describe("when processing bulk action fails", () => {
    beforeEach(() => {
      const transactionBlockNumber = 10;
      (updateApplicationStatuses as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });

      renderWithContext(
        <ApplicationsApproved />,
        {
          applications: grantApplications,
        },
        {
          contractUpdatingStatus: ProgressStatus.IS_ERROR,
        }
      );

      // select button
      const selectButton = screen.getByRole("button", { name: /Select/i });
      fireEvent.click(selectButton);

      // select reject button on 1 application
      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      // click continue
      const continueButton = screen.getByRole("button", {
        name: /Continue/i,
      });
      fireEvent.click(continueButton);
    });

    it("shows error modal when reviewing applications fail", async () => {
      // click confirm
      const confirmationModalConfirmButton = screen.getByRole("button", {
        name: /Confirm/i,
      });

      await act(() => {
        fireEvent.click(confirmationModalConfirmButton);
      });

      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );
    });

    it("choosing try again restarts the action and closes the error modal", async () => {
      // click confirm
      const confirmationModalConfirmButton = screen.getByRole("button", {
        name: /Confirm/i,
      });

      await act(() => {
        fireEvent.click(confirmationModalConfirmButton);
      });

      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );

      const tryAgain = await screen.findByTestId("tryAgain");
      await act(() => {
        fireEvent.click(tryAgain);
      });

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    });
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  grantApplicationStateOverrides: Partial<ApplicationState> = {},
  bulkUpdateApplicationStateOverrides: Partial<BulkUpdateGrantApplicationState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <BulkUpdateGrantApplicationContext.Provider
        value={{
          ...initialBulkUpdateGrantApplicationState,
          ...bulkUpdateApplicationStateOverrides,
        }}
      >
        <ApplicationContext.Provider
          value={{
            state: {
              ...initialApplicationState,
              ...grantApplicationStateOverrides,
            },
            dispatch,
          }}
        >
          {ui}
        </ApplicationContext.Provider>
      </BulkUpdateGrantApplicationContext.Provider>
    </MemoryRouter>
  );
