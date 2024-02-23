import { fetchGrantData } from "../../../actions/grantsMetadata";
import Card from "../../../components/grants/Card";
import setupStore from "../../../store";
import { renderWrapped } from "../../../utils/test_utils";

jest.mock("../../../actions/grantsMetadata");

describe("<Card />", () => {
  describe("useEffect/fetchGrantData", () => {
    test("should be called the first time", async () => {
      const store = setupStore();
      (fetchGrantData as jest.Mock).mockReturnValue({ type: "TEST" });

      renderWrapped(<Card projectId="0x1234" />, store);

      expect(fetchGrantData).toBeCalledTimes(1);
    });
  });
});
