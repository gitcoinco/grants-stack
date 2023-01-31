import "@testing-library/jest-dom";
import { act, cleanup, screen } from "@testing-library/react";
import { web3ChainIDLoaded } from "../../../../actions/web3";
import setupStore from "../../../../store";
import {
  addressFrom,
  buildProjectApplication,
  buildRound,
  renderWrapped,
} from "../../../../utils/test_utils";
import Rounds from "../Rounds";

// the params are needed to create the unique project id, etc..
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    chainId: "5",
    id: "2",
    registryAddress: addressFrom(123),
  }),
}));

const buildActiveRound = (roundData: any) => {
  const now = Date.now() / 1000;

  const applicationsStartTime = now - 20000;
  const applicationsEndTime = now - 10000;

  const roundStartTime = applicationsEndTime;
  const roundEndTime = now + 20000;

  const round = buildRound({
    address: addressFrom(1),
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    ...roundData,
  });
  return round;
};

const buildPastRound = (roundData: any) => {
  const now = Date.now() / 1000;

  const applicationsStartTime = now - 2000;
  const applicationsEndTime = now - 1000;

  const roundStartTime = applicationsEndTime;
  const roundEndTime = now - 900;

  const round = buildRound({
    address: addressFrom(1),
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    ...roundData,
  });
  return round;
};

const buildCurrentApplication = (roundData: any) => {
  const now = Date.now() / 1000;

  const applicationsStartTime = now - 2000;
  const applicationsEndTime = now + 2000;

  const roundStartTime = applicationsEndTime;
  const roundEndTime = now + 3000;

  const round = buildRound({
    address: addressFrom(1),
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    ...roundData,
  });
  return round;
};

describe("<Rounds />", () => {
  afterEach(() => {
    cleanup();
  });

  describe("When the data is loading", () => {
    test("should show loading", async () => {
      await act(async () => {
        renderWrapped(<Rounds />, setupStore());
      });

      expect(
        screen.queryAllByText("Loading your information, please stand by...")
          .length
      ).toBeGreaterThan(0);
    });
  });

  describe("when the data is loaded", () => {
    test("should show the active rounds, badges and buttons", async () => {
      const store = setupStore();
      store.dispatch(web3ChainIDLoaded(5));

      const round1 = buildActiveRound({});
      const round2 = buildActiveRound({
        address: addressFrom(2),
      });

      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        address: addressFrom(1),
        round: round1,
      });
      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        address: addressFrom(2),
        round: round2,
      });
      const applications = [];
      applications.push(
        buildProjectApplication({ roundID: addressFrom(1), status: "APPROVED" })
        // set the status directly here, saves some pain
      );
      applications.push(
        buildProjectApplication({ roundID: addressFrom(2), status: "REJECTED" })
      );
      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });

      await act(async () => {
        renderWrapped(<Rounds />, store);
      });

      expect(screen.getByText("Active Rounds")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Rejected")).toBeInTheDocument();
      expect(screen.queryAllByText("View on Explorer")).toHaveLength(2);
    });

    test("should show the current applications and badges", async () => {
      const store = setupStore();
      store.dispatch(web3ChainIDLoaded(5));

      const round1 = buildCurrentApplication({});
      const round2 = buildCurrentApplication({
        address: addressFrom(2),
      });

      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        address: addressFrom(1),
        round: round1,
      });
      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        address: addressFrom(2),
        round: round2,
      });
      const applications = [];
      applications.push(
        buildProjectApplication({ roundID: addressFrom(1), status: "APPROVED" })
        // set the status directly here, saves some pain
      );
      applications.push(
        buildProjectApplication({ roundID: addressFrom(2), status: "REJECTED" })
      );
      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });

      await act(async () => {
        renderWrapped(<Rounds />, store);
      });

      expect(screen.getByText("Current Applications")).toBeInTheDocument();
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    test("should show the past rounds, badges and buttons", async () => {
      const store = setupStore();
      store.dispatch(web3ChainIDLoaded(5));

      const round1 = buildPastRound({});
      const round2 = buildPastRound({
        address: addressFrom(2),
      });

      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        address: addressFrom(1),
        round: round1,
      });
      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        address: addressFrom(2),
        round: round2,
      });
      const applications = [];
      applications.push(
        buildProjectApplication({ roundID: addressFrom(1), status: "APPROVED" })
        // set the status directly here, saves some pain
      );
      applications.push(
        buildProjectApplication({ roundID: addressFrom(2), status: "REJECTED" })
      );
      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });

      await act(async () => {
        renderWrapped(<Rounds />, store);
      });

      expect(screen.getByText("Past Rounds")).toBeInTheDocument();
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Not Approved")).toBeInTheDocument();
      // expect(screen.queryAllByText("View Stats")).toHaveLength(2);
    });
  });
});
