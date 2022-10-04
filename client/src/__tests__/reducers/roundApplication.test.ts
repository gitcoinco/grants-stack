import "@testing-library/jest-dom";
import {
  roundApplicationReducer,
  RoundApplicationState,
  Status,
} from "../../reducers/roundApplication";

describe("roundApplication reducer", () => {
  it("updates state", async () => {
    const state: RoundApplicationState = {};

    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_LOADED",
      roundAddress: "0x1234",
      projectId: 1,
    });
    expect(newState["0x1234"].status).toBe(Status.Sent);
    expect(newState["0x1234"].projectsIDs[0]).toBe(1);
  });
});
