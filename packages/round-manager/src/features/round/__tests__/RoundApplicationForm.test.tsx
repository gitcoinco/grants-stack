/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker";
import { fireEvent, render, screen } from "@testing-library/react";
import { randomInt } from "crypto";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  initialQuestions,
  RoundApplicationForm,
} from "../RoundApplicationForm";
import { useWallet } from "../../common/Auth";
import { FormStepper } from "../../common/FormStepper";
import { MemoryRouter } from "react-router-dom";
import {
  CreateRoundContext,
  CreateRoundState,
  initialCreateRoundState
} from "../../../context/round/CreateRoundContext";
import { saveToIPFS } from "../../api/ipfs";
import { deployMerklePayoutStrategyContract } from "../../api/payoutStrategy/merklePayoutStrategy";
import { deployRoundContract } from "../../api/round";
import { waitForSubgraphSyncTo } from "../../api/subgraph";
import { ApplicationMetadata, ProgressStatus } from "../../api/types";
import { deployQFVotingContract } from "../../api/votingStrategy/qfVotingStrategy";
import { useWallet } from "../../common/Auth";
import { FormStepper } from "../../common/FormStepper";
import { FormContext } from "../../common/FormWizard";
import {
  initialQuestions,
  RoundApplicationForm
} from "../RoundApplicationForm";

jest.mock("../../api/ipfs");
jest.mock("../../api/round");
jest.mock("../../api/subgraph");
jest.mock("../../common/Auth");
jest.mock("../../api/payoutStrategy/merklePayoutStrategy");
jest.mock("../../api/votingStrategy/qfVotingStrategy");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const randomMetadata = {
  name: faker.random.word(),
};

describe("<RoundApplicationForm />", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      chain: { name: "my blockchain" },
      provider: {
        getNetwork: () => ({
          chainId: 0,
        }),
      },
      signer: {
        getChainId: () => 0,
      },
      address: "0x0",
    });
    (saveToIPFS as jest.Mock).mockResolvedValue("some ipfs hash");
    (deployQFVotingContract as jest.Mock).mockResolvedValue({
      votingContractAddress: "0xVotingContract",
    });
    (deployMerklePayoutStrategyContract as jest.Mock).mockResolvedValue({
      contractAddress: "0xPayoutContract",
    });
    (deployRoundContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: 0,
    });
    (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue(0);
  });

  describe("when submitting form", () => {
    it("shows headsup modal when form is submitted to create a round", async () => {
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       // @ts-expect-error Test file
      //       program: {
      //         operatorWallets: [],
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );
      // const launch = screen.getByRole("button", { name: /Launch/i });
      // fireEvent.click(launch);

      // expect(await screen.findByTestId("info-modal")).toBeInTheDocument();
    });
  });

  describe("when saving metadata fails", () => {
    // const startProgressModal = async () => {
    //   const launch = screen.getByRole("button", { name: /Launch/i });
    //   fireEvent.click(launch);

    //   const continueButton = await screen.findByRole("button", {
    //     name: /Continue/i,
    //   });
    //   fireEvent.click(continueButton);
    // };

    it("shows error modal when saving round application metadata fails", async () => {
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       // @ts-expect-error Test file
      //       program: {
      //         operatorWallets: [],
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />,
      //   { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      // );
      // await startProgressModal();

      // expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
    });

    it("choosing done closes the error modal", async () => {
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       // @ts-expect-error Test file
      //       program: {
      //         operatorWallets: [],
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />,
      //   { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      // );
      // await startProgressModal();

      // const done = await screen.findByTestId("done");
      // fireEvent.click(done);

      // expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    });

    it("choosing try again restarts the action and closes the error modal", async () => {
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       // @ts-expect-error Test file
      //       program: {
      //         operatorWallets: [],
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />,
      //   { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      // );
      // await startProgressModal();

      // expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
      // const saveToIpfsCalls = (saveToIPFS as jest.Mock).mock.calls.length;
      // expect(saveToIpfsCalls).toEqual(2);

      // const errorModalTryAgain = await screen.findByTestId("tryAgain");
      // fireEvent.click(errorModalTryAgain);

      // expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      // await waitFor(() => {
      //   expect((saveToIPFS as jest.Mock).mock.calls.length).toEqual(
      //     saveToIpfsCalls + 2
      //   );
      // });
    });
  });

  describe("when saving round application metadata succeeds but create round transaction fails", () => {
    // const createRoundStateOverride = {
    //   IPFSCurrentStatus: ProgressStatus.IS_SUCCESS,
    //   roundContractDeploymentStatus: ProgressStatus.IS_ERROR,
    // };

    // const startProgressModal = async () => {
    //   const launch = screen.getByRole("button", { name: /Launch/i });
    //   fireEvent.click(launch);

    //   const continueButton = await screen.findByRole("button", {
    //     name: /Continue/i,
    //   });
    //   fireEvent.click(continueButton);
    // };

    it("shows error modal when create round transaction fails", async () => {
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       // @ts-expect-error Test file
      //       program: {
      //         operatorWallets: [],
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />,
      //   createRoundStateOverride
      // );
      // await startProgressModal();

      // expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
    });
  });
});

