import Card from "../../../components/grants/Card";
import setupStore from "../../../store";
import { fetchGrantData } from "../../../actions/grantsMetadata";
import { renderWrapped } from "../../../utils/test_utils";

jest.mock("../../../actions/grantsMetadata");

describe("<Card />", () => {
  describe("useEffect/fetchGrantData", () => {
    test("should be called the first time", async () => {
      const store = setupStore();
      (fetchGrantData as jest.Mock).mockReturnValue({ type: "TEST" });

      renderWrapped(<Card projectId={1} />, store);

      expect(fetchGrantData).toBeCalledTimes(1);
    });
  });
});
