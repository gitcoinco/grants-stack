import { reducer, screen } from "../../test-utils"
import ApplicationsReceived from "./ApplicationsReceived"

describe("<ApplicationsReceived />", () => {
  beforeEach(() => {
    reducer(<ApplicationsReceived />)
  })

  it("displays application information for each project", async () => {
    expect(await screen.findAllByTestId("application-card")).toHaveLength(3);
  });
});
