import { faker } from "@faker-js/faker";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { randomInt } from "crypto";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import { RoundCategory } from "data-layer";
import { errorModalDelayMs } from "../../../constants";
import { useCreateRoundStore } from "../../../stores/createRoundStore";
import { saveToIPFS } from "../../api/ipfs";
import { waitForSubgraphSyncTo } from "../../api/subgraph";
import {
  ApplicationMetadata,
  ProgressStatus,
} from "../../api/types";
import { useWallet } from "../../common/Auth";
import { FormStepper } from "../../common/FormStepper";
import { FormContext } from "../../common/FormWizard";
import {
  RoundApplicationForm,
  initialQuestionsQF,
} from "../RoundApplicationForm";

jest.mock("../../api/ipfs");
jest.mock("../../api/round");
jest.mock("../../api/subgraph");
jest.mock("../../common/Auth");
jest.mock("../../api/payoutStrategy/payoutStrategy");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("wagmi", () => ({
  useNetwork: () => ({
    chain: jest.fn(),
    chains: [
      {
        id: 10,
        name: "Optimism",
      },
    ],
  }),
  useProvider: () => ({}),
}));
jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: () => ({}),
}));

jest.mock("../../../stores/createRoundStore", () => ({
  ...jest.requireActual("../../../stores/createRoundStore"),
}));

