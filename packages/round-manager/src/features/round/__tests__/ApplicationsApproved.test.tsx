import ApplicationsApproved from "../ApplicationsApproved"
import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery,
} from "../../api/services/grantApplication"
import { makeGrantApplicationData, renderWrapped } from "../../../test-utils"
import { fireEvent, screen } from "@testing-library/react"

jest.mock("../../api/services/grantApplication");
jest.mock("../../common/Auth", () => ({
  useWallet: () => ({ provider: {} })
}))

const grantApplications = [
  makeGrantApplicationData({ status: "APPROVED" }),
  makeGrantApplicationData({ status: "APPROVED" }),
  makeGrantApplicationData({ status: "APPROVED" })
];

let bulkUpdateGrantApplications = jest.fn()

describe("<ApplicationsApproved />", () => {
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

  describe("when bulkSelect is true", () => {
    it("renders approve and reject buttons on each project card", () => {

      renderWrapped(<ApplicationsApproved bulkSelect={true} />);
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons"))
        .toHaveLength(grantApplications.length);
    });

    it("displays all approved buttons as selected when approved applications tab renders", () => {

      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const approveButtons = screen.queryAllByTestId("approve-button")

      approveButtons.forEach((button) => {
        expect(button).toHaveClass("bg-teal-400 text-grey-500")
      })
      expect(approveButtons.length).toEqual(grantApplications.length)
    });

    it("displays a rejected button as selected when reject button is clicked", () => {

      renderWrapped(<ApplicationsApproved bulkSelect={true} />)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

      expect(rejectButton).toHaveClass("bg-white text-pink-500")
    });
  })
})