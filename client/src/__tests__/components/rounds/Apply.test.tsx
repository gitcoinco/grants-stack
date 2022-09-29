import "@testing-library/jest-dom";
import { web3ChainIDLoaded } from "../../../actions/web3";
import { Status } from "../../../reducers/roundApplication";
import setupStore from "../../../store";
import { buildRound } from "../../../utils/test_utils";

describe("<Apply />", () => {
  describe("with a valid round submit an application", () => {
    let store: any;

    beforeEach(() => {
      store = setupStore();
      const round = buildRound({ address: "0x1234" });

      store.dispatch(web3ChainIDLoaded(5));
      store.dispatch({ type: "ROUNDS_ROUND_LOADED", address: "0x1234", round });
      store.dispatch({
        type: "ROUND_APPLICATION_LOADED",
        roundAddress: "0x1234",
        projectId: "1",
      });
    });

    describe("application status", () => {
      it("should be sent", async () => {
        expect(store.getState().roundApplication["0x1234"].status).toBe(
          Status.Sent
        );
      });
    });

    describe("project id", () => {
      it("should pass project id to route", async () => {
        expect(store.getState().roundApplication["0x1234"].projectsIDs[0]).toBe(
          "1"
        );
      });
    });
  });
});
