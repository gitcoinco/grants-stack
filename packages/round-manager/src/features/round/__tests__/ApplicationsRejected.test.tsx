/* eslint-disable @typescript-eslint/no-explicit-any */
import ApplicationsRejected from "../ApplicationsRejected";
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

function setupInBulkSelectionMode() {
  renderWrapped(<ApplicationsRejected />);
  const select = screen.getByTestId("select");
  fireEvent.click(select);
}

describe("<ApplicationsRejected />", () => {
  beforeEach(() => {
    grantApplications = [
      makeGrantApplicationData({ status: "REJECTED" }),
      makeGrantApplicationData({ status: "REJECTED" }),
      makeGrantApplicationData({ status: "REJECTED" }),
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

  it("should display a loading spinner if rejected applications are loading", () => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderWrapped(<ApplicationsRejected />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("when rejected applications are shown", () => {
    it("should display bulk select", () => {
      renderWrapped(<ApplicationsRejected />);
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
      renderWrapped(<ApplicationsRejected />);
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
      renderWrapped(<ApplicationsRejected />);
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
      (useListGrantApplicationsQuery as any).mockReturnValue({
        data: [],
        refetch: jest.fn(),
        isSuccess: true,
        isLoading: false,
      });

      renderWrapped(<ApplicationsRejected />);

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
      let bulkUpdateGrantApplications: any;

      beforeEach(() => {
        bulkUpdateGrantApplications = jest.fn(() => ({
          unwrap: () => {
            /**/
          },
        }));
        (
          useBulkUpdateGrantApplicationsMutation as jest.Mock
        ).mockImplementation(() => {
          return [bulkUpdateGrantApplications, { isLoading: false }];
        });
      });

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

      it("opens confirmation when the continue is selected", async () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        const continueButton = screen.getByRole("button", {
          name: /Continue/i,
        });
        fireEvent.click(continueButton);

        expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      });

      it("choosing confirm kicks off the signature flow to persist approved applications", async () => {
        setupInBulkSelectionMode();

        const approveButton = screen.queryAllByTestId("approve-button")[0];
        fireEvent.click(approveButton);

        const continueButton = screen.queryByRole("button", {
          name: /Continue/i,
        }) as HTMLButtonElement;
        fireEvent.click(continueButton);

        screen.getByTestId("approved-applications-count");

        const confirmButton = screen.getByRole("button", {
          name: /Confirm/i,
        }) as HTMLButtonElement;
        fireEvent.click(confirmButton);

        await waitForElementToBeRemoved(() =>
          screen.queryByTestId("confirm-modal")
        );

        grantApplications[0].status = "APPROVED";

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
      renderWrapped(<ApplicationsRejected />);
      expect(
        screen.queryAllByTestId("bulk-approve-reject-buttons")
      ).toHaveLength(0);
    });
  });
});
