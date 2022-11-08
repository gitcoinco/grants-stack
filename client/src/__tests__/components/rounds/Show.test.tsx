import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import Show from "../../../components/rounds/Show";
import setupStore from "../../../store";
import { unloadRounds, loadRound } from "../../../actions/rounds";
import { web3ChainIDLoaded } from "../../../actions/web3";
import {
  renderWrapped,
  buildRound,
  buildProjectMetadata,
} from "../../../utils/test_utils";
import { loadProjects } from "../../../actions/projects";

jest.mock("../../../actions/rounds");
jest.mock("../../../actions/projects");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    roundId: "0x1234",
    chainId: 5,
  }),
}));

describe("<Show />", () => {
  describe("with a valid round", () => {
    let store: any;

    beforeEach(() => {
      store = setupStore();
      const round = buildRound({ address: "0x1234" });

      store.dispatch(web3ChainIDLoaded(5));
      store.dispatch({ type: "ROUNDS_ROUND_LOADED", address: "0x1234", round });
    });

    describe("useEffect/loadProjects", () => {
      test("should be called the first time", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
        (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });

        renderWrapped(<Show />, store);

        expect(loadProjects).toBeCalledTimes(1);
      });

      test("should not be called if it's already loading", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });

        store.dispatch({ type: "PROJECTS_LOADING" });

        renderWrapped(<Show />, store);

        expect(loadProjects).toBeCalledTimes(0);
      });
    });

    describe("apply button", () => {
      test("should allow you to apply to a round with a project", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
        (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });

        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: buildProjectMetadata({}),
        });

        store.dispatch({
          type: "PROJECTS_LOADED",
          events: {},
        });

        renderWrapped(<Show />, store);

        expect(screen.getByText("Apply")).toBeInTheDocument();
      });

      test("should send you to project creation page", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
        (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });

        store.dispatch({
          type: "PROJECTS_LOADED",
          events: {},
        });

        renderWrapped(<Show />, store);

        expect(screen.getByText("Create Project")).toBeInTheDocument();

        const button = await screen.findByText("Create Project");
        const a = button.parentElement!;
        expect(a.getAttribute("href")).toEqual("#/projects/new");
      });
    });
  });
});
