import { Store } from "redux";
import { screen } from "@testing-library/react";
import Card from "../../../components/grants/Card";
import setupStore from "../../../store";
import { fetchGrantData } from "../../../actions/grantsMetadata";
import { ProjectEvent, Metadata } from "../../../types";
import { renderWrapped } from "../../../utils/test_utils";

jest.mock("../../../actions/grantsMetadata");

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
    jest.clearAllMocks();
  });

  describe("useEffect/fetchGrantData", () => {
    test("should be called the first time", async () => {
      const store = setupStore();
      (fetchGrantData as jest.Mock).mockReturnValue({ type: "TEST" });

      renderWrapped(<Card projectId={projects[0].id}/>, store);

      expect(fetchGrantData).toBeCalledTimes(1);
    });
  });
});
