import { act, cleanup, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  addressFrom,
  buildProjectApplication,
  buildRound,
  renderWrapped,
} from "../../../utils/test_utils";
import Stats from "../../../components/grants/stats/Stats";
import setupStore from "../../../store";
import { web3ChainIDLoaded } from "../../../actions/web3";

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

  describe("When stats are loading", () => {
    let store: any;
    let round: any;

    beforeEach(() => {
      store = setupStore();
      round = buildRound({
        address: addressFrom(1),
      });

      store.dispatch(web3ChainIDLoaded(5));
      store.dispatch({
        type: "ROUNDS_ROUND_LOADED",
        address: addressFrom(1),
        round,
      });

      const applications = [buildProjectApplication({})];

      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });
    });

    test("should not show the loading spinner when stat data is present", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                contributionCount: 123,
                uniqueContributors: 100,
                totalContributionsInUSD: 1000,
                averageUSDContribution: 10,
                projectId: "0x2",
              },
            }),
        })
      );

      await act(async () => {
        renderWrapped(<Stats />, store);
      });

      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  describe("When stats are available", () => {
    let store: any;
    let round1: any;
    let round2: any;

    beforeEach(() => {
      store = setupStore();

      store.dispatch(web3ChainIDLoaded(5));

      round1 = buildRound({
        address: addressFrom(1),
      });

      round2 = buildRound({
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
      applications.push(buildProjectApplication({ roundID: addressFrom(1) }));
      applications.push(buildProjectApplication({ roundID: addressFrom(2) }));

      store.dispatch({
        type: "PROJECT_APPLICATIONS_LOADED",
        applications,
        projectID: "2",
      });

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                contributionCount: 123,
                uniqueContributors: 456,
                totalContributionsInUSD: 789,
                averageUSDContribution: 111,
                projectId: "0xbbcd",
              },
            }),
        })
      );
    });

    test("should render the stats", async () => {
      await act(async () => {
        renderWrapped(<Stats />, store);
      });

      const contributionCount = screen.queryAllByText("123");
      const uniqueContributors = screen.queryAllByText("456");
      const totalContributionsInUSD = screen.queryAllByText("$789.00");
      const averageUSDContribution = screen.queryAllByText("$111.00");

      expect(contributionCount).toHaveLength(2);
      expect(uniqueContributors).toHaveLength(2);
      expect(totalContributionsInUSD).toHaveLength(2);
      expect(averageUSDContribution).toHaveLength(2);
    });

    test("should calculate All-Time stats correctly", async () => {
      await act(async () => {
        renderWrapped(<Stats />, store);
      });

      const allTimeReceived = screen.queryAllByText("$1578.00");
      const allTimeContributions = screen.queryAllByText("246");
      const roundLength = screen.queryAllByText("2");

      expect(allTimeReceived).toHaveLength(1);
      expect(allTimeContributions).toHaveLength(1);
      expect(roundLength).toHaveLength(1);
    });
  });
});
