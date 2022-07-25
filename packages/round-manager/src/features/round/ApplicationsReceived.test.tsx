import { reducer, screen } from "../../test-utils"
import ApplicationsReceived from "./ApplicationsReceived"

describe("<ApplicationsReceived />", () => {
  beforeEach(() => {
    reducer(<ApplicationsReceived />)
  })

  it("displays application information for each project", async () => {
    expect(await screen.findAllByTestId("application-card")).toHaveLength(3);
    expect(await screen.findAllByText(/Some Title \d/)).toHaveLength(3);
    expect(await screen.findAllByText(/Some project description \d/)).toHaveLength(3);
  });
});
