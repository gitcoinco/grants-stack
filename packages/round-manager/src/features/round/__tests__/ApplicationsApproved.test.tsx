/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import ApplicationsApproved from "../ApplicationsApproved";
import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery,
} from "../../api/services/grantApplication";
import { makeGrantApplicationData, renderWrapped } from "../../../test-utils";
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { GrantApplication } from "../../api/types";

jest.mock("../../api/services/grantApplication");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "0",
  }),
}));
jest.mock("../../common/Auth", () => ({
  useWallet: () => ({ provider: {}, signer: {} }),
}));

let grantApplications: GrantApplication[];

let bulkUpdateGrantApplications = jest.fn();

describe("<ApplicationsApproved />", () => {
  beforeEach(() => {
    grantApplications = [
      makeGrantApplicationData({ status: "APPROVED" }),
      makeGrantApplicationData({ status: "APPROVED" }),
      makeGrantApplicationData({ status: "APPROVED" }),
    ];

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

  it("should display a loading spinner if approved applications are loading", () => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderWrapped(<ApplicationsApproved />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when approved applications are shown", () => {
    it("should display bulk select", () => {
      renderWrapped(<ApplicationsApproved />);
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
      (useListGrantApplicationsQuery as any).mockReturnValue({
        data: [],
        refetch: jest.fn(),
        isSuccess: true,
        isLoading: false,
      });

      renderWrapped(<ApplicationsApproved />);

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
      renderWrapped(<ApplicationsApproved />);
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });
  });

  describe("when at least one application is selected", () => {
    let bulkUpdateGrantApplications: any;

    beforeEach(() => {
      bulkUpdateGrantApplications = jest.fn(() => ({
        unwrap: () => {
          /**/
        },
      }));
      (useBulkUpdateGrantApplicationsMutation as jest.Mock).mockImplementation(
        () => {
          return [bulkUpdateGrantApplications, { isLoading: false }];
        }
      );
    });

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

    it("opens confirmation when continue is selected", async () => {
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      const continueButton = screen.getByRole("button", {
        name: /Continue/i,
      });
      fireEvent.click(continueButton);

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    });

    it("choosing confirm kicks off the signature flow to persist rejected applications", async () => {
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      const continueButton = screen.queryByRole("button", {
        name: /Continue/i,
      });
      fireEvent.click(continueButton!);

      screen.getByTestId("rejected-applications-count");

      const confirmButton = screen.getByRole("button", { name: /Confirm/i });
      fireEvent.click(confirmButton!);

      await waitForElementToBeRemoved(() =>
        screen.queryByTestId("confirm-modal")
      );

      grantApplications[0].status = "REJECTED";

      const expected = {
        id: grantApplications[0].id,
        round: grantApplications[0].round,
        recipient: grantApplications[0].recipient,
        projectsMetaPtr: grantApplications[0].projectsMetaPtr,
        status: grantApplications[0].status,
      };

      expect(bulkUpdateGrantApplications.mock.calls[0][0]).toEqual({
        roundId: "0",
        applications: [expected],
        signer: {},
        provider: {},
      });
    });

    it("shows confirming status when processing rejection", async () => {
      (useBulkUpdateGrantApplicationsMutation as any).mockReturnValue([
        () => ({
          unwrap: () => {
            /**/
          },
        }),
        { isLoading: true },
      ]);
      setupInBulkSelectionMode();

      const rejectButton = screen.queryAllByTestId("reject-button")[0];
      fireEvent.click(rejectButton);

      const continueButton = screen.queryByRole("button", {
        name: /Continue/i,
      });
      fireEvent.click(continueButton!);

      const confirmButton = screen.queryByRole("button", { name: /Confirm/i });
      fireEvent.click(confirmButton!);

      expect(confirmButton?.textContent).toBe("Confirming...");

      await waitForElementToBeRemoved(() =>
        screen.queryByTestId("confirm-modal")
      );
    });

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

      expect(bulkUpdateGrantApplications).not.toBeCalled();

      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });
  });
});

const setupInBulkSelectionMode = () => {
  renderWrapped(<ApplicationsApproved />);
  const selectButton = screen.getByRole("button", {
    name: /Select/i,
  });
  fireEvent.click(selectButton);
};
