/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  initialCreateRoundState,
} from "../../../context/round/CreateRoundContext";
import { ApplicationMetadata, ProgressStatus } from "../../api/types";
import { saveToIPFS } from "../../api/ipfs";
import { deployRoundContract } from "../../api/round";
import { waitForSubgraphSyncTo } from "../../api/subgraph";
import { FormContext } from "../../common/FormWizard";
import { randomInt } from "crypto";
import { faker } from "@faker-js/faker";

jest.mock("../../api/ipfs");
jest.mock("../../api/round");
jest.mock("../../api/subgraph");
jest.mock("../../common/Auth");
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
  name: faker.random.word()
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
    (deployRoundContract as jest.Mock).mockResolvedValue({
      transactionBlockNumber: 0,
    });
    (waitForSubgraphSyncTo as jest.Mock).mockResolvedValue(0);
  });

  describe("when saving metadata fails", () => {
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
        />,
        { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      );
      const launch = screen.getByRole("button", { name: /Launch/i });
      fireEvent.click(launch);

      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
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
        />,
        { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      );
      const launch = screen.getByRole("button", { name: /Launch/i });
      fireEvent.click(launch);

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
        />,
        { IPFSCurrentStatus: ProgressStatus.IS_ERROR }
      );

      const launch = screen.getByRole("button", { name: /Launch/i });
      fireEvent.click(launch);

      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
      const saveToIpfsCalls = (saveToIPFS as jest.Mock).mock.calls.length;
      expect(saveToIpfsCalls).toEqual(2);

      const tryAgain = await screen.findByTestId("tryAgain");
      fireEvent.click(tryAgain);

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      await waitFor(() => {
        expect((saveToIPFS as jest.Mock).mock.calls.length).toEqual(
          saveToIpfsCalls + 2
        );
      });
    });
  });

  describe("when saving round application metadata succeeds but create round transaction fails", () => {
    const createRoundStateOverride = {
      IPFSCurrentStatus: ProgressStatus.IS_SUCCESS,
      contractDeploymentStatus: ProgressStatus.IS_ERROR,
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
        />,
        createRoundStateOverride
      );
      const launch = screen.getByRole("button", { name: /Launch/i });
      fireEvent.click(launch);

      expect(await screen.findByTestId("error-modal")).toBeInTheDocument();
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
        title: "Some question",
        required: false,
        encrypted: false,
        inputType: "text",
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

  describe("Edit question title", () => {
    it("displays edit icons for each editable question", () => {
      const editableQuestions = initialQuestions;

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata
            },
          }}
          stepper={FormStepper}
        />
      );

      expect(screen.getAllByTestId("edit-title")).toHaveLength(
        editableQuestions.length
      );
    });

    it("enters editable state showing current title for that question when edit is clicked on that question", () => {
      const editableQuestions = initialQuestions;
      const questionIndex = randomInt(0, editableQuestions.length);

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata
            },
          }}
          stepper={FormStepper}
        />
      );
      const editIcons = screen.getAllByTestId("edit-title");
      fireEvent.click(editIcons[questionIndex]);

      expect(
        screen.getByDisplayValue(editableQuestions[questionIndex].title)
      ).toBeInTheDocument();
    });

    it("when in edit mode, saves input as question title when save is clicked on that question and reverts to default ui", async () => {
      const questionIndex = randomInt(0, initialQuestions.length);
      const newTitle = faker.lorem.sentence();

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata
            },
          }}
          stepper={FormStepper}
        />
      );
      // edit title and save
      const editIcons = screen.getAllByTestId("edit-title");
      fireEvent.click(editIcons[questionIndex]);
      const questionTitleInput = await screen.findByTestId(
        "question-title-input"
      );
      fireEvent.input(questionTitleInput, {
        target: { value: newTitle },
      });
      const saveIcon = screen.getByTestId("save-title");
      fireEvent.click(saveIcon);

      expect(await screen.findByText(newTitle)).toBeInTheDocument();
      expect(
        screen.queryByTestId("question-title-input")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("save-title")).not.toBeInTheDocument();
    });
  });

  describe("Encrypted toggle", () => {
    it("displays toggle for encryption option for each editable question", () => {
      const editableQuestions = initialQuestions;

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata
            },
          }}
          stepper={FormStepper}
        />
      );

      expect(screen.getAllByTestId("encrypted-toggle")).toHaveLength(
        editableQuestions.length
      );
    });

    it("toggles each encryption option when clicked", () => {
      const isInitiallyEncrypted = initialQuestions.map((q) => q.encrypted);
      const encryptionTrueClass = "bg-black";
      const encryptionFalseClass = "bg-white";

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata
            },
          }}
          stepper={FormStepper}
        />
      );
      const encryptionToggles = screen.getAllByTestId("encrypted-toggle");
      encryptionToggles.forEach((toggle) => {
        fireEvent.click(toggle);
      });

      const encryptionToggleLabels = screen.getAllByTestId(
        "encrypted-toggle-label"
      );
      encryptionToggles.forEach((toggle, index) => {
        if (isInitiallyEncrypted[index]) {
          expect(toggle.childNodes[0]).toHaveClass(encryptionFalseClass);
          expect(toggle).not.toBeChecked();
          expect(encryptionToggleLabels[index]).toHaveTextContent(
            "Unencrypted"
          );
        } else {
          expect(toggle.childNodes[0]).toHaveClass(encryptionTrueClass);
          expect(toggle).toBeChecked();
          expect(encryptionToggleLabels[index]).toHaveTextContent("Encrypted");
        }
      });
    });
  });

  describe("Required toggle", () => {
    it("displays toggle for required option for each editable question", () => {
      const editableQuestions = initialQuestions;
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata
            },
          }}
          stepper={FormStepper}
        />
      );

      expect(screen.getAllByTestId("required-toggle")).toHaveLength(
        editableQuestions.length
      );
    });

    it("toggle each required option when clicked", () => {
      const isInitiallyRequired = initialQuestions.map((q) => q.required);
      const requiredTrueClass = "bg-violet-400";
      const requiredFalseClass = "bg-white";

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
              metadata: randomMetadata
            },
          }}
          stepper={FormStepper}
        />
      );

      const requiredToggles = screen.getAllByTestId("required-toggle");
      requiredToggles.forEach((toggle) => {
        fireEvent.click(toggle);
      });

      const requiredToggleLabels = screen.getAllByTestId(
        "required-toggle-label"
      );
      requiredToggles.forEach((toggle, index) => {
        if (isInitiallyRequired[index]) {
          expect(toggle.childNodes[0]).toHaveClass(requiredFalseClass);
          expect(toggle).not.toBeChecked();
          expect(requiredToggleLabels[index]).toHaveTextContent("Optional");
        } else {
          expect(toggle.childNodes[0]).toHaveClass(requiredTrueClass);
          expect(toggle).toBeChecked();
          expect(requiredToggleLabels[index]).toHaveTextContent(/Required/i);
        }
      });
    });
  });

  describe("Remove question", () => {
    it("displays remove icon for each editable question", () => {
      const editableQuestions = initialQuestions;
      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
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
      const editableQuestions = initialQuestions;

      const indexToBeRemoved = randomInt(0, 3);

      renderWithContext(
        <RoundApplicationForm
          initialData={{
            program: {
              operatorWallets: [],
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
});

export const renderWithContext = (
  ui: JSX.Element,
  createRoundStateOverrides: Partial<CreateRoundState> = {},
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <CreateRoundContext.Provider
        value={{
          state: { ...initialCreateRoundState, ...createRoundStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </CreateRoundContext.Provider>
    </MemoryRouter>
  );
