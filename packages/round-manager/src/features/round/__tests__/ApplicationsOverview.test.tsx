/* eslint-disable @typescript-eslint/no-explicit-any */
import ApplicationsOverview from "../ApplicationsOverview";
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
import { ApplicationStatus, ProgressStatus } from "../../api/types";

Object.defineProperty(window, 'location', {
  configurable: true,
  value: { reload: jest.fn() },
});

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

const rejectedGrantApplications = [
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
];

rejectedGrantApplications.forEach((application) => {
  application.status = "REJECTED";
});

const approvedGrantApplications = [
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
];

approvedGrantApplications.forEach((application) => {
  application.status = "APPROVED";
});

const pendingGrantApplications = [
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
  makeGrantApplicationData({ roundIdOverride }),
];

pendingGrantApplications.forEach((application) => {
  application.status = "PENDING";
});

const bulkUpdateGrantApplications = jest.fn();

function setupInBulkSelectionModeRejected() {
  renderWithContext(
    <ApplicationsOverview
      id={roundIdOverride}
      applications={rejectedGrantApplications}
      isLoading={false}
      applicationStatus={ApplicationStatus.REJECTED}
    />);

  const select = screen.getByTestId("select");
  fireEvent.click(select);
}

function setupInBulkSelectionModeApproved() {
  renderWithContext(
    <ApplicationsOverview
      id={roundIdOverride}
      applications={approvedGrantApplications}
      isLoading={false}
      applicationStatus={ApplicationStatus.APPROVED}
    />);

  const select = screen.getByTestId("select");
  fireEvent.click(select);
}

function setupInBulkSelectionModePending() {
  renderWithContext(
    <ApplicationsOverview
      id={roundIdOverride}
      applications={pendingGrantApplications}
      isLoading={false}
      applicationStatus={ApplicationStatus.PENDING}
    />);

  const select = screen.getByTestId("select");
  fireEvent.click(select);
}



