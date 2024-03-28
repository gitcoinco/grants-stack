import "@testing-library/jest-dom";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { DataLayer, RoundApplicationMetadata, RoundCategory } from "data-layer";
import { Store } from "redux";
import { web3ChainIDLoaded } from "../../../actions/web3";
import Form from "../../../components/application/Form";
import setupStore from "../../../store";
import { Metadata, Round } from "../../../types";
import { renderWrapped, roundIdFrom } from "../../../utils/test_utils";
import * as utils from "../../../utils/utils";

const projectsMetadata: Metadata[] = [
  {
    protocol: 1,
    pointer: "0x1234",
    id: "0x3456",
    chainId: 1,
    title: "First Project",
    description: "This is the first project description",
    website: "https://firstproject.com",
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
    pointer: "0x1324",
    id: "0x9876",
    chainId: 1,
    title: "Second Project",
    description: "This is the second project description",
    website: "https://secondproject.com",
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

const roundApplicationMetadata: RoundApplicationMetadata = {
  version: "2.0.0",
  lastUpdatedOn: 1657817494040,
  applicationSchema: {
    requirements: {
      github: { required: false, verification: false },
      twitter: { required: false, verification: false },
    },
    questions: [
      { id: 0, type: "project" },
      { id: 1, type: "recipient" },
    ],
  },
};

const round: Round = {
  id: roundIdFrom(123),
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
    version: "2.0.0",
    lastUpdatedOn: 1234,
    applicationSchema: {
      requirements: {
        twitter: { required: false, verification: false },
        github: { required: false, verification: false },
      },
      questions: [
        {
          id: 0,
          type: "recipient",
        },
      ],
    },
  },
  payoutStrategy: RoundCategory.QuadraticFunding,
  programName: "sample program",
  tags: [],
};

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useNetwork: () => ({
    chain: jest.fn(),
    chains: [
      {
        id: 10,
        name: "Optimism",
      },
    ],
  }),
}));