describe("Application Form Builder", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      chain: { name: "my blockchain" },
      provider: {
        getNetwork: () => ({
          chainId: 0,
        }),
      },
      signer: {
        getChainId: () => 0,
      },
      address: "0x0",
    });
  });

  it("displays the four default questions", () => {
    // renderWithContext(
    //   <RoundApplicationForm
    //     initialData={{
    //       // @ts-expect-error Test file
    //       program: {
    //         operatorWallets: [],
    //       },
    //     }}
    //     stepper={FormStepper}
    //   />
    // );

    // expect(screen.getByText("Payout Wallet Address")).toBeInTheDocument();
    // expect(screen.getByText("Email Address")).toBeInTheDocument();
    // expect(screen.getByText("Funding Sources")).toBeInTheDocument();
    // expect(screen.getByText("Team Size")).toBeInTheDocument();
  });

  it("displays the existing questions if present in form data", () => {
    // const expectedQuestions: ApplicationMetadata["questions"] = [
    //   {
    //     title: "Some question",
    //     required: false,
    //     encrypted: false,
    //     inputType: "text",
    //     hidden: false,
    //   },
    // ];
    // const setFormData = jest.fn();
    // const formContext = {
    //   currentStep: 2,
    //   setCurrentStep: jest.fn(),
    //   stepsCount: 3,
    //   formData: {
    //     applicationMetadata: {
    //       questions: expectedQuestions,
    //     },
    //   },
    //   setFormData,
    // };

    // renderWithContext(
    //   <FormContext.Provider value={formContext}>
    //     <RoundApplicationForm
    //       initialData={{
    //         // @ts-expect-error Test file
    //         program: {
    //           operatorWallets: [],
    //         },
    //       }}
    //       stepper={FormStepper}
    //     />
    //   </FormContext.Provider>
    // );

    // expect(screen.getByText(expectedQuestions[0].title)).toBeInTheDocument();
  });

  describe("Edit question title", () => {
    it("displays edit icons for each editable question", () => {
      // const editableQuestions = initialQuestions;

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // expect(screen.getAllByTestId("edit-title")).toHaveLength(
      //   editableQuestions.length
      // );
    });

    it("enters editable state showing current title for that question when edit is clicked on that question", () => {
      // const editableQuestions = initialQuestions;
      // const questionIndex = randomInt(0, editableQuestions.length);

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );
      // const editIcons = screen.getAllByTestId("edit-title");
      // fireEvent.click(editIcons[questionIndex]);

      // expect(
      //   screen.getByDisplayValue(editableQuestions[questionIndex].title)
      // ).toBeInTheDocument();
    });

    it("when in edit mode, saves input as question title when save is clicked on that question and reverts to default ui", async () => {
      // const questionIndex = randomInt(0, initialQuestions.length);
      // const newTitle = faker.lorem.sentence();

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );
      // edit title and save
      // const editIcons = screen.getAllByTestId("edit-title");
      // fireEvent.click(editIcons[questionIndex]);
      // const questionTitleInput = await screen.findByTestId(
      //   "question-title-input"
      // );
      // fireEvent.input(questionTitleInput, {
      //   target: { value: newTitle },
      // });
      // const saveIcon = screen.getByTestId("save-title");
      // fireEvent.click(saveIcon);

      // expect(await screen.findByText(newTitle)).toBeInTheDocument();
      // expect(
      //   screen.queryByTestId("question-title-input")
      // ).not.toBeInTheDocument();
      // expect(screen.queryByTestId("save-title")).not.toBeInTheDocument();
    });
  });

  describe("Encrypted toggle", () => {
    it("displays toggle for encryption option for each editable question", () => {
      // const editableQuestions = initialQuestions;

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // expect(screen.getAllByTestId("encrypted-toggle")).toHaveLength(
      //   editableQuestions.length
      // );
    });

    it("toggles each encryption option when clicked", () => {
      // const isInitiallyEncrypted = initialQuestions.map((q) => q.encrypted);
      // const encryptionTrueClass = "bg-black";
      // const encryptionFalseClass = "bg-white";

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );
      // const encryptionToggles = screen.getAllByTestId("encrypted-toggle");
      // encryptionToggles.forEach((toggle) => {
      //   fireEvent.click(toggle);
      // });

      // const encryptionToggleLabels = screen.getAllByTestId(
      //   "encrypted-toggle-label"
      // );
      // encryptionToggles.forEach((toggle, index) => {
      //   if (isInitiallyEncrypted[index]) {
      //     expect(toggle.childNodes[0]).toHaveClass(encryptionFalseClass);
      //     expect(toggle).not.toBeChecked();
      //     expect(encryptionToggleLabels[index]).toHaveTextContent(
      //       "Unencrypted"
      //     );
      //   } else {
      //     expect(toggle.childNodes[0]).toHaveClass(encryptionTrueClass);
      //     expect(toggle).toBeChecked();
      //     expect(encryptionToggleLabels[index]).toHaveTextContent("Encrypted");
      //   }
      });
    });
  });

  describe("Required toggle", () => {
    it("displays toggle for required option for each editable question", () => {
      // const editableQuestions = initialQuestions;
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // expect(screen.getAllByTestId("required-toggle")).toHaveLength(
      //   editableQuestions.length
      // );
    });

    it("toggle each required option when clicked", () => {
      // const isInitiallyRequired = initialQuestions.map((q) => q.required);
      // const requiredTrueClass = "bg-violet-400";
      // const requiredFalseClass = "bg-white";

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // const requiredToggles = screen.getAllByTestId("required-toggle");
      // requiredToggles.forEach((toggle) => {
      //   fireEvent.click(toggle);
      // });

      // const requiredToggleLabels = screen.getAllByTestId(
      //   "required-toggle-label"
      // );
      // requiredToggles.forEach((toggle, index) => {
      //   if (isInitiallyRequired[index]) {
      //     expect(toggle.childNodes[0]).toHaveClass(requiredFalseClass);
      //     expect(toggle).not.toBeChecked();
      //     expect(requiredToggleLabels[index]).toHaveTextContent("Optional");
      //   } else {
      //     expect(toggle.childNodes[0]).toHaveClass(requiredTrueClass);
      //     expect(toggle).toBeChecked();
      //     expect(requiredToggleLabels[index]).toHaveTextContent(/Required/i);
      //   }
      // });
    });
  });

  describe("Remove question", () => {
    it("displays remove icon for each editable question", () => {
      // const editableQuestions = initialQuestions;
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // expect(screen.getAllByTestId("remove-question")).toHaveLength(
      //   editableQuestions.length
      // );
    });

    it("removes question when remove icon is clicked", () => {
      // const editableQuestions = initialQuestions;

      // const indexToBeRemoved = randomInt(0, 3);

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // const removeIcons = screen.getAllByTestId("remove-question");
      // fireEvent.click(removeIcons[indexToBeRemoved]);

      // expect(screen.getAllByTestId("remove-question")).toHaveLength(
      //   editableQuestions.length - 1
      // );

      // expect(
      //   screen.queryByText(editableQuestions[indexToBeRemoved].title)
      // ).not.toBeInTheDocument();
    });
  });

  describe("Add question", () => {
    it("displays add a question on RoundApplicationForm", () => {
      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // expect(
      //   screen.getByRole("button", {
      //     name: /Add a Question/i,
      //   })
      // ).toBeInTheDocument();
    });

    it("adds a new question on clicking add a new question button", async () => {
      // const editableQuestions = initialQuestions;

      // renderWithContext(
      //   <RoundApplicationForm
      //     initialData={{
      //       program: {
      //         operatorWallets: [],
      //         metadata: randomMetadata,
      //       },
      //     }}
      //     stepper={FormStepper}
      //   />
      // );

      // expect(screen.getAllByTestId("application-question")).toHaveLength(
      //   editableQuestions.length
      // );

      // const addAQuestion = screen.getByRole("button", {
      //   name: /Add a Question/i,
      // });
      // fireEvent.click(addAQuestion);

      // expect(screen.getAllByTestId("application-question")).toHaveLength(
      //   editableQuestions.length + 1
      // );
      // });
  });
});

