import { act, cleanup, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWrapped } from "../../../utils/test_utils";
import Stats from "../../../components/grants/stats/Stats";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    chainId: "5",
    id: "2",
  }),
}));

describe("<Stats />", () => {
  afterEach(() => {
    cleanup();
  });

  describe("When no stats available", () => {
    test("should show 'No stats available'", async () => {
      await act(async () => {
        renderWrapped(<Stats />);
      });

      expect(
        screen.getByText("No stats available yet for this project.")
      ).toBeInTheDocument();
    });
    test("should not render the loading spinner", async () => {
      await act(async () => {
        renderWrapped(<Stats />);
      });

      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });
});