beforeEach(() => {
  jest.setTimeout(10000);
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
        getNetwork: () =>
          Promise.resolve({
            chainId: 5,
          }),
      },
      signer: {
        getChainId: () => 5,
      },
      address: "0x0",
    });
    (saveToIPFS as jest.Mock).mockResolvedValue("some ipfs hash");
    (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue(0);
  });

  describe("when saving metadata fails", () => {
    const startProgressModal = async () => {
      const launch = screen.getByRole("button", { name: /Launch/i });
      fireEvent.click(launch);
    };

    it("shows error modal when saving round application metadata fails", async () => {
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            // @ts-expect-error Test file
            program: {
              operatorWallets: [],
            },
          }}
          stepper={FormStepper}
          configuration={{ roundCategory: RoundCategory.QuadraticFunding }}
        />
      );
      await startProgressModal();
      useCreateRoundStore.setState({
        ipfsStatus: ProgressStatus.IS_ERROR,
      });
      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );
    });

    it("choosing done closes the error modal", async () => {
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
      await startProgressModal();
      useCreateRoundStore.setState({
        ipfsStatus: ProgressStatus.IS_ERROR,
      });

      const done = await screen.findByTestId("done");
      fireEvent.click(done);

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    });

    it("choosing try again restarts the action and closes the error modal", async () => {
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
      await startProgressModal();
      useCreateRoundStore.setState({
        ipfsStatus: ProgressStatus.IS_ERROR,
      });

      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );

      const errorModalTryAgain = await screen.findByTestId("tryAgain");
      fireEvent.click(errorModalTryAgain);

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    });
  });

  describe("when saving round application metadata succeeds but create round transaction fails", () => {
    const startProgressModal = async () => {
      const launch = screen.getByRole("button", { name: /Launch/i });
      fireEvent.click(launch);
    };

    it("shows error modal when create round transaction fails", async () => {
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
      await startProgressModal();
      useCreateRoundStore.setState({
        ipfsStatus: ProgressStatus.IS_SUCCESS,
        contractDeploymentStatus: ProgressStatus.IS_ERROR,
      });
      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );
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

    expect(screen.getByText("Payout Wallet Address")).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByText("Funding Sources")).toBeInTheDocument();
    expect(screen.getByText("Team Size")).toBeInTheDocument();
  });

  it("displays the existing questions if present in form data", () => {
    const expectedQuestions: ApplicationMetadata["questions"] = [
      {
        id: 0,
        title: "Some question",
        required: false,
        encrypted: false,
        type: "text",
        hidden: false,
      },
    ];
    const setFormData = jest.fn();
    const formContext = {
      currentStep: 2,
      setCurrentStep: jest.fn(),
      stepsCount: 3,
      formData: {
        applicationMetadata: {
          questions: expectedQuestions,
        },
      },
      setFormData,
    };

    renderWithContext(
      <FormContext.Provider value={formContext}>
        <RoundApplicationForm
          initialData={{
            // @ts-expect-error Test file
            program: {
              operatorWallets: [],
            },
          }}
          stepper={FormStepper}
        />
      </FormContext.Provider>
    );

    expect(screen.getByText(expectedQuestions[0].title)).toBeInTheDocument();
  });

  describe("Edit question", () => {
    it("displays edit icons for each editable question", () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      expect(screen.getAllByTestId("edit-question")).toHaveLength(
        editableQuestions.length
      );
    });

    it("enters editable state showing current title for that question when edit is clicked on that question", () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );
      const questionIndex = randomInt(0, editableQuestions.length);

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );
      const editIcons = screen.getAllByTestId("edit-question");
      fireEvent.click(editIcons[questionIndex]);

      expect(
        screen.getByDisplayValue(editableQuestions[questionIndex].title)
      ).toBeInTheDocument();
    });

    it("when in edit mode, saves input as question when save is clicked on that question and reverts to default ui", async () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );
      const questionIndex = randomInt(0, editableQuestions.length);
      const newTitle = faker.lorem.sentence();

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );
      // edit question and save
      const editIcons = screen.getAllByTestId("edit-question");
      fireEvent.click(editIcons[questionIndex]);
      const questionTitleInput = await screen.findByTestId(
        "question-title-input"
      );
      fireEvent.input(questionTitleInput, {
        target: { value: newTitle },
      });
      const save = screen.getByTestId("save-question");
      fireEvent.click(save);

      expect(await screen.findByText(newTitle)).toBeInTheDocument();
      expect(
        screen.queryByTestId("question-title-input")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("save-title")).not.toBeInTheDocument();
    });
  });

  describe("Encrypted toggle", () => {
    it("displays toggle for encryption option for each editable question", () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      expect(screen.getAllByText("Not Encrypted")).toHaveLength(
        editableQuestions.length
      );
    });

    it("toggles each encryption option when clicked", async () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      for (let i = 0; i < editableQuestions.length; i++) {
        const editIcons = screen.getAllByTestId("edit-question");
        fireEvent.click(editIcons[i]);
        const encryptionToggles = screen.getAllByTestId("encrypted-toggle");
        encryptionToggles.forEach(async (toggle) => {
          fireEvent.click(toggle);
        });
        const save = screen.getByTestId("save-question");
        fireEvent.click(save);
      }

      const encryptionToggleLabels = screen.getAllByText("Encrypted");

      expect(encryptionToggleLabels.length).toBe(1);
    });
  });

  describe("Required toggle", () => {
    it("displays *Required for required option for each editable question", () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      // +4: it also shows *Required for Project Name, Project Website, Project Description and Wallet address
      expect(screen.getAllByText("*Required")).toHaveLength(
        editableQuestions.length + 4
      );
    });

    it("toggle each required option when clicked", () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      // Before:
      // 1. Project Name Required
      // 2. Project Website Required
      // 3. Project Description Required
      // 4. Wallet address Required
      // Socials:
      // 5. Twitter Optional
      // 6. Github Optional
      // Editable:
      // 7. Email Required
      // 8. Funding Source Required
      // 9. Team Size Required
      for (let i = 0; i < editableQuestions.length; i++) {
        const editIcons = screen.getAllByTestId("edit-question");
        fireEvent.click(editIcons[i]);
        const requiredToggles = screen.getAllByTestId("required-toggle");
        requiredToggles.forEach(async (toggle) => {
          fireEvent.click(toggle);
        });
        const save = screen.getByTestId("save-question");
        fireEvent.click(save);
      }

      // After:
      // 1. Project Name Required
      // 2. Project Website Required
      // 3. Project Description Required
      // 4. Wallet address Required
      // Socials:
      // 5. Twitter Optional
      // 6. Github Optional
      // Editable:
      // 7. Email Optional
      // 8. Funding Source Optional
      // 9. Team Size Optional

      const requiredToggleLabels = screen.getAllByText("*Required");

      expect(requiredToggleLabels.length).toBe(4);
    });
  });

  describe("Remove question", () => {
    it("displays remove icon for each editable question", () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      expect(screen.getAllByTestId("remove-question")).toHaveLength(
        editableQuestions.length
      );
    });

    it("removes question when remove icon is clicked", () => {
      const editableQuestions = initialQuestionsQF.filter(
        (q) => q.fixed !== true
      );

      const indexToBeRemoved = randomInt(0, 3);

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      const removeIcons = screen.getAllByTestId("remove-question");
      fireEvent.click(removeIcons[indexToBeRemoved]);

      expect(screen.getAllByTestId("remove-question")).toHaveLength(
        editableQuestions.length - 1
      );

      expect(
        screen.queryByText(editableQuestions[indexToBeRemoved].title)
      ).not.toBeInTheDocument();
    });
  });

  describe("Add question", () => {
    it("displays add a question on RoundApplicationForm", () => {
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      expect(
        screen.getByRole("button", {
          name: /Add question/i,
        })
      ).toBeInTheDocument();
    });

    it("adds a new question on clicking add a new question button", async () => {
      const editableQuestions = initialQuestionsQF;
      const newTitle = "New Question";

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata,
            },
          }}
          stepper={FormStepper}
        />
      );

      // +1: Wallet Address
      expect(screen.getAllByTestId("application-question")).toHaveLength(
        editableQuestions.length
      );

      const addAQuestion = screen.getByRole("button", {
        name: /Add question/i,
      });
      fireEvent.click(addAQuestion);

      let selectList = screen.getByTestId("select-question");
      const selectButton = within(selectList).getByRole("button");
      fireEvent.click(selectButton);

      selectList = screen.getByTestId("select-question");

      const selectType = within(selectList).getAllByText("Paragraph");
      fireEvent.click(selectType[0]);

      const inputField = screen.getByTestId("question-title-input");
      fireEvent.change(inputField, { target: { value: newTitle } });

      const save = screen.getByTestId("save-question");
      fireEvent.click(save);

      expect(screen.getAllByText(newTitle)).toHaveLength(1);
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

    it("render the requirement initial correct", () => {
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

      // 1. Project Name Required
      // 2. Project Website Required
      // 3. Project Description Required
      // 4. Wallet address Required
      // Socials:
      // 5. Twitter Optional <---
      // 6. Github Optional  <---
      // Editable:
      // 7. Email Required
      // 8. Funding Source Required
      // 9. Team Size Required

      expect(screen.getAllByText("Optional")).toHaveLength(2);
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
});

export const renderWithContext = (ui: JSX.Element) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);
