import { Status } from "../../reducers/grantsMetadata";
import setupStore from "../../store";
import { buildProjectMetadata } from "../../utils/test_utils";

describe("grantsMetadataReducer", () => {
  describe("GRANT_METADATA_ALL_UNLOADED", () => {
    test("it should remove all metadata", async () => {
      const store = setupStore();
      expect(store.getState().grantsMetadata).toEqual({});

      const metadata1 = buildProjectMetadata({ id: 123 });
      const metadata2 = buildProjectMetadata({ id: 456 });

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: metadata1,
      });

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: metadata2,
      });

      expect(store.getState().grantsMetadata).toEqual({
        "123": {
          metadata: metadata1,
          status: Status.Loaded,
          error: undefined,
        },
        "456": {
          metadata: metadata2,
          status: Status.Loaded,
          error: undefined,
        },
      });

      store.dispatch({
        type: "GRANT_METADATA_ALL_UNLOADED",
      });

      expect(store.getState().grantsMetadata).toEqual({});
    });
  });
});
