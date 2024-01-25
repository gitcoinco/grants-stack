import "@testing-library/jest-dom";
import { grantMetadataFetched } from "../../../actions/grantsMetadata";
import { web3AccountLoaded, web3ChainIDLoaded } from "../../../actions/web3";
import setupStore from "../../../store";
import {
  addressFrom,
  buildProjectMetadata
} from "../../../utils/test_utils";

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

  beforeEach(() => {
    store = setupStore();
    store.dispatch(
      grantMetadataFetched(
        buildProjectMetadata({
          id: `1:${addressFrom(1)}:1`,
          credentials: {},
        })
      )
    );
    store.dispatch(web3ChainIDLoaded(5));
    store.dispatch(web3AccountLoaded("0x123"));
  });

  describe("edit button", () => {
    it("shows when the user is an owner", async () => {
      // (fetchProjectOwners as jest.Mock).mockResolvedValue(["0x123"]);

      // const dom = renderWrapped(<Show />, store);

      // await waitFor(() => expect(fetchProjectOwners).toBeCalled());

      // expect((fetchProjectOwners as jest.Mock).mock.calls[0][0]).toBe(1);
      // expect((fetchProjectOwners as jest.Mock).mock.calls[0][1]).toBe("1");

      // await waitFor(() => {
      //   expect(dom.getByText("Edit")).toBeInTheDocument();
      // });
    });

    it("hides when the user is not an owner", async () => {
      // (fetchProjectOwners as jest.Mock).mockResolvedValue(["0x321"]);

      // const dom = renderWrapped(<Show />, store);

      // await waitFor(() => expect(fetchProjectOwners).toBeCalled());

      // expect((fetchProjectOwners as jest.Mock).mock.calls[0][0]).toBe(1);
      // expect((fetchProjectOwners as jest.Mock).mock.calls[0][1]).toBe("1");

      // await waitFor(() => {
      //   expect(dom.queryByText("Edit")).not.toBeInTheDocument();
      // });
    });
  });
});
