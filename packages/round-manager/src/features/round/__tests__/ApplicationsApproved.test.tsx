import ApplicationsApproved from "../ApplicationsApproved"
import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery,
} from "../../api/services/grantApplication"
import {makeGrantApplicationData, renderWrapped} from "../../../test-utils"
import {fireEvent, screen, waitForElementToBeRemoved, within} from "@testing-library/react";
import {GrantApplication} from "../../api/types"

jest.mock("../../api/services/grantApplication");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "0"
  })
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({ provider: {}, signer: {} })
}))

let grantApplications: GrantApplication[];

let bulkUpdateGrantApplications = jest.fn()

describe("<ApplicationsApproved />", () => {
  beforeEach(() => {
    grantApplications = [
      makeGrantApplicationData({ status: "APPROVED" }),
      makeGrantApplicationData({ status: "APPROVED" }),
      makeGrantApplicationData({ status: "APPROVED" })
    ];

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

  describe('when approved applications are shown', () => {
    it("should display the bulk select button", () => {
      renderWrapped(<ApplicationsApproved />)
      expect(screen.getByText(
        'Save in gas fees by approving/rejecting multiple applications at once.'
      )).toBeInTheDocument()
      expect(screen.getByRole('button', {
        name: /Select/i
      })).toBeInTheDocument()
    });

    it("should display the cancel button when select is clicked", () => {
      renderWrapped(<ApplicationsApproved />)
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
      renderWrapped(<ApplicationsApproved />)
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

  describe("when bulkSelect is true", () => {
    it("renders reject buttons on each project card", () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true} />);
      expect(screen.queryAllByTestId("reject-button"))
        .toHaveLength(grantApplications.length);
    });

    it("does not display approve buttons in approved applications tab", () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const approveButtons = screen.queryAllByTestId("approve-button")
      expect(approveButtons.length).toEqual(0)
    });

    it("selects a reject button when reject button is clicked", () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

      expect(rejectButton).toHaveClass("bg-white text-pink-500")
    });

    it("unselects a reject button when a selected reject button is clicked", () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)
      fireEvent.click(rejectButton)

      expect(rejectButton).not.toHaveClass("bg-white text-pink-500")
    });
  });

  describe("when bulkSelect is false", () => {
    it("does not render approve and reject buttons on each card", () => {
      renderWrapped(<ApplicationsApproved bulkSelect={false} />)
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons")).toHaveLength(0)
    })
  });

  describe("when at least one application is selected", () => {
    let bulkUpdateGrantApplications: any;

    beforeEach(() => {
      bulkUpdateGrantApplications = jest.fn(() => ({
        unwrap: () => {
        }
      }));
      (useBulkUpdateGrantApplicationsMutation as jest.Mock).mockImplementation(() => {
        return [bulkUpdateGrantApplications, {isLoading: false}];
      });
    })

    it("displays the continue button and copy", () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

      const continueButton = screen.getByRole('button', {
        name: /Continue/i
      });
      expect(continueButton).toBeInTheDocument();
      expect(screen.getByText(/You have selected 1 Grant Applications/i)).toBeInTheDocument();

      const rejectButton2 = screen.queryAllByTestId("reject-button")[1]
      fireEvent.click(rejectButton2)

      expect(continueButton).toBeInTheDocument();
      expect(screen.getByText(/You have selected 2 Grant Applications/i)).toBeInTheDocument();
    })

    it("opens the confirmation modal when the continue button is clicked", async () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

      const continueButton = screen.getByRole('button', {
        name: /Continue/i
      });
      fireEvent.click(continueButton)

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    })

    it('does not show continue button when no applications are rejected', () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const continueButton = screen.queryByRole('button', {
        name: /Continue/i
      });

      expect(continueButton).not.toBeInTheDocument();
    })

    it('choosing confirm kicks off the signature flow to persist rejected applications', async () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true}/>)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

      const continueButton = screen.queryByRole('button', {name: /Continue/i});
      fireEvent.click(continueButton!!);

      screen.getByTestId("rejected-applications-count");

      const confirmButton = screen.getByRole('button', {name: /Confirm/i})
      fireEvent.click(confirmButton!!);

      await waitForElementToBeRemoved(() => screen.queryByTestId("confirm-modal"))

      grantApplications[0].status = "REJECTED";

      const expected = {
        id: grantApplications[0].id,
        round: grantApplications[0].round,
        recipient: grantApplications[0].recipient,
        projectsMetaPtr: grantApplications[0].projectsMetaPtr,
        status: grantApplications[0].status
      }

      expect(bulkUpdateGrantApplications.mock.calls[0][0]).toEqual({
        roundId: "0",
        applications: [expected],
        signer: {},
        provider: {}
      });
    })

    it("closes the modal when cancel button is clicked on the modal", async () => {
      renderWrapped(<ApplicationsApproved bulkSelect={true}/>)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

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
})
