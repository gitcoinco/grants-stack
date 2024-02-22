import "@testing-library/jest-dom";
import { act, screen } from "@testing-library/react";
import { when } from "jest-when";
import { Store } from "redux";
import { loadAllChainsProjects, loadProjects } from "../../../actions/projects";
import { checkRoundApplications } from "../../../actions/roundApplication";
import { loadRound } from "../../../actions/rounds";
import { web3ChainIDLoaded } from "../../../actions/web3";
import List from "../../../components/grants/List";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { RootState } from "../../../reducers";
import { ApplicationModalStatus } from "../../../reducers/roundApplication";
import setupStore from "../../../store";
import { Metadata } from "../../../types";
import {
  addressFrom,
  buildRound,
  renderWrapped,
  roundIdFrom,
} from "../../../utils/test_utils";

jest.mock("../../../actions/projects");
jest.mock("../../../actions/rounds");
jest.mock("../../../actions/roundApplication");
jest.mock("../../../hooks/useLocalStorage");

const projectsMetadata: Metadata[] = [
  {
    protocol: 1,
    pointer: "0x1234",
    id: "1",
    chainId: 1,
    title: "First Project",
    description: "",
    website: "",
    bannerImg: "",
    logoImg: "",
    projectTwitter: "",
    userGithub: "",
    projectGithub: "",
    credentials: {},
    createdAt: 1,
    updatedAt: 1,
    linkedChains: [1],
    nonce: BigInt(1),
    registryAddress: "0x1234",
  },
  {
    protocol: 2,
    pointer: "0x1234",
    id: "2",
    chainId: 1,
    title: "Second Project",
    description: "",
    website: "",
    bannerImg: "",
    logoImg: "",
    projectTwitter: "",
    userGithub: "",
    projectGithub: "",
    credentials: {},
    createdAt: 1,
    updatedAt: 1,
    linkedChains: [1],
    nonce: BigInt(1),
    registryAddress: "0x1234",
  },
];

describe("<List />", () => {
  beforeEach(() => {
    (useLocalStorage as jest.Mock).mockReturnValue([null]);
    (loadRound as jest.Mock).mockReturnValue({ type: "TEST" });
    (loadAllChainsProjects as jest.Mock).mockReturnValue({ type: "TEST" });
  });

  describe("useEffect/loadAllChainsProjects", () => {
    test("should be called the first time", async () => {
      const store = setupStore();

      renderWrapped(<List />, store);

      // How many times this will be called is going to change with the number of supported chains
      expect(loadAllChainsProjects).toBeCalledTimes(1);
    });

    test("should not be called if it's already loading", async () => {
      const store = setupStore();
      store.dispatch({ type: "PROJECTS_LOADING", payload: [10] });

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
          chainIDs: [10],
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
          chainIDs: [10],
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
          chainIDs: [10],
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
        payload: { chainIDs: [10] },
      });

      renderWrapped(<List />, store);

      expect(checkRoundApplications).toBeCalledTimes(0);
    });
  });

  describe("ui", () => {
    describe("projects", () => {
      test("should show a loading element", async () => {
        const store = setupStore();
        store.dispatch({ type: "PROJECTS_LOADING", payload: [10] });

        renderWrapped(<List />, store);

        expect(screen.getByText("Loading Projects")).toBeInTheDocument();
        expect(screen.getByText("Loading...")).toBeInTheDocument();
      });

      test("should show an empty list", async () => {
        const store = setupStore();
        store.dispatch({
          type: "PROJECTS_LOADED",
          payload: { chainIDs: [10] },
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

        renderWrapped(<List />, store);

        await act(async () => {
          store.dispatch({
            type: "PROJECTS_LOADED",
            payload: { chainIDs: [10] },
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
          payload: { chainIDs: [10] },
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
            id: roundIdFrom(1),
            address: addressFrom(1),
          });

          store.dispatch(web3ChainIDLoaded(5));

          store.dispatch({
            type: "ROUNDS_ROUND_LOADED",
            id: addressFrom(1),
            round,
          });

          store.dispatch({ type: "ROUND_APPLICATION_NOT_FOUND", roundAddress });

          renderWrapped(<List />, store);

          expect(screen.getByText("Apply to Grant Round")).toBeInTheDocument();
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
          payload: { chainIDs: [10] },
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
              chainID: [10],
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
            project: "0x1234",
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
