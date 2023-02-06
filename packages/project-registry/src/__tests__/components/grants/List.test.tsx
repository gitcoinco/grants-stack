import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { when } from "jest-when";
import { Store } from "redux";
import { loadAllChainsProjects, loadProjects } from "../../../actions/projects";
import { loadRound } from "../../../actions/rounds";
import { checkRoundApplications } from "../../../actions/roundApplication";
import { web3ChainIDLoaded } from "../../../actions/web3";
import List from "../../../components/grants/List";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { RootState } from "../../../reducers";
import { ApplicationModalStatus } from "../../../reducers/roundApplication";
import setupStore from "../../../store";
import { Metadata, ProjectEventsMap } from "../../../types";
import {
  addressFrom,
  buildRound,
  renderWrapped,
} from "../../../utils/test_utils";

jest.mock("../../../actions/projects");
jest.mock("../../../actions/rounds");
jest.mock("../../../actions/roundApplication");
jest.mock("../../../hooks/useLocalStorage");

const projectEventsMap: ProjectEventsMap = {
  "1:1:1": {
    createdAtBlock: 1111,
    updatedAtBlock: 1112,
  },
  "1:1:2": {
    createdAtBlock: 2222,
    updatedAtBlock: 2223,
  },
};

const projectsMetadata: Metadata[] = [
  {
    protocol: 1,
    pointer: "0x1234",
    id: "1:1:1",
    title: "First Project",
    description: "",
    website: "",
  },
  {
    protocol: 2,
    pointer: "0x1234",
    id: "1:1:2",
    title: "Second Project",
    description: "",
    website: "",
  },
];

