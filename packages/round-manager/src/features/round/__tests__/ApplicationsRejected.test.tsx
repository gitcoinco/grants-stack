/* eslint-disable @typescript-eslint/no-explicit-any */
import ApplicationsRejected from "../ApplicationsRejected.tsx.old";
import { makeGrantApplicationData } from "../../../test-utils";
import {
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
import {
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "../../../context/application/BulkUpdateGrantApplicationContext";
import { MemoryRouter } from "react-router-dom";
import {
  getApplicationsByRoundId,
  updateApplicationList,
  updateRoundContract,
} from "../../api/application";
import { ProgressStatus } from "../../api/types";

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
    isLoading: false,
  });

  const select = screen.getByTestId("select");
  fireEvent.click(select);
}

describe("<ApplicationsRejected />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getApplicationsByRoundId as jest.Mock).mockResolvedValue(
      grantApplications
    );
  });

  it("should display a loading spinner if rejected applications are loading", () => {
    renderWithContext(<ApplicationsRejected />, {
      applications: [],
      isLoading: true,
    });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when rejected applications are shown", () => {
    it("should display bulk select", () => {
      renderWithContext(<ApplicationsRejected />, {
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

    it("should display the cancel option when select is selected", () => {
      renderWithContext(<ApplicationsRejected />, {
        applications: grantApplications,
        isLoading: false,
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
        isLoading: false,
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
      renderWithContext(<ApplicationsRejected />, {
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
        (updateApplicationList as jest.Mock).mockResolvedValue("");
        (updateRoundContract as jest.Mock).mockReturnValue(
          new Promise(() => {
            /* do nothing */
          })
        );

        renderWithContext(
          <ApplicationsRejected />,
          {
            applications: grantApplications,
            isLoading: false,
          },
          {
            IPFSCurrentStatus: ProgressStatus.IS_SUCCESS,
          }
        );

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
          expect(updateApplicationList).toBeCalled();
        });

        await waitFor(() => {
          expect(updateRoundContract).toBeCalled();
        });

        grantApplications[0].status = "APPROVED";

        const expected = {
          id: grantApplications[0].id,
          round: grantApplications[0].round,
          recipient: grantApplications[0].recipient,
          projectsMetaPtr: grantApplications[0].projectsMetaPtr,
          status: grantApplications[0].status,
        };

        expect(updateApplicationList).toBeCalled();
        const updateApplicationListFirstCall = (
          updateApplicationList as jest.Mock
        ).mock.calls[0];
        const actualApplicationsUpdated = updateApplicationListFirstCall[0];
        expect(actualApplicationsUpdated).toEqual([expected]);

        expect(updateRoundContract).toBeCalled();
        const updateRoundContractFirstCall = (updateRoundContract as jest.Mock)
          .mock.calls[0];
        const actualRoundId = updateRoundContractFirstCall[0];
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

  describe("when bulk select is inactive", () => {
    it("does not render approve and reject buttons on each card", () => {
      renderWithContext(<ApplicationsRejected />, {
        applications: grantApplications,
        isLoading: false,
      });
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  grantApplicationStateOverrides: Partial<ApplicationState> = {},
  bulkUpdateApplicationStateOverrides: Partial<BulkUpdateGrantApplicationState> = {},
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