describe("Project Socials", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      chain: { name: "my blockchain" },
      provider: {
        getNetwork: () => ({
          chainId: 0,
        }),
      },
      signer: {
        getChainId: () => 0,
      },
      address: "0x0",
    });
  });

  it("displays the Project Socials", () => {
    renderWithContext(
      <RoundApplicationForm
        initialData={{
          // @ts-expect-error Test file
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    expect(screen.getByText("Project Twitter")).toBeInTheDocument();
    expect(screen.getByText("Project Github")).toBeInTheDocument();
  });

  it("render the switches initial correct", () => {
    const { getAllByTestId } = renderWithContext(
      <RoundApplicationForm
        initialData={{
          // @ts-expect-error Test file
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    const switches = getAllByTestId("test-switch-id");

    expect(switches.length).toBe(2);
    // twitterVerification and githubVerification are not rendered at this point
    expect(switches[0]).not.toBeChecked(); // twitter
    expect(switches[1]).not.toBeChecked(); // github
  });

  it("should render twitterVerification when twitter is required", async () => {
    const { getAllByTestId } = renderWithContext(
      <RoundApplicationForm
        initialData={{
          // @ts-expect-error Test file
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    const switches = getAllByTestId("test-switch-id");

    await act(async () => {
      fireEvent.click(switches[0]); // twitter required: true
    });

    const updatedSwitches = getAllByTestId("test-switch-id");

    expect(updatedSwitches.length).toBe(3);
    expect(updatedSwitches[0]).toBeChecked(); // twitter
    expect(updatedSwitches[1]).not.toBeChecked(); // twitter verification
    expect(updatedSwitches[2]).not.toBeChecked(); // github
  });

  it("should render githubVerification when github is required", async () => {
    const { getAllByTestId } = renderWithContext(
      <RoundApplicationForm
        initialData={{
          // @ts-expect-error Test file
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    const switches = getAllByTestId("test-switch-id");
    expect(switches.length).toBe(2);

    await act(async () => {
      fireEvent.click(switches[1]); // github required: true
    });

    const updatedSwitches = getAllByTestId("test-switch-id");

    expect(updatedSwitches.length).toBe(3);
    expect(updatedSwitches[0]).not.toBeChecked(); // twitter
    expect(updatedSwitches[1]).toBeChecked(); // github
    expect(updatedSwitches[2]).not.toBeChecked(); // github verification
  });

  it("should render twitterVerification and githubVerification when twitter and github are required", async () => {
    const { getAllByTestId } = renderWithContext(
      <RoundApplicationForm
        initialData={{
          // @ts-expect-error Test file
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    const switches = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(switches[0]); // twitter required: true
    });

    const updatedSwitches0 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches0[2]); // github required: true
    });

    const updatedSwitches = getAllByTestId("test-switch-id");

    expect(updatedSwitches.length).toBe(4);
    expect(updatedSwitches[0]).toBeChecked(); // twitter
    expect(updatedSwitches[1]).not.toBeChecked(); // twitter verification
    expect(updatedSwitches[2]).toBeChecked(); // github
    expect(updatedSwitches[3]).not.toBeChecked(); // github verification
  });

  it("should toggle all switches on", async () => {
    const { getAllByTestId } = renderWithContext(
      <RoundApplicationForm
        initialData={{
          // @ts-expect-error Test file
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    const switches = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(switches[0]); // twitter required: true
    });

    const updatedSwitches0 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches0[2]); // github required: true
    });

    const updatedSwitches1 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches1[1]); // twitter verification required: true
    });

    const updatedSwitches2 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches2[3]); // github verification required: true
    });

    const updatedSwitches = getAllByTestId("test-switch-id");

    expect(updatedSwitches.length).toBe(4);
    expect(updatedSwitches[0]).toBeChecked(); // twitter
    expect(updatedSwitches[1]).toBeChecked(); // twitter verification
    expect(updatedSwitches[2]).toBeChecked(); // github
    expect(updatedSwitches[3]).toBeChecked(); // github verification
  });

  it("should toggle all switches off", async () => {
    const { getAllByTestId } = renderWithContext(
      <RoundApplicationForm
        initialData={{
          // @ts-expect-error Test file
          program: {
            operatorWallets: [],
          },
        }}
        stepper={FormStepper}
      />
    );

    const switches = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(switches[0]); // twitter required: true
    });

    const updatedSwitches0 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches0[2]); // github required: true
    });

    const updatedSwitches1 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches1[1]); // twitter verification required: true
    });

    const updatedSwitches2 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches2[3]); // github verification required: true
    });

    const updatedSwitches = getAllByTestId("test-switch-id");

    expect(updatedSwitches.length).toBe(4);
    expect(updatedSwitches[0]).toBeChecked(); // twitter
    expect(updatedSwitches[1]).toBeChecked(); // twitter verification
    expect(updatedSwitches[2]).toBeChecked(); // github
    expect(updatedSwitches[3]).toBeChecked(); // github verification

    const updatedSwitches3 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches3[0]); // twitter required: false
    });

    const updatedSwitches4 = getAllByTestId("test-switch-id");
    await act(async () => {
      fireEvent.click(updatedSwitches4[1]); // github required: false
    });

    const updatedSwitches5 = getAllByTestId("test-switch-id");

    expect(updatedSwitches5.length).toBe(2);
    expect(updatedSwitches5[0]).not.toBeChecked(); // twitter
    expect(updatedSwitches5[1]).not.toBeChecked(); // github
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  createRoundStateOverrides: Partial<CreateRoundState> = {}
) =>
  render(
    <MemoryRouter>
      <CreateRoundContext.Provider
        value={{ ...initialCreateRoundState, ...createRoundStateOverrides }}
      >
        {ui}
      </CreateRoundContext.Provider>
    </MemoryRouter>
  );