describe("<List />", () => {
  beforeEach(() => {
    (useLocalStorage as jest.Mock).mockReturnValue([null]);
    (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
  });

  describe("useEffect/loadAllChainsProjects", () => {
    test("should be called the first time", async () => {
      const store = setupStore();
      (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });
      // (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });

      renderWrapped(<List />, store);

      // How many times this will be called is going to change with the number of supported chains
      expect(loadAllChainsProjects).toBeCalledTimes(1);
    });

    test("should not be called if it's already loading", async () => {
      const store = setupStore();
      store.dispatch({ type: "PROJECTS_LOADING", payload: 0 });

      renderWrapped(<List />, store);

      expect(loadProjects).toBeCalledTimes(0);
    });

    test("should fails if error occurs on project fetch", async () => {
      const store = setupStore();
      store.dispatch({ type: "PROJECTS_ERROR", error: "Cannot load projects" });

      renderWrapped(<List />, store);

      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("useEffect/loadRound", () => {
    test("should not be called if roundToApply is not set", async () => {
      const store = setupStore();

      // mocked to avoid it failing, but not used here.
      (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });
      (checkRoundApplications as jest.Mock).mockReturnValue({ type: "TEST" });

      when(useLocalStorage as jest.Mock)
        .calledWith("roundToApply", null)
        .mockReturnValue([null]);

      store.dispatch({
        type: "PROJECTS_LOADED",
        payload: {
          chainID: 0,
          events: {
            "1:1:1": {
              createdAtBlock: 1111,
              updatedAtBlock: 1112,
            },
          },
        },
      });
      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: projectsMetadata[0],
      });

      renderWrapped(<List />, store);

      expect(loadRound).toBeCalledTimes(0);
    });

    test("should be called once if roundToApply is set", async () => {
      const store = setupStore();

      // mocked to avoid it failing, but not used here.
      (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });
      (checkRoundApplications as jest.Mock).mockReturnValue({ type: "TEST" });

      when(useLocalStorage as jest.Mock)
        .calledWith("roundToApply", null)
        .mockReturnValue([`5:${addressFrom(1)}`]);

      store.dispatch({
        type: "PROJECTS_LOADED",
        payload: {
          chainID: 0,
          events: {
            "1:1:1": {
              createdAtBlock: 1111,
              updatedAtBlock: 1112,
            },
          },
        },
      });
      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: projectsMetadata[0],
      });

      renderWrapped(<List />, store);

      expect(loadRound).toBeCalledTimes(1);
    });
  });

  describe("useEffect/checkRoundApplications", () => {
    test("should be called if roundToApply is set and projects are more than zero", async () => {
      const store = setupStore();

      // mocked to avoid it failing, but not used here.
      (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });
      (checkRoundApplications as jest.Mock).mockReturnValue({ type: "TEST" });

      when(useLocalStorage as jest.Mock)
        .calledWith("roundToApply", null)
        .mockReturnValue([`5:${addressFrom(1)}`]);

      store.dispatch({
        type: "PROJECTS_LOADED",
        payload: {
          chainID: 0,
          events: {
            "1:1:1": {
              createdAtBlock: 1111,
              updatedAtBlock: 1112,
            },
          },
        },
      });
      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: projectsMetadata[0],
      });

      renderWrapped(<List />, store);

      expect(checkRoundApplications).toBeCalledTimes(1);
    });

    test("should not be called if roundToApply is not set", async () => {
      const store = setupStore();

      // mocked to avoid it failing, but not used here.
      (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });
      (checkRoundApplications as jest.Mock).mockReturnValue({ type: "TEST" });

      when(useLocalStorage as jest.Mock)
        .calledWith("roundToApply", null)
        .mockReturnValue([null]);

      store.dispatch({
        type: "PROJECTS_LOADED",
        payload: { chainID: 0, events: {} },
      });

      renderWrapped(<List />, store);

      expect(checkRoundApplications).toBeCalledTimes(0);
    });
  });

  describe("ui", () => {
    describe("projects", () => {
      test("should show a loading element", async () => {
        const store = setupStore();
        store.dispatch({ type: "PROJECTS_LOADING", payload: 0 });

        renderWrapped(<List />, store);

        expect(screen.getByText("Loading Projects")).toBeInTheDocument();
        expect(screen.getByText("Loading...")).toBeInTheDocument();
      });

      test("should show an empty list", async () => {
        const store = setupStore();
        store.dispatch({
          type: "PROJECTS_LOADED",
          payload: { chainID: 0, events: {} },
        });

        renderWrapped(<List />, store);

        expect(
          screen.getByText(
            "It looks like you haven't created any projects yet."
          )
        ).toBeInTheDocument();
      });

      test("should show projects", async () => {
        const store = setupStore();

        store.dispatch({
          type: "PROJECTS_LOADED",
          payload: { chainID: 0, events: projectEventsMap },
        });
        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: projectsMetadata[0],
        });
        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: projectsMetadata[1],
        });

        renderWrapped(<List />, store);

        expect(screen.getByText("First Project")).toBeInTheDocument();
        expect(screen.getByText("Second Project")).toBeInTheDocument();
      });
    });

    describe("round application alert", () => {
      let store: Store<RootState>;

      beforeEach(() => {
        store = setupStore();

        store.dispatch({
          type: "PROJECTS_LOADED",
          payload: { chainID: 0, events: projectEventsMap },
        });

        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: projectsMetadata[0],
        });

        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: projectsMetadata[1],
        });
      });

      describe("when roundToApply is not set", () => {
        beforeEach(() => {
          when(useLocalStorage as jest.Mock)
            .calledWith("roundToApply", null)
            .mockReturnValue([null]);

          when(useLocalStorage as jest.Mock)
            .calledWith(
              "toggleRoundApplicationModal",
              ApplicationModalStatus.Undefined
            )
            .mockReturnValue([ApplicationModalStatus.Undefined]);
        });

        test("should never be visible", async () => {
          renderWrapped(<List />, store);

          expect(screen.queryByText("Apply")).toBeNull();
        });
      });

      describe("when roundToApply is set", () => {
        const roundAddress = addressFrom(1);

        beforeEach(() => {
          when(useLocalStorage as jest.Mock)
            .calledWith("roundToApply", null)
            .mockReturnValue([`5:${roundAddress}`]);

          when(useLocalStorage as jest.Mock)
            .calledWith(
              "toggleRoundApplicationModal",
              ApplicationModalStatus.Undefined
            )
            .mockReturnValue([ApplicationModalStatus.Undefined]);
        });

        test("should be visible if user didn't apply yet", async () => {
          const round = buildRound({
            address: addressFrom(1),
          });

          store.dispatch(web3ChainIDLoaded(5));

          store.dispatch({
            type: "ROUNDS_ROUND_LOADED",
            address: addressFrom(1),
            round,
          });

          store.dispatch({ type: "ROUND_APPLICATION_NOT_FOUND", roundAddress });

          renderWrapped(<List />, store);

          expect(screen.getByText("Apply")).toBeInTheDocument();
        });

        test("should not be visible if user already applied", async () => {
          store.dispatch({
            type: "ROUND_APPLICATION_FOUND",
            roundAddress,
            projectID: 1,
          });

          renderWrapped(<List />, store);

          expect(screen.queryByText("Apply")).toBeNull();
        });
      });
    });

    describe("round application modal", () => {
      let store: Store<RootState>;

      beforeEach(() => {
        store = setupStore();

        store.dispatch({
          type: "PROJECTS_LOADED",
          payload: { chainID: 0, events: projectEventsMap },
        });

        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: projectsMetadata[0],
        });

        store.dispatch({
          type: "GRANT_METADATA_FETCHED",
          data: projectsMetadata[1],
        });
      });

      describe("when roundToApply is set", () => {
        let roundAddress: string;

        beforeEach(() => {
          roundAddress = addressFrom(1);

          when(useLocalStorage as jest.Mock)
            .calledWith("roundToApply", null)
            .mockReturnValue([`5:${roundAddress}`]);
        });

        test("should be visible with toggleRoundApplicationModal set to notApplied, with only one project created and not applied yet", async () => {
          store.dispatch({ type: "ROUND_APPLICATION_NOT_FOUND", roundAddress });
          store.dispatch({ type: "PROJECTS_UNLOADED" });
          store.dispatch({
            type: "PROJECTS_LOADED",
            payload: {
              chainID: 0,
              events: {
                "1:1:1": {
                  createdAtBlock: 1111,
                  updatedAtBlock: 1112,
                },
              },
            },
          });

          when(useLocalStorage as jest.Mock)
            .calledWith(
              "toggleRoundApplicationModal",
              ApplicationModalStatus.Undefined
            )
            .mockReturnValue([ApplicationModalStatus.NotApplied]);

          renderWrapped(<List />, store);

          expect(screen.getByText("Apply to Grant Round")).toBeInTheDocument();
          expect(
            screen.getByText("Time to get your project funded!")
          ).toBeInTheDocument();
        });

        test("should not be visible with toggleRoundApplicationModal set to true but already applied", async () => {
          store.dispatch({
            type: "ROUND_APPLICATION_FOUND",
            roundAddress,
            project: "1:1:1",
          });

          when(useLocalStorage as jest.Mock)
            .calledWith(
              "toggleRoundApplicationModal",
              ApplicationModalStatus.Undefined
            )
            .mockReturnValue([ApplicationModalStatus.NotApplied]);

          renderWrapped(<List />, store);

          expect(screen.queryByText("Apply to Grant Round")).toBeNull();
          expect(
            screen.queryByText("Time to get your project funded!")
          ).toBeNull();
        });
      });
    });
  });
});
