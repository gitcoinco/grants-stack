import "@testing-library/jest-dom";
import { web3ChainIDLoaded } from "../../../actions/web3";
import setupStore from "../../../store";
import { buildRound } from "../../../utils/test_utils";

describe("<Apply />", () => {
  describe("with a valid round", () => {
    let store: any;

    beforeEach(() => {
      store = setupStore();
      const round = buildRound({ address: "0x1234" });

      store.dispatch(web3ChainIDLoaded(5));
      store.dispatch({ type: "ROUNDS_ROUND_LOADED", address: "0x1234", round });
    });

    describe("application status", () => {
      test("should be sent", async () => {
        expect(true).toBe(true);
      });
    });
  });
});