describe("<Form />", () => {
  let store: Store;

  beforeEach(() => {
    store = setupStore();
    store.dispatch(web3ChainIDLoaded(1));
    store.dispatch({
      type: "PROJECTS_LOADED",
      payload: {
        chainID: 1,
      },
    });
    store.dispatch({
      type: "GRANT_METADATA_FETCHED",
      data: projectsMetadata[0],
    });
  });

  describe("addressInput valid address change", () => {
    test("checks if wallet address IS a multi-sig on current chain when YES is selected and IS a safe", async () => {
      const returnValue = {
        isContract: true,
        isSafe: true,
        resolved: true,
      };
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);
      jest
        .spyOn(DataLayer.prototype, "getApplicationsByRoundIdAndProjectIds")
        .mockResolvedValue([]);

      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
          setCreateLinkedProject={() => {}}
        />,
        store
      );

      const selectProject = screen.getByLabelText(
        "Select a project you would like to apply for funding:"
      );
      await act(async () => {
        fireEvent.change(selectProject, {
          target: { value: "0x3456" },
        });
      });
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

    test("checks if wallet address IS a multi-sig on current chain when NO is selected and IS a safe", async () => {
      const returnValue = {
        isContract: true,
        isSafe: true,
        resolved: true,
      };
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);
      jest
        .spyOn(DataLayer.prototype, "getApplicationsByRoundIdAndProjectIds")
        .mockResolvedValue([]);

      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
          setCreateLinkedProject={() => {}}
        />,
        store
      );

      const selectProject = screen.getByLabelText(
        "Select a project you would like to apply for funding:"
      );
      await act(async () => {
        fireEvent.change(selectProject, {
          target: { value: "0x3456" },
        });
      });
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

    test("checks if wallet address is a multi-sig on current chain when YES is selected and IS NOT a safe", async () => {
      const returnValue = {
        isContract: false,
        isSafe: true,
        resolved: true,
      };
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);
      jest
        .spyOn(DataLayer.prototype, "getApplicationsByRoundIdAndProjectIds")
        .mockResolvedValue([]);
      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
          setCreateLinkedProject={() => {}}
        />,
        store
      );

      const selectProject = screen.getByLabelText(
        "Select a project you would like to apply for funding:"
      );
      await act(async () => {
        fireEvent.change(selectProject, {
          target: { value: "0x3456" },
        });
      });
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
            "It looks like the payout wallet address you have provided may not be a valid multi-sig on the undefined network. Please update your payout wallet address before proceeding."
          )
        ).toBeInTheDocument()
      );
    });

    test("checks if wallet address is a multi-sig on current chain when NO is selected and IS NOT a safe", async () => {
      const returnValue = {
        isContract: false,
        isSafe: false,
        resolved: true,
      };
      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);
      jest
        .spyOn(DataLayer.prototype, "getApplicationsByRoundIdAndProjectIds")
        .mockResolvedValue([]);

      renderWrapped(
        <Form
          roundApplication={roundApplicationMetadata}
          round={round}
          onSubmit={jest.fn()}
          showErrorModal={false}
          setCreateLinkedProject={() => {}}
        />,
        store
      );

      const selectProject = screen.getByLabelText(
        "Select a project you would like to apply for funding:"
      );
      await act(async () => {
        fireEvent.change(selectProject, {
          target: { value: "0x3456" },
        });
      });
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
    });
  });

  it("shows a project details section", async () => {
    jest
      .spyOn(DataLayer.prototype, "getApplicationsByRoundIdAndProjectIds")
      .mockResolvedValue([]);

    renderWrapped(
      <Form
        roundApplication={roundApplicationMetadata}
        round={round}
        onSubmit={jest.fn()}
        showErrorModal={false}
        setCreateLinkedProject={() => {}}
      />,
      store
    );

    const selectProject = screen.getByLabelText(
      "Select a project you would like to apply for funding:"
    );
    await act(async () => {
      fireEvent.change(selectProject, {
        target: { value: "0x3456" },
      });
    });
    const toggleButton = screen.getByText("View your Project Details");

    expect(screen.getByLabelText("Project Website")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Website")).not.toBeVisible();

    global.scrollTo = jest.fn();

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Project Website")).toBeVisible();
    });
  });
});

describe("<Form/>", () => {
  it("prevents appliying when requirements are not met", async () => {
    const store = setupStore();

    store.dispatch(web3ChainIDLoaded(5));
    store.dispatch({
      type: "PROJECTS_LOADED",
      payload: {
        chainIDs: [10],
      },
    });

    store.dispatch({
      type: "GRANT_METADATA_FETCHED",
      data: { ...projectsMetadata[0], projectGithub: "mygithub" },
    });

    jest
      .spyOn(DataLayer.prototype, "getApplicationsByRoundIdAndProjectIds")
      .mockResolvedValue([]);

    renderWrapped(
      <Form
        roundApplication={{
          ...roundApplicationMetadata,
          applicationSchema: {
            ...roundApplicationMetadata.applicationSchema,
            requirements: {
              github: { required: false, verification: false },
              twitter: { required: true, verification: false },
            },
          },
        }}
        round={round}
        onSubmit={jest.fn()}
        showErrorModal={false}
        setCreateLinkedProject={() => {}}
      />,
      store
    );

    const selectProject = screen.getByLabelText(
      "Select a project you would like to apply for funding:"
    );
    await act(async () => {
      fireEvent.change(selectProject, {
        target: { value: "0x3456" },
      });
    });

    expect(
      screen.getByText("Project Twitter is required.")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Project Github is required.")
    ).not.toBeInTheDocument();
  });
});

