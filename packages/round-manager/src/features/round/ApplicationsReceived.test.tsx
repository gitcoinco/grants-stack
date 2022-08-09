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
})
