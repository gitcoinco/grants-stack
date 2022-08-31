import { fireEvent, screen, waitForElementToBeRemoved, within } from "@testing-library/react"
import ApplicationsReceived from "../ApplicationsReceived"
import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery,
} from "../../api/services/grantApplication"
import { makeGrantApplicationData, renderWrapped } from "../../../test-utils"

jest.mock("../../api/services/grantApplication");
jest.mock("../../common/Auth", () => ({
  useWallet: () => ({ provider: {} })
}))

const grantApplications = [
  makeGrantApplicationData({ status: "PENDING" }),
  makeGrantApplicationData({ status: "PENDING" }),
  makeGrantApplicationData({ status: "PENDING" })
];

let bulkUpdateGrantApplications = jest.fn()

describe("<ApplicationsReceived />", () => {
  beforeEach(() => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: grantApplications, refetch: jest.fn(), isSuccess: true, isLoading: false
    });

    bulkUpdateGrantApplications = jest.fn().mockImplementation(
      () => {
        return {
          unwrap: async () => Promise.resolve({
            data: "hi ",
          }),
        }
      },
    );
    (useBulkUpdateGrantApplicationsMutation as jest.Mock).mockReturnValue([
      bulkUpdateGrantApplications,
      {
        isLoading: false
      }
    ]);
  })

  describe("when there are no approved applications", () => {
    it("should not display the bulk select button", () => {
      (useListGrantApplicationsQuery as any).mockReturnValue({
        data: [], refetch: jest.fn(), isSuccess: true, isLoading: false
      });

      renderWrapped(<ApplicationsReceived />)

      expect(screen.queryByText(
        'Save in gas fees by approving/rejecting multiple applications at once.'
      )).not.toBeInTheDocument()
      expect(screen.queryByRole('button', {
        name: /Select/i
      })).not.toBeInTheDocument()
    })
  })

  describe('when received applications are shown', () => {
    it("should display the bulk select button", () => {
      renderWrapped(<ApplicationsReceived />)
      expect(screen.getByText(
        'Save in gas fees by approving/rejecting multiple applications at once.'
      )).toBeInTheDocument()
      expect(screen.getByRole('button', {
        name: /Select/i
      })).toBeInTheDocument()
    });

    it("should display the cancel button when select is clicked", () => {
      renderWrapped(<ApplicationsReceived />)
      const selectButton = screen.getByRole('button', {
        name: /Select/i
      });
      fireEvent.click(selectButton)
      expect(screen.getByRole('button', {
        name: /Cancel/i
      })).toBeInTheDocument()
      expect(screen.queryByRole('button', {
        name: /Select/i
      })).not.toBeInTheDocument()
    });

    it("should display the select button when cancel is clicked", () => {
      renderWrapped(<ApplicationsReceived />)
      const selectButton = screen.getByRole('button', {
        name: /Select/i
      });
      fireEvent.click(selectButton)

      const cancelButton = screen.getByRole('button', {
        name: /Cancel/i
      });
      fireEvent.click(cancelButton)

      expect(screen.queryByRole('button', {
        name: /Cancel/i
      })).not.toBeInTheDocument()
      expect(screen.getByRole('button', {
        name: /Select/i
      })).toBeInTheDocument()
    });
  })

  it("renders no cards when there are no projects", () => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: [], isSuccess: true, isLoading: false
    })

    renderWrapped(<ApplicationsReceived />)
    expect(screen.queryAllByTestId("application-card")).toHaveLength(0)
  })

  it("renders a card for every project with PENDING status", () => {
    renderWrapped(<ApplicationsReceived />)

    expect(screen.getAllByTestId("application-card")).toHaveLength(3)
    screen.getByText(grantApplications[0].project!.title)
    screen.getByText(grantApplications[0].project!.description)
    screen.getByText(grantApplications[1].project!.title)
    screen.getByText(grantApplications[1].project!.description)
    screen.getByText(grantApplications[2].project!.title)
    screen.getByText(grantApplications[2].project!.description)
  })

  describe("when bulkSelect is true", () => {

    beforeEach(() => {
      // eslint-disable-next-line testing-library/no-render-in-setup
      renderWrapped(<ApplicationsReceived />)
      const selectButton = screen.getByTestId('select')
      fireEvent.click(selectButton);
    })

    it("renders approve and reject buttons on each project card", () => {
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons")).toHaveLength(grantApplications.length)
    });

    it("displays an approved button as selected when approve button is clicked", () => {
      const approveButton = screen.queryAllByTestId("approve-button")[0]
      fireEvent.click(approveButton)

      expect(approveButton).toHaveClass("bg-teal-400 text-grey-500")
    });

    it("displays a rejected button as selected when reject button is clicked", () => {
      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

      expect(rejectButton).toHaveClass("bg-white text-pink-500")
    });

    describe("and when an approve button is already selected on a card", () => {
      it("selects the reject button and unselects the approve button when the reject button is clicked on that card", () => {
        const approveButton = screen.queryAllByTestId("approve-button")[0]
        const rejectButton = screen.queryAllByTestId("reject-button")[0]

        fireEvent.click(approveButton)
        fireEvent.click(rejectButton)

        expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500")
        expect(rejectButton).toHaveClass("bg-white text-pink-500")
      });
      it("unselects the approve button when that selected approve button is clicked on that card", () => {
        const approveButton = screen.queryAllByTestId("approve-button")[0]

        fireEvent.click(approveButton)
        fireEvent.click(approveButton)

        expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500")
      });
    });

    describe("and when an reject button is already selected on a card", () => {
      it("selects the approve button and unselects the reject button when the approve button is clicked on that card", () => {
        const approveButton = screen.queryAllByTestId("approve-button")[0]
        const rejectButton = screen.queryAllByTestId("reject-button")[0]

        fireEvent.click(rejectButton)
        fireEvent.click(approveButton)

        expect(approveButton).toHaveClass("bg-teal-400 text-grey-500")
        expect(rejectButton).not.toHaveClass("bg-white text-pink-500")
      });
      it("unselects the reject button when that selected reject button is clicked on that card", () => {
        const rejectButton = screen.queryAllByTestId("reject-button")[0]

        fireEvent.click(rejectButton)
        fireEvent.click(rejectButton)

        expect(rejectButton).not.toHaveClass("bg-white text-pink-500")
      });
    });

    it("should approve individual applications independently", () => {
      const firstApproveButton = screen.queryAllByTestId("approve-button")[0]
      fireEvent.click(firstApproveButton)
      expect(firstApproveButton).toHaveClass("bg-teal-400 text-grey-500")

      const secondApproveButton = screen.queryAllByTestId("approve-button")[1]
      fireEvent.click(secondApproveButton)
      expect(secondApproveButton).toHaveClass("bg-teal-400 text-grey-500")
    });

    describe("when at least one application is selected", () => {
      it("displays the continue button and copy", () => {
        const approveButton = screen.queryAllByTestId("approve-button")[0]
        fireEvent.click(approveButton)

        const continueButton = screen.getByRole('button', {
          name: /Continue/i
        });
        expect(continueButton).toBeInTheDocument();
        expect(screen.getByText(/You have selected 1 Grant Applications/i)).toBeInTheDocument();

        const approveButton2 = screen.queryAllByTestId("approve-button")[1]
        fireEvent.click(approveButton2)

        expect(continueButton).toBeInTheDocument();
        expect(screen.getByText(/You have selected 2 Grant Applications/i)).toBeInTheDocument();
      })

      it("opens the confirmation modal when the continue button is clicked", async () => {
        const approveButton = screen.queryAllByTestId("approve-button")[0]
        fireEvent.click(approveButton)

        const continueButton = screen.getByRole('button', {
          name: /Continue/i
        });
        fireEvent.click(continueButton)

        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      })

      it("shows the correct number of approved and rejected applications in the confirmation modal", async () => {
        fireEvent.click(screen.queryAllByTestId("approve-button")[0])
        fireEvent.click(screen.queryAllByTestId("reject-button")[1])
        fireEvent.click(screen.queryAllByTestId("approve-button")[2])

        const continueButton = screen.getByRole('button', {
          name: /Continue/i
        });
        fireEvent.click(continueButton)

        const approvedApplicationsCount = screen.getByTestId("approved-applications-count")
        const rejectedApplicationsCount = screen.getByTestId("rejected-applications-count")

        within(approvedApplicationsCount).getByText(/2/)
        within(rejectedApplicationsCount).getByText(/1/)
      })

      it("calls bulkUpdateGrantApplications when confirm button is clicked on the modal", async () => {
        const approveButton = screen.queryAllByTestId("approve-button")[0]
        fireEvent.click(approveButton)

        const continueButton = screen.getByRole('button', {
          name: /Continue/i
        });
        fireEvent.click(continueButton)

        const confirmationModalConfirmButton = screen.getByRole('button', {
          name: /Confirm/i
        });
        fireEvent.click(confirmationModalConfirmButton);

        expect(bulkUpdateGrantApplications).toBeCalled();

        await waitForElementToBeRemoved(() => screen.queryByTestId("confirm-modal"));
      })

      it("closes the modal when cancel button is clicked on the modal", async () => {
        const approveButton = screen.queryAllByTestId("approve-button")[0]
        fireEvent.click(approveButton)

        const continueButton = screen.getByRole('button', {
          name: /Continue/i
        });
        fireEvent.click(continueButton)

        const modal = screen.getByTestId("confirm-modal");

        const modalCancelButton = within(modal).getByRole('button', {
          name: /Cancel/i
        });
        fireEvent.click(modalCancelButton);

        expect(bulkUpdateGrantApplications).not.toBeCalled();

        expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("when bulkSelect is false", () => {
    it("does not render approve and reject buttons on each card", () => {
      renderWrapped(<ApplicationsReceived />)
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons")).toHaveLength(0)
    });
  });
})
