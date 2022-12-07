import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { Store } from "redux";
import Form from "../../../components/application/Form";
import setupStore from "../../../store";
import { renderWrapped } from "../../../utils/test_utils";
import { Metadata, Round } from "../../../types/index";
import * as utils from "../../../utils/utils";
import { web3ChainIDLoaded } from "../../../actions/web3";

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

const roundApplicationMetadata = {
  lastUpdatedOn: 1657817494040,
  application_schema: [],
  applicationSchema: [
    {
      id: 0,
      question: "Recipient Address",
      type: "RECIPIENT",
      required: true,
      info: "",
      choices: [],
    },
  ],
};

const round: Round = {
  address: "0x123",
  applicationsStartTime: 123,
  applicationsEndTime: 123,
  roundStartTime: 123,
  roundEndTime: 123,
  token: "0x123",
  roundMetaPtr: {
    protocol: "hello",
    pointer: "metaPointer",
  },
  roundMetadata: {
    name: "sample round",
    programContractAddress: "0x123",
  },
  applicationMetaPtr: {
    protocol: "hello",
    pointer: "metaPointer",
  },
  applicationMetadata: {
    lastUpdatedOn: 1234,
    applicationSchema: [
      {
        id: 0,
        question: "Recipient Address",
        type: "RECIPIENT",
        required: true,
        info: "",
        choices: [],
      },
    ],
    application_schema: [
      {
        id: 0,
        question: "Recipient Address",
        type: "RECIPIENT",
        required: true,
        info: "",
        choices: [],
      },
    ],
  },
  programName: "sample program",
};

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useNetwork: () => ({
    chain: jest.fn(),
    chains: [
      {
        id: 5,
        name: "Goerli",
      },
    ],
  }),
}));

describe("<Form />", () => {
  describe("addressInput valid address change", () => {
    let store: Store;

    beforeEach(() => {
      store = setupStore();
      store.dispatch(web3ChainIDLoaded(5));
      store.dispatch({
        type: "PROJECTS_LOADED",
        events: {
          "1:1:1": {
            createdAtBlock: 1111,
            updatedAtBlock: 1112,
          },
        },
      });
      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: projectsMetadata[0],
      });
    });

    test("should validate address type", async () => {
      const returnValue = {
        isContract: false,
        isSafe: false,
        resolved: true,
      };

      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);

      renderWrapped(
        <ChakraProvider>
          <Form
            roundApplication={roundApplicationMetadata}
            round={round}
            onSubmit={jest.fn()}
            showErrorModal={false}
          />
        </ChakraProvider>,
        store
      );

      const addressInputWrapper = screen.getByTestId("addressInputWrapper");
      const walletTypeWrapper = screen.getByTestId("walletType");
      const isSafeOption = walletTypeWrapper.querySelector(
        'input[value="Yes"]'
      ) as Element;
      const addressInput = addressInputWrapper.querySelector(
        "input"
      ) as Element;

      act(() => {
        fireEvent.click(isSafeOption);
        fireEvent.change(addressInput, {
          target: { value: "0x34aa3f359a9d614239015126635ce7732c18fdf3" },
        });
      });

      await waitFor(() =>
        expect(
          screen.getByText("Review your payout wallet address.")
        ).toBeInTheDocument()
      );
    });
  });
});
