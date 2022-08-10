import ApplicationsReceived from "./ApplicationsReceived"
import React from "react"
import { useListGrantApplicationsQuery } from "../api/services/grantApplication"
import { screen } from "@testing-library/react"
import { GrantApplication } from "../api/types"
import { makeGrantApplicationData, renderWrapped } from "../../test-utils"

jest.mock("../api/services/grantApplication");
jest.mock("../common/Auth", () => ({
  useWallet: () => ({ provider: {} })
}))

describe("<ApplicationsReceived />", () => {
  it("renders no cards when there are no projects", async () => {
    (useListGrantApplicationsQuery as any).mockReturnValue({
      data: [], isSuccess: true, isLoading: false
    })

    await renderWrapped(<ApplicationsReceived/>)
    expect(screen.queryAllByTestId("application-card")).toHaveLength(0)
  })

  it("renders a card for every project with PENDING status", async () => {
    const data: GrantApplication[] = [
      makeGrantApplicationData({status: "PENDING"}),
      makeGrantApplicationData({status: "PENDING"}),
      makeGrantApplicationData({status: "APPROVED"}),
    ];

    (useListGrantApplicationsQuery as any).mockReturnValue({
      data, isSuccess: true, isLoading: false
    })

    await renderWrapped(<ApplicationsReceived/>)

    expect(screen.getAllByTestId("application-card")).toHaveLength(2)
    screen.getByText(data[0].project.title)
    screen.getByText(data[0].project.description)
    screen.getByText(data[1].project.title)
    screen.getByText(data[1].project.description)
  })

  describe("when bulkSelect is true", () => {
    it("renders approve and reject buttons on each project card", async () => {
      const grantApplications = [
        makeGrantApplicationData({ status: "PENDING"}),
        makeGrantApplicationData({ status: "PENDING"}),
        makeGrantApplicationData({ status: "PENDING"})
      ];
      (useListGrantApplicationsQuery as any).mockReturnValue({
        data: grantApplications, isSuccess: true, isLoading: false
      })
      await renderWrapped(<ApplicationsReceived bulkSelect={true}/>)
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons")).toHaveLength(grantApplications.length)
    });

    it("displays an approved button as selected when approve button is clicked", async () => {
      // TODO
      expect(true).toEqual(false);
    });

    it("displays a rejected button as selected when reject button is clicked", async () => {
      // TODO
      expect(true).toEqual(false);
    });

    describe("and when an approve button is already selected on a card", () => {
      it("selects the reject button and unselects the approve button when the reject button is clicked on that card", async () => {
        // TODO
        expect(true).toEqual(false);
      });
      it("unselects the approve button when that selected approve button is clicked on that card", async () => {
        // TODO
        expect(true).toEqual(false);
      });
    });

  });
  describe("when bulkSelect is false", () => {
    it("does not render approve and reject buttons on each card", async () => {
      const grantApplications = [
        makeGrantApplicationData({ status: "PENDING"}),
        makeGrantApplicationData({ status: "PENDING"}),
        makeGrantApplicationData({ status: "PENDING"})
      ];
      (useListGrantApplicationsQuery as any).mockReturnValue({
        data: grantApplications, isSuccess: true, isLoading: false
      })
      await renderWrapped(<ApplicationsReceived bulkSelect={false}/>)
      expect(screen.queryAllByTestId("bulk-approve-reject-buttons")).toHaveLength(0)
    });
  });
})
