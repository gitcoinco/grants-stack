import "@testing-library/jest-dom";
import { when } from "jest-when";
import { Store } from "redux";
import { screen } from "@testing-library/react";
import { RootState } from "../../../reducers";
import List from "../../../components/grants/List";
import setupStore from "../../../store";
import { loadProjects } from "../../../actions/projects";
import { checkRoundApplications } from "../../../actions/roundApplication";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { ProjectEvent, Metadata } from "../../../types";
import { renderWrapped } from "../../../utils/test_utils";

jest.mock("../../../actions/projects");
jest.mock("../../../actions/roundApplication");
jest.mock("../../../hooks/useLocalStorage");

const projects: ProjectEvent[] = [
  {
    id: 1,
    block: 1111,
  },
  {
    id: 2,
    block: 2222,
  },
];

const projectsMetadata: Metadata[] = [
  {
    protocol: 1,
    pointer: "0x1234",
    id: 1,
    title: "First Project",
    description: "",
    roadmap: "",
    challenges: "",
    website: "",
  },
  {
    protocol: 2,
    pointer: "0x1234",
    id: 2,
    title: "Second Project",
    description: "",
    roadmap: "",
    challenges: "",
    website: "",
  },
];

describe("<List />", () => {
  beforeEach(() => {
    (useLocalStorage as jest.Mock).mockReturnValue([null]);
  });

  describe("useEffect/loadProjects", () => {
    test("should be called the first time", async () => {
      const store = setupStore();
      (loadProjects as jest.Mock).mockReturnValue({ type: "TEST" });

      renderWrapped(<List />, store);

      expect(loadProjects).toBeCalledTimes(1);
    });

    test("should not be called if it's already loading", async () => {
      const store = setupStore();
      store.dispatch({ type: "PROJECTS_LOADING" });

      renderWrapped(<List />, store);

      expect(loadProjects).toBeCalledTimes(0);
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
        .mockReturnValue(["5:0x1234"]);

      store.dispatch({ type: "PROJECTS_LOADED", projects: [projects[0]] });
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

      store.dispatch({ type: "PROJECTS_LOADED", projects: [] });

      renderWrapped(<List />, store);

      expect(checkRoundApplications).toBeCalledTimes(0);
    });
  });

  describe("ui", () => {
    describe("projects", () => {
      test("should show a loading element", async () => {
        const store = setupStore();
        store.dispatch({ type: "PROJECTS_LOADING" });

        renderWrapped(<List />, store);

        expect(screen.getByText("loading...")).toBeInTheDocument();
      });

      test("should show an empty list", async () => {
        const store = setupStore();
        store.dispatch({ type: "PROJECTS_LOADED", projects: [] });

        renderWrapped(<List />, store);

        expect(
          screen.getByText(
            "It looks like you haven't created any projects yet."
          )
        ).toBeInTheDocument();
      });

      test("should show projects", async () => {
        const store = setupStore();

        store.dispatch({ type: "PROJECTS_LOADED", projects });
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

        store.dispatch({ type: "PROJECTS_LOADED", projects });

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
            .calledWith("toggleRoundApplicationModal", false)
            .mockReturnValue([false]);
        });

        test("should never be visible", async () => {
          renderWrapped(<List />, store);

          expect(
            screen.queryByText(
              "Apply to Optimism Grant Round and get your project funded!"
            )
          ).toBeNull();
        });
      });

      describe("when roundToApply is set", () => {
        let roundAddress: string;

        beforeEach(() => {
          roundAddress = "0x1234";

          when(useLocalStorage as jest.Mock)
            .calledWith("roundToApply", null)
            .mockReturnValue([`5:${roundAddress}`]);

          when(useLocalStorage as jest.Mock)
            .calledWith("toggleRoundApplicationModal", false)
            .mockReturnValue([false]);
        });

        test("should be visible if user didn't apply yet", async () => {
          store.dispatch({ type: "ROUND_APPLICATION_NOT_FOUND", roundAddress });

          renderWrapped(<List />, store);

          expect(
            screen.getByText(
              "Apply to Optimism Grant Round and get your project funded!"
            )
          ).toBeInTheDocument();
        });

        test("should not be visible if user already applied", async () => {
          store.dispatch({
            type: "ROUND_APPLICATION_FOUND",
            roundAddress,
            projectID: 1,
          });

          renderWrapped(<List />, store);

          expect(
            screen.queryByText(
              "Apply to Optimism Grant Round and get your project funded!"
            )
          ).toBeNull();
        });
      });
    });

    describe("round application modal", () => {
      let store: Store<RootState>;

      beforeEach(() => {
        store = setupStore();

        store.dispatch({ type: "PROJECTS_LOADED", projects });

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
          roundAddress = "0x1234";

          when(useLocalStorage as jest.Mock)
            .calledWith("roundToApply", null)
            .mockReturnValue([`5:${roundAddress}`]);
        });

        test("should be visible with toggleRoundApplicationModal set to true and not applied yet", async () => {
          store.dispatch({ type: "ROUND_APPLICATION_NOT_FOUND", roundAddress });

          when(useLocalStorage as jest.Mock)
            .calledWith("toggleRoundApplicationModal", false)
            .mockReturnValue([true]);

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
            project: projects[0].id,
          });

          when(useLocalStorage as jest.Mock)
            .calledWith("toggleRoundApplicationModal", false)
            .mockReturnValue([true]);

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
