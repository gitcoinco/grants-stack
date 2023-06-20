import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { useParams } from "react-router-dom";

import { loadAllChainsProjects, loadProjects } from "../../../actions/projects";
import { loadRound, unloadRounds } from "../../../actions/rounds";
import { web3ChainIDLoaded } from "../../../actions/web3";
import Show from "../../../components/rounds/Show";
import setupStore from "../../../store";
import {
  addressFrom,
  buildProjectMetadata,
  buildRound,
  renderWrapped,
} from "../../../utils/test_utils";

jest.mock("../../../actions/rounds");
jest.mock("../../../actions/projects");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useSwitchNetwork: () => ({
    switchNetwork: jest.fn(),
  }),
  useNetwork: () => ({
    chain: jest.fn(),
  }),
}));

describe("<Show />", () => {
  let store: any;

  beforeEach(() => {
    store = setupStore();
    const round = buildRound({
      address: addressFrom(1),
    });

    const pastRound = buildRound({
      address: addressFrom(1),
      applicationsStartTime: 0,
      applicationsEndTime: 0,
      roundStartTime: 0,
      roundEndTime: 0,
    });

    const futureRound = buildRound({
      address: addressFrom(1),
      applicationsStartTime: Date.now() / 1000 + 60 * 30,
      applicationsEndTime: Date.now() / 1000 + 60 * 60,
      roundStartTime: Date.now() / 1000 + 60 * 60,
      roundEndTime: Date.now() / 1000 + 60 * 120,
    });

    store.dispatch(web3ChainIDLoaded(5));
    store.dispatch({
      type: "ROUNDS_ROUND_LOADED",
      address: addressFrom(1),
      round,
    });
    store.dispatch({
      type: "ROUNDS_ROUND_LOADED",
      address: addressFrom(2),
      round: pastRound,
    });
    store.dispatch({
      type: "ROUNDS_ROUND_LOADED",
      address: addressFrom(3),
      round: futureRound,
    });
  });

  describe("current round", () => {
    beforeEach(() => {
      (useParams as jest.Mock).mockReturnValue({
        roundId: addressFrom(1),
        chainId: 5,
      });
    });

    describe("<SwitchNetworkModal />", () => {
      test("renders when the round's chainId does not match the user's chainId", async () => {
        store.dispatch(web3ChainIDLoaded(1));
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
        (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });

        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: buildProjectMetadata({}),
        });

        store.dispatch({
          type: "PROJECTS_LOADED",
          payload: {
            chainID: 1,
            events: {},
          },
        });

        renderWrapped(<Show />, store);

        const element = screen.getByTestId("switch-networks-modal-button");
        const button = element.children[1];

        expect(button).toHaveTextContent("Switch Network");

        expect(screen.getByText("Apply")).toBeInTheDocument();
        expect(screen.getByTestId("switch-networks-modal")).toBeInTheDocument();
        expect(
          screen.getByTestId("switch-networks-modal-title")
        ).toHaveTextContent("Switch Network");
      });

      test("does not render when the round's chainId matches the user's chainId", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
        (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });
        store.dispatch(web3ChainIDLoaded(5));

        renderWrapped(<Show />, store);
        expect(
          screen.queryByTestId("switch-network-modal")
        ).not.toBeInTheDocument();
      });
    });

    describe("useEffect/loadAllChainsProjects", () => {
      test("should be called the first time", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
        (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });

        renderWrapped(<Show />, store);

        expect(loadAllChainsProjects).toBeCalledTimes(1);
      });

      test("should not be called if it's already loading", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });

        store.dispatch({ type: "PROJECTS_LOADING", payload: 0 });

        renderWrapped(<Show />, store);

        expect(loadProjects).toBeCalledTimes(0);
        expect(screen.getByText("Loading Round")).toBeInTheDocument();
        expect(screen.getByText("Loading...")).toBeInTheDocument();
      });
    });

    describe("apply button", () => {
      test("should allow you to apply to a round with a project", async () => {
        (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
        (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
        (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });

        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: buildProjectMetadata({}),
        });

        store.dispatch({
          type: "PROJECTS_LOADED",
          payload: {
            chainID: 0,
            events: {},
          },
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
          payload: {
            chainID: 0,
            events: {},
          },
        });

        renderWrapped(<Show />, store);

        expect(screen.getByText("Create Project")).toBeInTheDocument();

        const button = await screen.findByText("Create Project");
        const a = button.parentElement!;
        expect(a.getAttribute("href")).toEqual("#/projects/new");
      });
    });
  });

  describe("past round", () => {
    beforeEach(() => {
      (useParams as jest.Mock).mockReturnValue({
        roundId: addressFrom(2),
        chainId: 5,
      });
    });

    it("should not allow you to apply", async () => {
      (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
      (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
      (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: buildProjectMetadata({}),
      });

      store.dispatch({
        type: "PROJECTS_LOADED",
        payload: {
          chainID: 0,
          events: {},
        },
      });

      renderWrapped(<Show />, store);

      expect(screen.getByText("Application Period Ended")).toBeInTheDocument();
      expect(screen.queryByText("Apply")).not.toBeInTheDocument();
    });
  });

  describe("future round", () => {
    beforeEach(() => {
      (useParams as jest.Mock).mockReturnValue({
        roundId: addressFrom(3),
        chainId: 5,
      });
    });

    it("should not allow you to apply", async () => {
      (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
      (unloadRounds as jest.Mock).mockReturnValue({ type: "TEST" });
      (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: buildProjectMetadata({}),
      });

      store.dispatch({
        type: "PROJECTS_LOADED",
        payload: {
          chainID: 0,
          events: {},
        },
      });

      renderWrapped(<Show />, store);

      expect(
        screen.getByText("The application period for this round will start on")
      ).toBeInTheDocument();
      expect(screen.getByText("Apply")).toBeDisabled();
    });
  });
});