describe("Form questions", () => {
  let store: Store;

  beforeEach(() => {
    store = setupStore();
    store.dispatch(web3ChainIDLoaded(5));
    jest
      .spyOn(DataLayer.prototype, "getApplicationsByRoundIdAndProjectIds")
      .mockResolvedValue([]);

    store.dispatch({
      type: "PROJECTS_LOADED",
      payload: {
        chainID: 5,
      },
    });

    store.dispatch({
      type: "GRANT_METADATA_FETCHED",
      data: { ...projectsMetadata[0], projectGithub: "mygithub" },
    });
  });

  test("checkbox", async () => {
    const onChange = jest.fn();

    renderWrapped(
      <Form
        roundApplication={{
          ...roundApplicationMetadata,
          applicationSchema: {
            ...roundApplicationMetadata.applicationSchema,
            questions: [
              {
                id: 0,
                type: "project",
              },
              {
                id: 1,
                type: "checkbox",
                title: "This is the title",
                required: true,
                encrypted: true,
                hidden: true,
                options: ["First option", "Second option"],
              },
            ],
          },
        }}
        round={round}
        onChange={onChange}
        showErrorModal={false}
        setCreateLinkedProject={() => {}}
      />,
      store
    );

    const selectProject = screen.getByLabelText(
      "Select a project you would like to apply for funding:"
    );
    await act(async () => {
      fireEvent.change(selectProject, {
        target: { value: "0x3456" },
      });
    });

    act(() => {
      const choice = screen.getByLabelText("Second option");
      choice.click();
    });

    expect(onChange).toHaveBeenCalledWith({
      0: "0x3456",
      1: ["Second option"],
    });

    act(() => {
      const choice = screen.getByLabelText("First option");
      choice.click();
    });

    expect(onChange).toHaveBeenCalledWith({
      0: "0x3456",
      1: ["Second option", "First option"],
    });
  });

  test("multiple-choice", async () => {
    const onChange = jest.fn();

    renderWrapped(
      <Form
        roundApplication={{
          ...roundApplicationMetadata,
          applicationSchema: {
            ...roundApplicationMetadata.applicationSchema,
            questions: [
              {
                id: 0,
                type: "project",
              },
              {
                id: 1,
                type: "multiple-choice",
                title: "This is the title",
                required: true,
                encrypted: true,
                hidden: true,
                options: ["First option", "Second option"],
              },
            ],
          },
        }}
        round={round}
        onChange={onChange}
        showErrorModal={false}
        setCreateLinkedProject={() => {}}
      />,
      store
    );

    const selectProject = screen.getByLabelText(
      "Select a project you would like to apply for funding:"
    );
    await act(async () => {
      fireEvent.change(selectProject, {
        target: { value: "0x3456" },
      });
    });

    act(() => {
      const choice = screen.getByLabelText("Second option");
      choice.click();
    });

    expect(onChange).toHaveBeenCalledWith({
      0: "0x3456",
      1: "Second option",
    });

    act(() => {
      const choice = screen.getByLabelText("First option");
      choice.click();
    });

    expect(onChange).toHaveBeenCalledWith({
      0: "0x3456",
      1: "First option",
    });
  });

  test("dropdown", async () => {
    const onChange = jest.fn();

    renderWrapped(
      <Form
        roundApplication={{
          ...roundApplicationMetadata,
          applicationSchema: {
            ...roundApplicationMetadata.applicationSchema,
            questions: [
              {
                id: 0,
                type: "project",
              },
              {
                id: 1,
                type: "dropdown",
                title: "This is the title",
                required: true,
                encrypted: true,
                hidden: true,
                options: ["First option", "Second option"],
              },
            ],
          },
        }}
        round={round}
        onChange={onChange}
        showErrorModal={false}
        setCreateLinkedProject={() => {}}
      />,
      store
    );

    const selectProject = screen.getByLabelText(
      "Select a project you would like to apply for funding:"
    );
    await act(async () => {
      fireEvent.change(selectProject, {
        target: { value: "0x3456" },
      });
    });

    const select = screen.getByLabelText(/This is the title/);

    expect(screen.getByText("First option")).toBeInTheDocument();
    expect(screen.getByText("Second option")).toBeInTheDocument();

    act(() => {
      fireEvent.change(select, { target: { value: "First option" } });
    });

    expect(onChange).toHaveBeenCalledWith({
      0: "0x3456",
      1: "First option",
    });

    act(() => {
      fireEvent.change(select, { target: { value: "Second option" } });
    });

    expect(onChange).toHaveBeenCalledWith({
      0: "0x3456",
      1: "Second option",
    });
  });
});
