/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import ApplicationsByStatus from "../ApplicationsToApproveReject";
import { makeGrantApplicationData } from "../../../test-utils";
import { MemoryRouter } from "react-router-dom";
import {
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "../../../context/application/BulkUpdateGrantApplicationContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ProgressStatus } from "../../api/types";
import { errorModalDelayMs } from "../../../constants";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";
import { AlloOperation, useAllo } from "common";

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: jest.fn(),
}));

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
jest.mock("../../common/useApplicationsByRoundId");
const roundIdOverride = "0x0000000000000000000000000000000000000000";

const grantApplications = [
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
];

grantApplications.forEach((application) => {
  application.status = "PENDING";
});

const bulkUpdateGrantApplications = jest.fn();

function setupInBulkSelectionMode() {
  (useApplicationsByRoundId as jest.Mock).mockReturnValue({
    data: grantApplications,
    isLoading: false,
  });
  renderWithContext(<ApplicationsByStatus />, {});

  const selectButton = screen.getByRole("button", {
    name: /Select/i,
  });
  fireEvent.click(selectButton);
}

describe("<ApplicationsReceived />", () => {
  let mockBulkUpdateApplicationStatus: jest.Mock;
  beforeEach(() => {
    (useApplicationsByRoundId as jest.Mock).mockResolvedValue({
      data: grantApplications,
      isLoading: false,
    });
    mockBulkUpdateApplicationStatus = jest.fn().mockImplementation(() => {
      return new AlloOperation(async () => ({
        type: "success",
      }));
    });
    (useAllo as jest.Mock).mockImplementation(() => ({
      bulkUpdateApplicationStatus: mockBulkUpdateApplicationStatus,
    }));
  });

  it("should display a loading spinner if received applications are loading", () => {
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      isLoading: true,
    });
    renderWithContext(<ApplicationsByStatus />, {});

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when there are no approved applications", () => {
    it("should not display the bulk select option", () => {
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithContext(<ApplicationsByStatus />, {});

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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: grantApplications,
      });
      renderWithContext(<ApplicationsByStatus />);

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
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithContext(<ApplicationsByStatus />);

    expect(screen.queryAllByTestId("application-card")).toHaveLength(0);
  });

  it("renders a card for every project with PENDING status", () => {
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: grantApplications,
    });
    renderWithContext(<ApplicationsByStatus />);

    expect(screen.getAllByTestId("application-card")).toHaveLength(3);
    screen.getByText(grantApplications[0].project!.title);
    screen.getByText(grantApplications[0].project!.description);
    screen.getByText(grantApplications[1].project!.title);
    screen.getByText(grantApplications[1].project!.description);
    screen.getByText(grantApplications[2].project!.title);
    screen.getByText(grantApplications[2].project!.description);
  });

  describe("when choosing select", () => {
    it("renders approve and reject options on each project", () => {
      setupInBulkSelectionMode();

      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(grantApplications.length);
    });

    it("displays an approved button as selected when approve button is selected", () => {
      setupInBulkSelectionMode();

      const approveButton = screen.queryAllByTestId("approve-button")[0];

      fireEvent.click(approveButton);

      expect(approveButton).toHaveClass("bg-teal-400 text-grey-500");
    });

    it("displays a rejected option as selected when reject option is selected", () => {
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      expect(rejectButton).toHaveClass("bg-white text-pink-500");
    });

    describe("and when an approve option is already selected", () => {
      it("selects the reject option and unselects the approve option when the reject option selected", () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        const rejectButton = screen.queryAllByTestId("reject-button")[0];

        fireEvent.click(approveButton);
        fireEvent.click(rejectButton);

        expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500");
        expect(rejectButton).toHaveClass("bg-white text-pink-500");
      });

      it("unselects the approve option when that selected approve option is selected", () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];

        fireEvent.click(approveButton);
        fireEvent.click(approveButton);

        expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500");
      });
    });

    describe("and when an reject option is already selected", () => {
      it("selects the approve button and unselects the reject button when the approve button is selected", () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        const rejectButton = screen.queryAllByTestId("reject-button")[0];

        fireEvent.click(rejectButton);
        fireEvent.click(approveButton);

        expect(approveButton).toHaveClass("bg-teal-400 text-grey-500");
        expect(rejectButton).not.toHaveClass("bg-white text-pink-500");
      });
      it("unselects the reject option when that selected reject option is selected", () => {
        setupInBulkSelectionMode();

        const rejectButton = screen.queryAllByTestId("reject-button")[0];

        fireEvent.click(rejectButton);
        fireEvent.click(rejectButton);

        expect(rejectButton).not.toHaveClass("bg-white text-pink-500");
      });
    });

    it("should approve individual applications independently", () => {
      setupInBulkSelectionMode();

      const firstApproveButton = screen.queryAllByTestId("approve-button")[0];
      fireEvent.click(firstApproveButton);
      expect(firstApproveButton).toHaveClass("bg-teal-400 text-grey-500");

      const secondApproveButton = screen.queryAllByTestId("approve-button")[1];
      fireEvent.click(secondApproveButton);
      expect(secondApproveButton).toHaveClass("bg-teal-400 text-grey-500");
    });

    describe("when at least one application is selected", () => {
      it("displays the continue option and copy", () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        expect(continueButton).toBeInTheDocument();
        expect(
          screen.getByText(/You have selected 1 Grant Applications/i)
        ).toBeInTheDocument();

        const approveButton2 = screen.queryAllByTestId("approve-button")[1];
        fireEvent.click(approveButton2);

        expect(continueButton).toBeInTheDocument();
        expect(
          screen.getByText(/You have selected 2 Grant Applications/i)
        ).toBeInTheDocument();
      });

      it("opens confirmation when continue is selected", async () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      });

      it("shows the correct number of approved and rejected applications in the confirmation modal", async () => {
        setupInBulkSelectionMode();

        fireEvent.click(screen.queryAllByTestId("approve-button")[0]);
        fireEvent.click(screen.queryAllByTestId("reject-button")[1]);
        fireEvent.click(screen.queryAllByTestId("approve-button")[2]);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        const approvedApplicationsCount = screen.getByTestId(
          "approved-applications-count"
        );
        const rejectedApplicationsCount = screen.getByTestId(
          "rejected-applications-count"
        );

        within(approvedApplicationsCount).getByText(/2/);
        within(rejectedApplicationsCount).getByText(/1/);
      });

      it("starts the bulk update process when confirm is selected", async () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        const confirmationModalConfirmButton = screen.getByRole("button", {
          name: /Confirm/i,
        });

        fireEvent.click(confirmationModalConfirmButton);

        expect(mockBulkUpdateApplicationStatus).toBeCalled();

        grantApplications[0].status = "REJECTED";

        const updateApplicationStatusesFirstCall =
          mockBulkUpdateApplicationStatus.mock.calls[0];
        const actualRoundId = updateApplicationStatusesFirstCall[0].roundId;
        expect(actualRoundId).toEqual(roundIdOverride);
      });

      it("closes confirmation when cancel is selected", async () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: grantApplications,
      });

      renderWithContext(<ApplicationsByStatus />, {
        contractUpdatingStatus: ProgressStatus.IS_ERROR,
      });

      // select button
      const selectButton = screen.getByRole("button", { name: /Select/i });
      fireEvent.click(selectButton);

      // select approve on 1 application
      const approveButton = screen.queryAllByTestId("approve-button")[0];
      fireEvent.click(approveButton);

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
  bulkUpdateGrantApplicationStateOverrides: Partial<BulkUpdateGrantApplicationState> = {}
) =>
  render(
    <MemoryRouter>
      <BulkUpdateGrantApplicationContext.Provider
        value={{
          ...initialBulkUpdateGrantApplicationState,
          ...bulkUpdateGrantApplicationStateOverrides,
        }}
      >
        {ui}
      </BulkUpdateGrantApplicationContext.Provider>
    </MemoryRouter>
  );
