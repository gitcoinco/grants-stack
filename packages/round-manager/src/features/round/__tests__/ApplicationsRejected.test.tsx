/* eslint-disable @typescript-eslint/no-explicit-any */
import ApplicationsRejected from "../ApplicationsRejected";
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
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "../../../context/application/BulkUpdateGrantApplicationContext";
import { MemoryRouter } from "react-router-dom";
import { ProgressStatus } from "../../api/types";
import { errorModalDelayMs } from "../../../constants";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";
import { AlloOperation, useAllo } from "common";

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: jest.fn(),
}));

jest.mock("../../api/application");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "some-round-id",
  }),
}));
const roundIdOverride = "some-round-id";

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: { id: 1 },
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

jest.mock("../../common/useApplicationsByRoundId");

const grantApplications = [
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
];

grantApplications.forEach((application) => {
  application.status = "REJECTED";
});

const bulkUpdateGrantApplications = jest.fn();

function setupInBulkSelectionMode() {
  renderWithContext(<ApplicationsRejected />, {
    applications: grantApplications,
  });

  const select = screen.getByTestId("select");
  fireEvent.click(select);
}

describe("<ApplicationsRejected />", () => {
  let mockBulkUpdateApplicationStatus: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: grantApplications,
      error: undefined,
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

  it("should display a loading spinner if rejected applications are loading", () => {
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: true,
    });

    renderWithContext(<ApplicationsRejected />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when rejected applications are shown", () => {
    it("should display bulk select", () => {
      renderWithContext(<ApplicationsRejected />, {
        applications: grantApplications,
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

    it("should display the cancel option when select is selected", () => {
      renderWithContext(<ApplicationsRejected />, {
        applications: grantApplications,
      });

      const selectButton = screen.getByRole("button", {
        name: /Select/i,
      });
      fireEvent.click(selectButton);
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
      renderWithContext(<ApplicationsRejected />, {
        applications: grantApplications,
      });

      const selectButton = screen.getByRole("button", {
        name: /Select/i,
      });
      fireEvent.click(selectButton);

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
    it("should not display the bulk select option", () => {
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [],
        error: undefined,
        isLoading: false,
      });

      renderWithContext(<ApplicationsRejected />);

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
    it("renders approve buttons on each project card and does not display reject options", () => {
      setupInBulkSelectionMode();

      expect(screen.queryAllByTestId("approve-button")).toHaveLength(
        grantApplications.length
      );

      const rejectButtons = screen.queryAllByTestId("reject-button");
      expect(rejectButtons.length).toEqual(0);
    });

    it("selects an approved option", () => {
      setupInBulkSelectionMode();

      const approveButton = screen.queryAllByTestId("approve-button")[0];
      fireEvent.click(approveButton);

      expect(approveButton).toHaveClass("bg-teal-400 text-grey-500");
    });

    it("unselects an approve option", () => {
      setupInBulkSelectionMode();

      const approveButton = screen.queryAllByTestId("approve-button")[0];
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);

      expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500");
    });

    describe("when at least one application is selected", () => {
      it("displays the continue option and copy after an application is approved", () => {
        setupInBulkSelectionMode();

        let continueButton = screen.queryByRole("button", {
          name: /Continue/i,
        });

        expect(continueButton).not.toBeInTheDocument();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        continueButton = screen.getByRole("button", {
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

      it("opens confirmation with approved application count when the continue is selected", async () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
        expect(
          screen.getByTestId("approved-applications-count")
        ).toBeInTheDocument();
      });

      it("starts the bulk update process to persist approved applications when confirm is selected", async () => {
        renderWithContext(<ApplicationsRejected />, {
          applications: grantApplications,
        });

        fireEvent.click(screen.getByTestId("select"));
        fireEvent.click(screen.queryAllByTestId("approve-button")[0]);
        fireEvent.click(
          screen.getByRole("button", {
            name: /Continue/i,
          }) as HTMLButtonElement
        );
        fireEvent.click(
          screen.getByRole("button", {
            name: /Confirm/i,
          }) as HTMLButtonElement
        );

        await waitFor(() => {
          expect(mockBulkUpdateApplicationStatus).toBeCalled();
        });

        grantApplications[0].status = "APPROVED";

        const updateApplicationStatusesFirstCall = (
          mockBulkUpdateApplicationStatus as jest.Mock
        ).mock.calls[0];
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

    describe("when processing bulk action fails", () => {
      beforeEach(() => {
        renderWithContext(<ApplicationsRejected />, {
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
            expect(
              await screen.findByTestId("error-modal")
            ).toBeInTheDocument(),
          { timeout: errorModalDelayMs + 1000 }
        );
      });

      it("choosing done closes the error modal", async () => {
        await screen.findByTestId("error-modal");

        const done = await screen.findByTestId("done");
        await act(() => {
          fireEvent.click(done);
        });

        expect(
          await screen.queryByTestId("error-modal")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("when bulk select is inactive", () => {
    it("does not render approve and reject buttons on each card", () => {
      renderWithContext(<ApplicationsRejected />);
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  bulkUpdateApplicationStateOverrides: Partial<BulkUpdateGrantApplicationState> = {}
) =>
  render(
    <MemoryRouter>
      <BulkUpdateGrantApplicationContext.Provider
        value={{
          ...initialBulkUpdateGrantApplicationState,
          ...bulkUpdateApplicationStateOverrides,
        }}
      >
        {ui}
      </BulkUpdateGrantApplicationContext.Provider>
    </MemoryRouter>
  );
