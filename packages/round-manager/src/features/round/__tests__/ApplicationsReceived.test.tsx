import { screen, fireEvent } from "@testing-library/react"
import ApplicationsReceived from "../ApplicationsReceived"
import { useListGrantApplicationsQuery } from "../../api/services/grantApplication"
import { GrantApplication } from "../../api/types"
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

describe("<ApplicationsReceived />", () => {
  beforeEach(() => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: grantApplications, isSuccess: true, isLoading: false
    })
  })

  it("renders no cards when there are no projects", async () => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: [], isSuccess: true, isLoading: false
    })

    await renderWrapped(<ApplicationsReceived />)
    expect(screen.queryAllByTestId("application-card")).toHaveLength(0)
  })

  it("renders a card for every project with PENDING status", async () => {
    const data: GrantApplication[] = [
      makeGrantApplicationData({ status: "PENDING" }),
      makeGrantApplicationData({ status: "PENDING" }),
      makeGrantApplicationData({ status: "APPROVED" }),
    ];

    (useListGrantApplicationsQuery as any).mockReturnValue({
      data, isSuccess: true, isLoading: false
    })

    await renderWrapped(<ApplicationsReceived />)

    expect(screen.getAllByTestId("application-card")).toHaveLength(2)
    screen.getByText(data[0].project.title)
    screen.getByText(data[0].project.description)
    screen.getByText(data[1].project.title)
    screen.getByText(data[1].project.description)
  })

  describe("when bulkSelect is true", () => {
    it("renders approve and reject buttons on each project card", async () => {

      await renderWrapped(<ApplicationsReceived bulkSelect={true} />)
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons")).toHaveLength(grantApplications.length)
    });

    it("displays an approved button as selected when approve button is clicked", async () => {

      await renderWrapped(<ApplicationsReceived bulkSelect={true} />)

      const approveButton = screen.queryAllByTestId("approve-button")[0]
      fireEvent.click(approveButton)

      expect(approveButton).toHaveClass("bg-teal-400 text-grey-500")
    });

    it("displays a rejected button as selected when reject button is clicked", async () => {

      await renderWrapped(<ApplicationsReceived bulkSelect={true} />)

      const rejectButton = screen.queryAllByTestId("reject-button")[0]
      fireEvent.click(rejectButton)

      expect(rejectButton).toHaveClass("bg-white text-pink-500")
    });

    describe("and when an approve button is already selected on a card", () => {
      it("selects the reject button and unselects the approve button when the reject button is clicked on that card", async () => {
        await renderWrapped(<ApplicationsReceived bulkSelect={true} />)

        const approveButton = screen.queryAllByTestId("approve-button")[0]
        const rejectButton = screen.queryAllByTestId("reject-button")[0]

        fireEvent.click(approveButton)
        fireEvent.click(rejectButton)

        expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500")
        expect(rejectButton).toHaveClass("bg-white text-pink-500")
      });
      it("unselects the approve button when that selected approve button is clicked on that card", async () => {
        await renderWrapped(<ApplicationsReceived bulkSelect={true} />)

        const approveButton = screen.queryAllByTestId("approve-button")[0]

        fireEvent.click(approveButton)
        fireEvent.click(approveButton)

        expect(approveButton).not.toHaveClass("bg-teal-400 text-grey-500")
      });
    });

    describe("and when an reject button is already selected on a card", () => {
      it("selects the approve button and unselects the reject button when the approve button is clicked on that card", async () => {
        await renderWrapped(<ApplicationsReceived bulkSelect={true} />)

        const approveButton = screen.queryAllByTestId("approve-button")[0]
        const rejectButton = screen.queryAllByTestId("reject-button")[0]

        fireEvent.click(rejectButton)
        fireEvent.click(approveButton)

        expect(approveButton).toHaveClass("bg-teal-400 text-grey-500")
        expect(rejectButton).not.toHaveClass("bg-white text-pink-500")
      });
      it("unselects the reject button when that selected reject button is clicked on that card", async () => {
        await renderWrapped(<ApplicationsReceived bulkSelect={true} />)

        const rejectButton = screen.queryAllByTestId("reject-button")[0]

        fireEvent.click(rejectButton)
        fireEvent.click(rejectButton)

        expect(rejectButton).not.toHaveClass("bg-white text-pink-500")
      });
    });

  });
  describe("when bulkSelect is false", () => {
    it("does not render approve and reject buttons on each card", async () => {
      await renderWrapped(<ApplicationsReceived bulkSelect={false} />)
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons")).toHaveLength(0)
    });
  });
})
