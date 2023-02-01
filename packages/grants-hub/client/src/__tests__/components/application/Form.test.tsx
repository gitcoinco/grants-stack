import "@testing-library/jest-dom";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { Store } from "redux";
import { web3ChainIDLoaded } from "../../../actions/web3";
import Form from "../../../components/application/Form";
import setupStore from "../../../store";
import { Metadata, Round } from "../../../types/index";
import { renderWrapped } from "../../../utils/test_utils";
import * as utils from "../../../utils/utils";

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
        payload: {
          chainID: 5,
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
    });

    test("checks if wallet address IS a multi-sig on current chain when YES is selected and IS a safe", async () => {
      // const setState = jest.fn();
      const returnValue = {
        isContract: true,
        isSafe: true,
        resolved: true,
      };
      // const useStateSpy = jest.spyOn(React, "useState");
      // useStateSpy.mockImplementation(() => [returnValue, setState]);
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);

      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
        />,
        store
      );

      const addressInputWrapper = screen.getByTestId("address-input-wrapper");
      const walletTypeWrapper = screen.getByTestId("wallet-type");
      const isSafeOption = walletTypeWrapper.querySelector(
        'input[value="Yes"]'
      ) as Element;
      const addressInput = addressInputWrapper.querySelector(
        "input"
      ) as Element;

      await act(async () => {
        fireEvent.click(isSafeOption);
        fireEvent.change(addressInput, {
          // NOTE: should we use the prefix? eth:0x5558bCC7E1ebf4A18c3CEdB321F4F9737839172E
          target: { value: "0x5558bCC7E1ebf4A18c3CEdB321F4F9737839172E" },
        });
      });

      await waitFor(() =>
        expect(
          screen
            .getByTestId("address-input-wrapper")
            .querySelector("input.border")
        ).toBeNull()
      );
    });

    // ✅
    test("checks if wallet address IS a multi-sig on current chain when NO is selected and IS a safe", async () => {
      // const setState = jest.fn();
      const returnValue = {
        isContract: true,
        isSafe: false,
        resolved: true,
      };
      // const useStateSpy = jest.spyOn(React, "useState");
      // useStateSpy.mockImplementationOnce(() => [returnValue, setState]);
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);

      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
        />,
        store
      );
      const addressInputWrapper = screen.getByTestId("address-input-wrapper");
      const walletTypeWrapper = screen.getByTestId("wallet-type");
      const isSafeOption = walletTypeWrapper.querySelector(
        'input[value="No"]'
      ) as Element;
      const addressInput = addressInputWrapper.querySelector(
        "input"
      ) as Element;

      await act(async () => {
        fireEvent.click(isSafeOption);
        fireEvent.change(addressInput, {
          target: { value: "0x34aA3F359A9D614239015126635CE7732c18fDF3" },
        });
      });

      await waitFor(() =>
        expect(
          screen.getByText(
            // eslint-disable-next-line max-len
            "It looks like the payout wallet address you have provided is a multi-sig. Please update your selection to indicate your payout wallet address will be a multi-sig, or update your payout wallet address."
          )
        ).toBeInTheDocument()
      );
    });

    // ✅
    test("checks if wallet address is a multi-sig on current chain when YES is selected and IS NOT a safe", async () => {
      // const setState = jest.fn();
      const returnValue = {
        isContract: false,
        isSafe: true,
        resolved: true,
      };
      // const useStateSpy = jest.spyOn(React, "useState");
      // useStateSpy.mockImplementationOnce(() => [returnValue, setState]);
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);

      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
        />,
        store
      );

      const addressInputWrapper = screen.getByTestId("address-input-wrapper");
      const walletTypeWrapper = screen.getByTestId("wallet-type");
      const isSafeOption = walletTypeWrapper.querySelector(
        'input[value="Yes"]'
      ) as Element;
      const addressInput = addressInputWrapper.querySelector(
        "input"
      ) as Element;

      await act(async () => {
        fireEvent.click(isSafeOption);
        fireEvent.change(addressInput, {
          target: { value: "0x34aA3F359A9D614239015126635CE7732c18fDF3" },
        });
      });

      await waitFor(() =>
        expect(
          screen.getByText(
            // eslint-disable-next-line max-len
            "It looks like the payout wallet address you have provided may not be a valid multi-sig on the Goerli network. Please update your payout wallet address before proceeding."
          )
        ).toBeInTheDocument()
      );
    });

    // ✅
    test("checks if wallet address is a multi-sig on current chain when NO is selected and IS NOT a safe", async () => {
      // const setState = jest.fn();
      const returnValue = {
        isContract: false,
        isSafe: false,
        resolved: true,
      };
      // const useStateSpy = jest.spyOn(React, "useState");
      // useStateSpy.mockImplementationOnce(() => [returnValue, setState]);
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);

      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
        />,
        store
      );
      const addressInputWrapper = screen.getByTestId("address-input-wrapper");
      const walletTypeWrapper = screen.getByTestId("wallet-type");
      const isSafeOption = walletTypeWrapper.querySelector(
        'input[value="No"]'
      ) as Element;
      const addressInput = addressInputWrapper.querySelector(
        "input"
      ) as Element;

      await act(async () => {
        fireEvent.click(isSafeOption);
        fireEvent.change(addressInput, {
          target: { value: "0x34aA3F359A9D614239015126635CE7732c18fDF3" },
        });
      });

      await waitFor(() =>
        expect(
          screen
            .getByTestId("address-input-wrapper")
            .querySelector("input.border")
        ).toBeNull()
      );

      // await waitFor(() =>
      //   expect(setState).toHaveBeenCalledWith(returnValue)
      // );
    });
  });
});