describe("<ApplicationsOverview />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getApplicationsByRoundId as jest.Mock).mockResolvedValue(
      rejectedGrantApplications
    );
    (getApplicationsByRoundId as jest.Mock).mockResolvedValue(
      approvedGrantApplications
    );
  });

  it("REJECTED: should display a loading spinner if rejected applications are loading", () => {
    renderWithContext(
      <ApplicationsOverview
        id={roundIdOverride}
        applications={[]}
        isLoading={true}
        applicationStatus={ApplicationStatus.REJECTED}
      />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("APPROVED: should display a loading spinner if approved applications are loading", () => {
    renderWithContext(
      <ApplicationsOverview
        id={roundIdOverride}
        applications={[]}
        isLoading={true}
        applicationStatus={ApplicationStatus.APPROVED}
      />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("PENDING: should display a loading spinner if pending applications are loading", () => {
    renderWithContext(
      <ApplicationsOverview
        id={roundIdOverride}
        applications={[]}
        isLoading={true}
        applicationStatus={ApplicationStatus.PENDING}
      />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when applications are shown", () => {
    it("REJECTED: should display bulk select", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={rejectedGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.REJECTED}
        />);
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

    it("APPROVED: should display bulk select", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={approvedGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.APPROVED}
        />);
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

    it("PENDING: should display bulk select", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={pendingGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.PENDING}
        />);
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

    it("REJECTED: should display the cancel option when select is selected", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={rejectedGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.REJECTED}
        />);

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

    it("APPROVED: should display the cancel option when select is selected", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={approvedGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.APPROVED}
        />);

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

    it("PENDING: should display the cancel option when select is selected", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={pendingGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.PENDING}
        />);

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

    it("REJECTED: should display the select option when cancel is selected", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={rejectedGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.REJECTED}
        />);

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

    it("APPROVED: should display the select option when cancel is selected", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={approvedGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.APPROVED}
        />);

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

    it("PENDING: should display the select option when cancel is selected", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={pendingGrantApplications}
          isLoading={false}
          applicationStatus={ApplicationStatus.PENDING}
        />);

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
    it("REJECTED: should not display the bulk select option", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={[]}
          isLoading={false}
          applicationStatus={ApplicationStatus.REJECTED}
        />);

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

    it("APPROVED: should not display the bulk select option", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={[]}
          isLoading={false}
          applicationStatus={ApplicationStatus.APPROVED}
        />);

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

    it("PENDING: should not display the bulk select option", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={[]}
          isLoading={false}
          applicationStatus={ApplicationStatus.PENDING}
        />);

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
    it("REJECTED: renders approve buttons on each project card and does not display reject options", () => {
      setupInBulkSelectionModeRejected();

      expect(screen.queryAllByTestId("approve-button")).toHaveLength(
        rejectedGrantApplications.length
      );

      const rejectButtons = screen.queryAllByTestId("reject-button");
      expect(rejectButtons.length).toEqual(0);
    });

    it("APPROVED: renders reject option on each project card", () => {
      setupInBulkSelectionModeApproved();
      expect(screen.queryAllByTestId("reject-button")).toHaveLength(
        approvedGrantApplications.length
      );
    });

    it("APPROVED: does not display approve options in approved applications tab", () => {
      setupInBulkSelectionModeApproved();
      const approveButtons = screen.queryAllByTestId("approve-button");
      expect(approveButtons.length).toEqual(0);
    });

    it("REJECTED: selects an approved option", () => {
      setupInBulkSelectionModeRejected();

      const approveButton = screen.queryAllByTestId("approve-button")[0];
      fireEvent.click(approveButton);

      expect(approveButton).toHaveClass("bg-teal-400 text-grey-500");
    });

    it("REJECTED: unselects an approve option", () => {
      setupInBulkSelectionModeRejected();

      const approveButton = screen.queryAllByTestId("approve-button")[0];
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);

      expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500");
    });

    it("APPROVED: can select reject", () => {
      setupInBulkSelectionModeApproved();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      expect(rejectButton).toHaveClass("bg-white text-pink-500");
    });

    it("APPROVED: can unselect reject", () => {
      setupInBulkSelectionModeApproved();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);
      fireEvent.click(rejectButton);

      expect(rejectButton).not.toHaveClass("bg-white text-pink-500");
    });

    describe("when at least one application is selected", () => {
      it("REJECTED: displays the continue option and copy after an application is approved", () => {
        setupInBulkSelectionModeRejected();

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

      it("APPROVED: displays the continue option and copy only when an application is rejected", () => {
        setupInBulkSelectionModeApproved();
  
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

      it("PENDING: displays the continue option and copy", () => {
        setupInBulkSelectionModePending();

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

      it("REJECTED: opens confirmation with approved application count when the continue is selected", async () => {
        setupInBulkSelectionModeRejected();

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

      it("APPROVED: opens confirmation with rejected application count when continue is selected", async () => {
        setupInBulkSelectionModeApproved();
  
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

      it("PENDING: opens confirmation when continue is selected", async () => {
        setupInBulkSelectionModePending();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      });

      it("PENDING: shows the correct number of approved and rejected applications in the confirmation modal", async () => {
        setupInBulkSelectionModePending();

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

      it("REJECTED: starts the bulk update process to persist approved applications when confirm is selected", async () => {
        (updateApplicationList as jest.Mock).mockResolvedValue("");
        (updateRoundContract as jest.Mock).mockReturnValue(
          new Promise(() => {
            /* do nothing */
          })
        );


        renderWithContext(
          <ApplicationsOverview
            id={roundIdOverride}
            applications={rejectedGrantApplications}
            isLoading={false}
            applicationStatus={ApplicationStatus.REJECTED}
          />, {}, {
          IPFSCurrentStatus: ProgressStatus.IS_SUCCESS,
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
          expect(updateApplicationList).toBeCalled();
        });

        await waitFor(() => {
          expect(updateRoundContract).toBeCalled();
        });

        rejectedGrantApplications[0].status = "APPROVED";

        const expected = {
          id: rejectedGrantApplications[0].id,
          round: rejectedGrantApplications[0].round,
          recipient: rejectedGrantApplications[0].recipient,
          projectsMetaPtr: rejectedGrantApplications[0].projectsMetaPtr,
          status: rejectedGrantApplications[0].status,
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

      it("APPROVED: starts the bulk update process to persist rejected applications when confirm is selected", async () => {
        (updateApplicationList as jest.Mock).mockResolvedValue("");
        (updateRoundContract as jest.Mock).mockReturnValue(
          new Promise(() => {
            /* do nothing */
          })
        );
  
          renderWithContext(
            <ApplicationsOverview
              id={roundIdOverride}
              applications={approvedGrantApplications}
              isLoading={false}
              applicationStatus={ApplicationStatus.APPROVED}
            />, {}, {
            IPFSCurrentStatus: ProgressStatus.IS_SUCCESS,
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
          expect(updateApplicationList).toBeCalled();
        });
  
        await waitFor(() => {
          expect(updateRoundContract).toBeCalled();
        });
  
        approvedGrantApplications[0].status = "REJECTED";
  
        const expected = {
          id: approvedGrantApplications[0].id,
          round: approvedGrantApplications[0].round,
          recipient: approvedGrantApplications[0].recipient,
          projectsMetaPtr: approvedGrantApplications[0].projectsMetaPtr,
          status: approvedGrantApplications[0].status,
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

      it("PENDING: starts the bulk update process when confirm is selected", async () => {
        (updateApplicationList as jest.Mock).mockResolvedValue("");
        (updateRoundContract as jest.Mock).mockResolvedValue("");
        setupInBulkSelectionModePending();

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

        await waitFor(() => {
          expect(updateApplicationList).toBeCalled();
        });

        await waitFor(() => {
          expect(updateRoundContract).toBeCalled();
        });

        const updateApplicationListFirstCall = (
          updateApplicationList as jest.Mock
        ).mock.calls[0];
        const actualApplicationsUpdated = updateApplicationListFirstCall[0];
        expect(actualApplicationsUpdated).toEqual([
          {
            id: pendingGrantApplications[0].id,
            round: pendingGrantApplications[0].round,
            recipient: pendingGrantApplications[0].recipient,
            projectsMetaPtr: pendingGrantApplications[0].projectsMetaPtr,
            status: ApplicationStatus.APPROVED,
          },
        ]);

        expect(updateRoundContract).toBeCalled();
        const updateRoundContractFirstCall = (updateRoundContract as jest.Mock)
          .mock.calls[0];
        const actualRoundId = updateRoundContractFirstCall[0];
        expect(actualRoundId).toEqual(roundIdOverride);
      });


      it("REJECTED: closes confirmation when cancel is selected", async () => {
        setupInBulkSelectionModeRejected();

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

      it("APPROVED: closes confirmation when cancel is selected", async () => {
        setupInBulkSelectionModeApproved();
  
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
  
        expect(updateApplicationList).not.toBeCalled();
  
        expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
      });

      it("PENDING: closes confirmation when cancel is selected", async () => {
        setupInBulkSelectionModePending();

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
    it("REJECTED: does not render approve and reject buttons on each card", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={[]}
          isLoading={false}
          applicationStatus={ApplicationStatus.REJECTED}
        />);
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });

    it("APPROVED: does not render approve and reject options on each card", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={[]}
          isLoading={false}
          applicationStatus={ApplicationStatus.APPROVED}
        />);
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });

    it("PENDING: does not render approve and reject options on each card", () => {
      renderWithContext(
        <ApplicationsOverview
          id={roundIdOverride}
          applications={[]}
          isLoading={false}
          applicationStatus={ApplicationStatus.PENDING}
        />);
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
