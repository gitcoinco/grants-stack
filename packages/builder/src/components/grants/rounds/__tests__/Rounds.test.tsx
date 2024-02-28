import "@testing-library/jest-dom";
import { act, cleanup, screen } from "@testing-library/react";
import { ProjectApplicationWithRound } from "data-layer";
import { web3ChainIDLoaded } from "../../../../actions/web3";
import setupStore from "../../../../store";
import {
  addressFrom,
  buildProjectApplication,
  buildRound,
  renderWrapped,
  roundIdFrom,
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
  const now = Date.now();

  const applicationsStartTime = new Date(now - 2000000);
  const applicationsEndTime = new Date(now - 1000000);

  const roundStartTime = applicationsEndTime;
  const roundEndTime = new Date(now + 20000000);

  const round = buildRound({
    id: roundIdFrom(1),
    address: addressFrom(1),
    applicationsStartTime,
    applicationsEndTime,
    donationsStartTime: roundStartTime,
    donationsEndTime: roundEndTime,
    ...roundData,
  });
  return round;
};

const buildPastRound = (roundData: any) => {
  const now = Date.now();

  const applicationsStartTime = new Date(now - 2000000);
  const applicationsEndTime = new Date(now - 1000000);

  const roundStartTime = applicationsEndTime;
  const roundEndTime = new Date(now - 900000);

  const round = buildRound({
    id: roundIdFrom(1),
    address: addressFrom(1),
    applicationsStartTime,
    applicationsEndTime,
    donationsStartTime: roundStartTime,
    donationsEndTime: roundEndTime,
    ...roundData,
  });
  return round;
};

const buildCurrentApplication = (roundData: any) => {
  const now = Date.now();

  const applicationsStartTime = new Date(now - 2000);
  const applicationsEndTime = new Date(now + 2000);

  const roundStartTime = applicationsEndTime;
  const roundEndTime = new Date(now + 3000);

  const round = buildRound({
    id: roundIdFrom(1),
    address: addressFrom(1),
    applicationsStartTime,
    applicationsEndTime,
    donationsStartTime: roundStartTime,
    donationsEndTime: roundEndTime,
    ...roundData,
  });
  return round;
};

describe("<Rounds />", () => {
  afterEach(() => {
    cleanup();
  });

  describe("when the data is loaded", () => {
    test("should show the active rounds, badges and buttons", async () => {
      const store = setupStore();
      store.dispatch(web3ChainIDLoaded(5));

      const round1 = buildActiveRound({
        id: roundIdFrom(1),
        address: addressFrom(1),
      });
      const round2 = buildActiveRound({
        id: roundIdFrom(2),
        address: addressFrom(2),
      });

      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        id: addressFrom(1),
        round: round1,
      });
      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        id: addressFrom(2),
        round: round2,
      });
      const applications: ProjectApplicationWithRound[] = [];
      applications.push(
        buildProjectApplication({
          roundId: addressFrom(1),
          status: "APPROVED",
          round: round1,
        })
        // set the status directly here, saves some pain
      );
      applications.push(
        buildProjectApplication({
          roundId: addressFrom(2),
          status: "REJECTED",
          round: round2,
        })
      );
      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });

      await act(async () => {
        renderWrapped(<Rounds applications={applications} />, store);
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
        id: addressFrom(1),
        round: round1,
      });
      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        id: addressFrom(2),
        round: round2,
      });
      const applications: ProjectApplicationWithRound[] = [];
      applications.push(
        buildProjectApplication({
          roundId: addressFrom(1),
          status: "APPROVED",
          round: round1,
        })
        // set the status directly here, saves some pain
      );
      applications.push(
        buildProjectApplication({
          roundId: addressFrom(2),
          status: "REJECTED",
          round: round2,
        })
      );
      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });

      await act(async () => {
        renderWrapped(<Rounds applications={applications} />, store);
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
        id: roundIdFrom(2),
        address: addressFrom(2),
      });

      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        id: addressFrom(1),
        round: round1,
      });
      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        id: addressFrom(2),
        round: round2,
      });
      const applications: ProjectApplicationWithRound[] = [];
      applications.push(
        buildProjectApplication({
          roundId: addressFrom(1),
          status: "APPROVED",
          round: round1,
        })
        // set the status directly here, saves some pain
      );
      applications.push(
        buildProjectApplication({
          roundId: addressFrom(2),
          status: "REJECTED",
          round: round2,
        })
      );
      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });

      await act(async () => {
        renderWrapped(<Rounds applications={applications} />, store);
      });

      expect(screen.getByText("Past Rounds")).toBeInTheDocument();
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Not Approved")).toBeInTheDocument();
      // expect(screen.queryAllByText("View Stats")).toHaveLength(2);
    });
  });
});
