/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import ApplicationsReceived from "../ApplicationsReceived";
import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery,
} from "../../api/services/grantApplication";
import { makeGrantApplicationData, renderWrapped } from "../../../test-utils";

jest.mock("../../api/services/grantApplication");
jest.mock("../../common/Auth", () => ({
  useWallet: () => ({ provider: {} }),
}));

const grantApplications = [
  makeGrantApplicationData(),
  makeGrantApplicationData(),
  makeGrantApplicationData(),
];

grantApplications.forEach((application) => {
  application.status = "PENDING";
});

let bulkUpdateGrantApplications = jest.fn();

function setupInBulkSelectionMode() {
  renderWrapped(<ApplicationsReceived />);
  const selectButton = screen.getByRole("button", {
    name: /Select/i,
  });
  fireEvent.click(selectButton);
}

describe("<ApplicationsReceived />", () => {
  beforeEach(() => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: grantApplications,
      refetch: jest.fn(),
      isSuccess: true,
      isLoading: false,
    });

    bulkUpdateGrantApplications = jest.fn().mockImplementation(() => {
      return {
        unwrap: async () =>
          Promise.resolve({
            data: "hi ",
          }),
      };
    });
    (useBulkUpdateGrantApplicationsMutation as jest.Mock).mockReturnValue([
      bulkUpdateGrantApplications,
      {
        isLoading: false,
      },
    ]);
  });

  it("should display a loading spinner if received applications are loading", () => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderWrapped(<ApplicationsReceived />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when there are no approved applications", () => {
    it("should not display the bulk select option", () => {
      (useListGrantApplicationsQuery as any).mockReturnValue({
        data: [],
        refetch: jest.fn(),
        isSuccess: true,
        isLoading: false,
      });

      renderWrapped(<ApplicationsReceived />);

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
      renderWrapped(<ApplicationsReceived />);
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
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: [],
      isSuccess: true,
      isLoading: false,
    });

    renderWrapped(<ApplicationsReceived />);
    expect(screen.queryAllByTestId("application-card")).toHaveLength(0);
  });

  it("renders a card for every project with PENDING status", () => {
    renderWrapped(<ApplicationsReceived />);

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

      it("calls bulkUpdateGrantApplications when confirm is selected", async () => {
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

        expect(bulkUpdateGrantApplications).toBeCalled();

        await waitForElementToBeRemoved(() =>
          screen.queryByTestId("confirm-modal")
        );
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
      renderWrapped(<ApplicationsReceived />);
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });
  });
});
