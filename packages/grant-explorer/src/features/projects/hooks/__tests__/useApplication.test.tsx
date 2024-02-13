import { describe, Mock } from "vitest";
import { useApplication } from "../useApplication";
import { renderWithContext } from "../../../../test-utils";
import { createElement } from "react";
import { applicationData } from "./data/application";

describe("useApplication", () => {
  beforeEach(() => vi.spyOn(global, "fetch"));
  beforeEach(() =>
    (global.fetch as Mock).mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: applicationData }),
      };
    })
  );

  it("fetch application data", async () => {
    const variables = { chainId: 1, roundId: "1", id: "1" };
    renderWithContext(
      createElement(() => {
        const { data } = useApplication(variables, {});
        if (data) {
          // Expect the hook to return the data
          expect(data).toEqual(applicationData.application);
        }
        return null;
      })
    );
  });
});
