import "@testing-library/jest-dom";
import { grantMetadataFetched } from "../../../actions/grantsMetadata";
import { web3AccountLoaded, web3ChainIDLoaded } from "../../../actions/web3";
import setupStore from "../../../store";
import {
  addressFrom,
  buildProjectMetadata,
  renderWrapped,
} from "../../../utils/test_utils";
import Project from "../../../components/grants/Show";
import { projectOwnersLoaded } from "../../../actions/projects";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    chainId: 1,
    registryAddress: addressFrom(1),
    id: 1,
  }),
}));

jest.mock("../../../actions/projects", () => ({
  ...jest.requireActual("../../../actions/projects"),
  loadAllChainsProjects: () => ({ type: "TEST" }),
}));

jest.mock("../../../actions/grantsMetadata", () => ({
  ...jest.requireActual("../../../actions/grantsMetadata"),
  fetchGrantData: () => ({ type: "TEST" }),
}));

jest.mock("../../../utils/projects", () => ({
  ...jest.requireActual("../../../utils/projects"),
  fetchProjectOwners: jest.fn(),
}));

describe("<Show />", () => {
  let store: any;
  const projectId = `1`;

  beforeEach(() => {
    store = setupStore();
    store.dispatch(
      grantMetadataFetched(
        buildProjectMetadata({
          id: projectId,
          credentials: {},
        })
      )
    );
    store.dispatch(projectOwnersLoaded(projectId, ["0x123"]));
    store.dispatch(web3ChainIDLoaded(5));
  });

  describe("edit button", () => {
    it("shows when the user is an owner", async () => {
      store.dispatch(web3AccountLoaded("0x123"));
      const dom = renderWrapped(<Project />, store);
      expect(dom.getByText("Edit")).toBeInTheDocument();
    });

    it("hides when the user is not an owner", async () => {
      store.dispatch(web3AccountLoaded("0x456"));
      const dom = renderWrapped(<Project />, store);
      expect(dom.queryByText("Edit")).not.toBeInTheDocument();
    });
  });
});
