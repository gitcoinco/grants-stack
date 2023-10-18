/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import ApplicationsByStatus from "../ApplicationsToReview";
import { makeGrantApplicationData } from "../../../test-utils";
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
  updatePayoutApplicationStatuses,
} from "../../api/application";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ApplicationStatus, ProgressStatus } from "../../api/types";
import { errorModalDelayMs } from "../../../constants";
import { ROUND_PAYOUT_DIRECT } from "../../common/Utils";

jest.mock("../../api/application");
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
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "0x0000000000000000000000000000000000000000",
  }),
}));
const roundIdOverride = "0x0000000000000000000000000000000000000000";
const payoutStrategyId = "0x01";
const grantApplications = [
  makeGrantApplicationData({
    roundIdOverride,
    payoutStrategy: {
      id: payoutStrategyId,
      strategyName: ROUND_PAYOUT_DIRECT,
      payouts: [],
    },
  }),
  makeGrantApplicationData({
    roundIdOverride,
    payoutStrategy: {
      id: payoutStrategyId,
      strategyName: ROUND_PAYOUT_DIRECT,
      payouts: [],
    },
  }),
  makeGrantApplicationData({
    roundIdOverride,
    payoutStrategy: {
      id: payoutStrategyId,
      strategyName: ROUND_PAYOUT_DIRECT,
      payouts: [],
    },
  }),
];

grantApplications.forEach((application) => {
  application.status = "PENDING";
});

const bulkUpdateGrantApplications = jest.fn();

function setupInBulkSelectionMode() {
  renderWithContext(<ApplicationsByStatus />, {
    applications: grantApplications,
    isLoading: false,
  });

  const selectButton = screen.getByRole("button", {
    name: /Select/i,
  });
  fireEvent.click(selectButton);
}

describe("<ApplicationsReceived />", () => {
  beforeEach(() => {
    (getApplicationsByRoundId as jest.Mock).mockResolvedValue(
      grantApplications
    );
  });

  it("should display a loading spinner if received applications are loading", () => {
    renderWithContext(<ApplicationsByStatus />, {
      applications: [],
      isLoading: true,
    });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when there are no approved applications", () => {
    it("should not display the bulk select option", () => {
      renderWithContext(<ApplicationsByStatus />, {
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

  describe("when received applications are shown", () => {
    it("should display the bulk select option", () => {
      renderWithContext(<ApplicationsByStatus />, {
        applications: grantApplications,
        isLoading: false,
      });

      expect(
        screen.getByText(
          'Save in gas fees by moving multiple applications to "In Review" state at once.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Select/i,
        })
      ).toBeInTheDocument();
    });

    it("should display the cancel option when select is selected", () => {
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

    it("should display the select option when cancel is selected", () => {
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

  it("renders no cards when there are no projects", () => {
    renderWithContext(<ApplicationsByStatus />, {
      applications: [],
      isLoading: false,
    });

    expect(screen.queryAllByTestId("application-card")).toHaveLength(0);
  });

  it("renders a card for every project with PENDING status", () => {
    renderWithContext(<ApplicationsByStatus />, {
      applications: grantApplications,
      isLoading: false,
    });

    expect(screen.getAllByTestId("application-card")).toHaveLength(3);
    screen.getByText(grantApplications[0].project!.title);
    screen.getByText(grantApplications[0].project!.description);
    screen.getByText(grantApplications[1].project!.title);
    screen.getByText(grantApplications[1].project!.description);
    screen.getByText(grantApplications[2].project!.title);
    screen.getByText(grantApplications[2].project!.description);
  });

  describe("when choosing select", () => {
    it("renders move to in review option on each project", () => {
      setupInBulkSelectionMode();

      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(grantApplications.length);
    });

    it("displays an in-review button as selected when approve button is selected", () => {
      setupInBulkSelectionMode();

      const inReviewButton = screen.queryAllByTestId("in-review-button")[0];

      fireEvent.click(inReviewButton);

      expect(inReviewButton).toHaveClass("bg-teal-400 text-grey-500");
    });

    describe("and when an in-review option is already selected", () => {
      it("unselects the in-review option when that selected approve option is selected", () => {
        setupInBulkSelectionMode();

        const inReviewButton = screen.queryAllByTestId("in-review-button")[0];

        fireEvent.click(inReviewButton);
        fireEvent.click(inReviewButton);

        expect(inReviewButton).not.toHaveClass("bg-teal-400 text-grey-500");
      });
    });

    it("should move to in-review individual applications independently", () => {
      setupInBulkSelectionMode();

      const firstinReviewButton =
        screen.queryAllByTestId("in-review-button")[0];
      fireEvent.click(firstinReviewButton);
      expect(firstinReviewButton).toHaveClass("bg-teal-400 text-grey-500");

      const secondinReviewButton =
        screen.queryAllByTestId("in-review-button")[1];
      fireEvent.click(secondinReviewButton);
      expect(secondinReviewButton).toHaveClass("bg-teal-400 text-grey-500");
    });

    describe("when at least one application is selected", () => {
      it("displays the continue option and copy", () => {
        setupInBulkSelectionMode();

        const inReviewButton = screen.queryAllByTestId("in-review-button")[0];
        fireEvent.click(inReviewButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        expect(continueButton).toBeInTheDocument();
        expect(
          screen.getByText(/You have selected 1 Grant Applications/i)
        ).toBeInTheDocument();

        const inReviewButton2 = screen.queryAllByTestId("in-review-button")[1];
        fireEvent.click(inReviewButton2);

        expect(continueButton).toBeInTheDocument();
        expect(
          screen.getByText(/You have selected 2 Grant Applications/i)
        ).toBeInTheDocument();
      });

      it("opens confirmation when continue is selected", async () => {
        setupInBulkSelectionMode();

        const inReviewButton = screen.queryAllByTestId("in-review-button")[0];
        fireEvent.click(inReviewButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      });

      it("shows the correct number of selected applications in the confirmation modal", async () => {
        setupInBulkSelectionMode();

        fireEvent.click(screen.queryAllByTestId("in-review-button")[0]);
        fireEvent.click(screen.queryAllByTestId("in-review-button")[2]);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        const message = screen.getByTestId(
          "move-in-review-selected-applications-message"
        );

        within(message).getByText(/2/);
      });

      it("starts the bulk update process when confirm is selected", async () => {
        (updatePayoutApplicationStatuses as jest.Mock).mockResolvedValue("");
        setupInBulkSelectionMode();

        const inReviewButton = screen.queryAllByTestId("in-review-button")[0];
        fireEvent.click(inReviewButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        const confirmationModalConfirmButton = screen.getByRole("button", {
          name: /Confirm/i,
        });

        fireEvent.click(confirmationModalConfirmButton);

        await waitFor(() => {
          expect(updatePayoutApplicationStatuses).toBeCalled();
        });

        expect(updatePayoutApplicationStatuses).toBeCalled();
        const calls = (updatePayoutApplicationStatuses as jest.Mock).mock.calls;
        expect(calls[0][0]).toEqual(payoutStrategyId);
      });

      it("closes confirmation when cancel is selected", async () => {
        setupInBulkSelectionMode();

        const inReviewButton = screen.queryAllByTestId("in-review-button")[0];
        fireEvent.click(inReviewButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        const modal = screen.getByTestId("confirm-modal");

        const modalCancelButton = within(modal).getByRole("button", {
          name: /Cancel/i,
        });
        fireEvent.click(modalCancelButton);

        expect(bulkUpdateGrantApplications).not.toBeCalled();

        expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("when bulkSelect is false", () => {
    it("does not render approve and reject options on each card", () => {
      renderWithContext(<ApplicationsByStatus />);
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });
  });

  describe("when processing bulk action fails", () => {
    beforeEach(() => {
      const transactionBlockNumber = 10;
      (updatePayoutApplicationStatuses as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });

      renderWithContext(
        <ApplicationsByStatus />,
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

      // select approve on 1 application
      const inReviewButton = screen.queryAllByTestId("in-review-button")[0];
      fireEvent.click(inReviewButton);

      // click continue
      const continueButton = screen.getByRole("button", {
        name: /Continue/i,
      });
      fireEvent.click(continueButton);

      // click confirm
      const confirmationModalConfirmButton = screen.getByRole("button", {
        name: /Confirm/i,
      });
      fireEvent.click(confirmationModalConfirmButton);
    });

    it("shows error modal when reviewing applications fail", async () => {
      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );
    });

    it("choosing done closes the error modal", async () => {
      await screen.findByTestId("error-modal");

      const done = await screen.findByTestId("done");
      await act(() => {
        fireEvent.click(done);
      });

      expect(await screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    });
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  grantApplicationStateOverrides: Partial<ApplicationState> = {},
  bulkUpdateGrantApplicationStateOverrides: Partial<BulkUpdateGrantApplicationState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <BulkUpdateGrantApplicationContext.Provider
        value={{
          ...initialBulkUpdateGrantApplicationState,
          ...bulkUpdateGrantApplicationStateOverrides,
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
