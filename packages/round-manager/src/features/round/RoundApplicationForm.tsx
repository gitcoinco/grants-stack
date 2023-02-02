import { useContext, useEffect, useState } from "react";
import {
  Control,
  Controller,
  FieldArrayWithId,
  SubmitHandler,
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useForm,
  UseFormGetValues,
  UseFormRegister,
} from "react-hook-form";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { FormStepper as FS } from "../common/FormStepper";
import {
  ApplicationMetadata,
  Program,
  ProgressStatus,
  QuestionOptions,
  Round,
  VotingStrategy,
} from "../api/types";
import { FormContext } from "../common/FormWizard";
import { generateApplicationSchema } from "../api/utils";
import ProgressModal from "../common/ProgressModal";
import ErrorModal from "../common/ErrorModal";
import { errorModalDelayMs } from "../../constants";
import { useCreateRound } from "../../context/round/CreateRoundContext";
import { datadogLogs } from "@datadog/browser-logs";
import {
  CheckIcon,
  InformationCircleIcon,
  PencilIcon,
  PlusSmIcon,
  XIcon,
} from "@heroicons/react/solid";
import { Switch } from "@headlessui/react";
import ReactTooltip from "react-tooltip";
import { Button } from "../common/styles";
import InfoModal from "../common/InfoModal";

const payoutQuestion: QuestionOptions = {
  title: "Payout Wallet Address",
  required: true,
  encrypted: false,
  inputType: "text",
};
export const initialQuestions: QuestionOptions[] = [
  {
    title: "Email Address",
    required: true,
    encrypted: true,
    inputType: "text",
  },
  {
    title: "Funding Sources",
    required: true,
    encrypted: false,
    inputType: "text",
  },
  {
    title: "Team Size",
    required: true,
    encrypted: false,
    inputType: "text",
  },
];

export function RoundApplicationForm(props: {
  initialData: {
    program: Program;
  };
  stepper: typeof FS;
}) {
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openHeadsUpModal, setOpenHeadsUpModal] = useState(false);

  const { currentStep, setCurrentStep, stepsCount, formData } =
    useContext(FormContext);
  const Steps = props.stepper;
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const search = useLocation().search;
  /* Reasonable to assume programId is non-null since we would redirect to 404 otherwise */
  const programId = new URLSearchParams(search).get("programId") as string;

  const navigate = useNavigate();

  const defaultQuestions: ApplicationMetadata["questions"] =
    // @ts-expect-error TODO: either fix this or refactor the whole formstepper
    formData?.applicationMetadata?.questions ?? initialQuestions;

  const { control, handleSubmit, register, getValues } = useForm<Round>({
    defaultValues: {
      ...formData,
      applicationMetadata: {
        questions: defaultQuestions,
      },
    },
  });

  const { fields, remove, append } = useFieldArray({
    name: "applicationMetadata.questions",
    control,
  });
  const [isInEditState, setIsInEditState] = useState<boolean[]>(
    fields.map(() => false)
  );

  const {
    createRound,
    IPFSCurrentStatus,
    votingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    indexingStatus,
  } = useCreateRound();

  useEffect(() => {
    const isSuccess =
      IPFSCurrentStatus === ProgressStatus.IS_SUCCESS &&
      votingContractDeploymentStatus === ProgressStatus.IS_SUCCESS &&
      payoutContractDeploymentStatus === ProgressStatus.IS_SUCCESS &&
      roundContractDeploymentStatus === ProgressStatus.IS_SUCCESS &&
      indexingStatus === ProgressStatus.IS_SUCCESS;

    if (isSuccess) {
      redirectToProgramDetails(navigate, 2000, programId);
    }
  }, [
    IPFSCurrentStatus,
    votingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    indexingStatus,
    programId,
    navigate,
  ]);

  useEffect(() => {
    if (
      IPFSCurrentStatus === ProgressStatus.IS_ERROR ||
      votingContractDeploymentStatus === ProgressStatus.IS_ERROR ||
      payoutContractDeploymentStatus === ProgressStatus.IS_ERROR ||
      roundContractDeploymentStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      redirectToProgramDetails(navigate, 5000, programId);
    }
  }, [
    IPFSCurrentStatus,
    votingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    indexingStatus,
    navigate,
    programId,
  ]);

  const prev = () => setCurrentStep(currentStep - 1);

  const next: SubmitHandler<Round> = async (values) => {
    if (!openHeadsUpModal) {
      setOpenHeadsUpModal(true);
      return;
    }

    try {
      setOpenProgressModal(true);
      const data: Partial<Round> = { ...formData, ...values };

      const roundMetadataWithProgramContractAddress: Round["roundMetadata"] = {
        ...(data.roundMetadata as Round["roundMetadata"]),
        programContractAddress: programId,
      };

      const applicationQuestions = {
        lastUpdatedOn: Date.now(),
        applicationSchema: generateApplicationSchema(
          data.applicationMetadata?.questions
        ),
      };

      const round = {
        ...data,
        ownedBy: programId,
        operatorWallets: props.initialData.program.operatorWallets,
      } as Round;

      const votingStrategy = data.votingStrategy as VotingStrategy;

      await createRound({
        roundMetadataWithProgramContractAddress,
        applicationQuestions,
        round,
        votingStrategy,
      });
    } catch (error) {
      datadogLogs.logger.error(
        `error: RoundApplcationForm next - ${error}, programId - ${programId}`
      );
      console.error("RoundApplcationForm", error);
    }
  };

  const progressSteps = [
    {
      name: "Storing",
      description: "The metadata is being saved in a safe place.",
      status: IPFSCurrentStatus,
    },
    {
      name: "Deploying",
      description: "The quadratic funding contract is being deployed.",
      status: votingContractDeploymentStatus,
    },
    {
      name: "Deploying",
      description: "The payout contract is being deployed.",
      status: payoutContractDeploymentStatus,
    },
    {
      name: "Deploying",
      description: "The round contract is being deployed.",
      status: roundContractDeploymentStatus,
    },
    {
      name: "Indexing",
      description: "The subgraph is indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  const disableNext: boolean =
    IPFSCurrentStatus === ProgressStatus.IN_PROGRESS ||
    votingContractDeploymentStatus === ProgressStatus.IN_PROGRESS ||
    payoutContractDeploymentStatus === ProgressStatus.IN_PROGRESS ||
    roundContractDeploymentStatus === ProgressStatus.IN_PROGRESS ||
    indexingStatus === ProgressStatus.IN_PROGRESS ||
    indexingStatus === ProgressStatus.IS_SUCCESS ||
    !props.initialData.program;

  const formSubmitModals = () => (
    <InfoModal
      title={"Heads up!"}
      body={<InfoModalBody />}
      isOpen={openHeadsUpModal}
      setIsOpen={setOpenHeadsUpModal}
      continueButtonAction={() => {
        handleSubmit(next)();
      }}
    >
      <ProgressModal
        isOpen={openProgressModal}
        subheading={"Please hold while we create your Grant Round."}
        steps={progressSteps}
      >
        <ErrorModal
          isOpen={openErrorModal}
          setIsOpen={setOpenErrorModal}
          tryAgainFn={handleSubmit(next)}
          doneFn={() => {
            setOpenErrorModal(false);
            setOpenProgressModal(false);
            setOpenHeadsUpModal(false);
          }}
        />
      </ProgressModal>
    </InfoModal>
  );

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <ReviewInformation />
        <ProjectInformation />
      </div>
      <hr className="my-6" />
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1"></div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit(next)} className="text-grey-500">
            <ApplicationInformation
              fields={fields}
              register={register}
              editStates={isInEditState}
              setEditStates={setIsInEditState}
              getValues={getValues}
              control={control}
              remove={remove}
              append={append}
            />

            <div className="px-6 align-middle py-3.5 shadow-md">
              <Steps
                currentStep={currentStep}
                stepsCount={stepsCount}
                prev={prev}
                disableNext={disableNext}
              />
            </div>
          </form>
          {formSubmitModals()}
        </div>
      </div>
    </div>
  );
}

function ReviewInformation() {
  return (
    <div className="md:col-span-1">
      <p className="text-base leading-6">Review Information</p>
      <p className="mt-1 text-sm text-grey-400">
        Carefully review the information details Project Owners will need to
        fulfill the application process.
      </p>
      <p className="italic mt-4 text-sm text-grey-400">
        Note: that some personal identifiable information will be stored
        publicly.
      </p>
    </div>
  );
}

function ProjectInformation() {
  return (
    <div className="mt-5 md:mt-0 md:col-span-2">
      <div className="rounded shadow-sm bg-white pt-7 pb-6 sm:px-6">
        <p className="mb-2">Project Information</p>
        <p className="text-sm text-grey-400 mb-6">
          These details will be collected from project owners by default during
          the project creation process.
        </p>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Project Name</span>
          <span className="text-xs text-violet-400">*Required</span>
        </div>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Project Website</span>
          <span className="text-xs text-violet-400">*Required</span>
        </div>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Project Twitter</span>
          <span className="text-xs text-grey-400">Optional</span>
        </div>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Your GitHub Username</span>
          <span className="text-xs text-grey-400">Optional</span>
        </div>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Project GitHub Organization</span>
          <span className="text-xs text-grey-400">Optional</span>
        </div>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Project Logo</span>
          <span className="text-xs text-grey-400">Optional</span>
        </div>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Project Banner</span>
          <span className="text-xs text-grey-400">Optional</span>
        </div>
        <hr />
        <div className="flex my-4">
          <span className="flex-1 text-sm">Project Description</span>
          <span className="text-xs text-violet-400">*Required</span>
        </div>
      </div>
    </div>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function EncryptedInformation() {
  return (
    <>
      <InformationCircleIcon
        data-tip
        data-background-color="#0E0333"
        data-for="encrypted-tooltip"
        className="inline h-4 w-4 ml-2 mr-3"
        data-testid={"encrypted-tooltip"}
      />

      <ReactTooltip
        id="encrypted-tooltip"
        place="bottom"
        type="dark"
        effect="solid"
      >
        <p className="text-xs">
          Encryption allows for greater <br />
          security and confidentiailty <br />
          for your applicants.
        </p>
      </ReactTooltip>
    </>
  );
}

function ApplicationInformation(props: {
  fields: FieldArrayWithId<Round, "applicationMetadata.questions">[];
  register: UseFormRegister<Round>;
  editStates: boolean[];
  setEditStates: (a: boolean[]) => void;
  getValues: UseFormGetValues<Round>;
  control: Control<Round>;
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<Round, "applicationMetadata.questions">;
}) {
  const {
    fields,
    register,
    editStates,
    setEditStates,
    getValues,
    control,
    remove,
    append,
  } = props;

  const normalTitle = (index: number, disabled?: boolean) => (
    <div className="my-4">
      {getValues(`applicationMetadata.questions.${index}.title`)}
      <PencilIcon
        onClick={() => {
          const newEditState = [...editStates];
          newEditState[index] = true;
          setEditStates(newEditState);
        }}
        className={classNames(
          disabled ? "hidden" : "visible",
          "inline h-4 w-4 mb-1 ml-2 text-grey-400"
        )}
        data-testid={"edit-title"}
      />
    </div>
  );

  const editableTitle = (index: number) => (
    <div className="flex my-2 gap-2 items-center">
      <input
        {...register(`applicationMetadata.questions.${index}.title`)}
        type="text"
        placeholder="Enter desired application info here."
        data-testid={"question-title-input"}
        className="text-sm border-violet-400 rounded-md w-full"
      />

      <button
        className={
          "border shadow-sm border-grey-100 rounded flex items-center gap-1 px-2 pr-3"
        }
        onClick={() => {
          const newEditState = [...editStates];
          newEditState[index] = false;
          setEditStates(newEditState);
        }}
        data-testid={"save-title"}
      >
        <CheckIcon className="inline h-5 w-5 my-1 mx-1 text-teal-500" />
        Save
      </button>
    </div>
  );

  const encryptionToggle = (index: number, disabled?: boolean) => {
    return (
      <Controller
        control={control}
        name={`applicationMetadata.questions.${index}.encrypted`}
        render={({ field }) => (
          <Switch.Group
            as="div"
            className={classNames(
              disabled ? "opacity-60" : "opacity-100",
              "flex items-center justify-end"
            )}
          >
            <span className="flex-grow">
              <Switch.Label
                as="span"
                className="text-sm font-medium text-gray-900 flex justify-end"
                passive
                data-testid="encrypted-toggle-label"
              >
                <p className="text-xs text-right my-auto">
                  {field.value ? "Encrypted" : "Unencrypted"}
                </p>

                <EncryptedInformation />
              </Switch.Label>
            </span>
            <Switch
              {...field}
              checked={field.value}
              value={field.value.toString()}
              className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
              data-testid="encrypted-toggle"
              disabled={disabled}
            >
              <span
                aria-hidden="true"
                className={classNames(
                  field.value
                    ? "translate-x-5 bg-black"
                    : "translate-x-0 bg-white",
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
                )}
              />
            </Switch>
          </Switch.Group>
        )}
      />
    );
  };

  const requiredToggle = (index: number, disabled?: boolean) => {
    return (
      <Controller
        control={control}
        name={`applicationMetadata.questions.${index}.required`}
        render={({ field }) => (
          <Switch.Group
            as="div"
            className={classNames(
              disabled ? "opacity-80" : "opacity-100",
              "flex items-center justify-end"
            )}
            data-testid="required-toggle-label"
          >
            <span className="flex-grow">
              <Switch.Label
                as="span"
                className="text-sm font-medium text-gray-900"
                passive
              >
                {field.value ? (
                  <p className="text-xs mr-2 text-right text-violet-400">
                    *Required
                  </p>
                ) : (
                  <p className="text-xs mr-2 text-right">Optional</p>
                )}
              </Switch.Label>
            </span>
            <Switch
              {...field}
              checked={field.value}
              value={field.value.toString()}
              className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              data-testid="required-toggle"
              disabled={disabled}
            >
              <span
                aria-hidden="true"
                className={classNames(
                  field.value
                    ? "translate-x-5 bg-violet-400"
                    : "translate-x-0 bg-white",
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
                )}
              />
            </Switch>
          </Switch.Group>
        )}
      />
    );
  };

  const Question = (props: { index: number }) => {
    const { index } = props;
    return (
      <div data-testid={"application-question"}>
        <div className="flex flex-row">
          <div className="text-sm basis-2/5">
            {editStates[index] ||
            getValues(`applicationMetadata.questions.${index}.title`).length ==
              0
              ? editableTitle(index)
              : normalTitle(index)}
          </div>
          <div className="basis-3/5 flex justify-around">
            <div className="my-auto w-1/2">{encryptionToggle(index)}</div>
            <div className="my-auto w-1/3">{requiredToggle(index)}</div>
            <div className="my-auto">
              <DeleteQuestion onClick={() => remove(index)} />
            </div>
          </div>
        </div>
        <hr />
      </div>
    );
  };

  return (
    <div className="mt-5 md:mt-0 md:col-span-2">
      <div className="rounded-t shadow-sm pt-7 pb-10 sm:px-6 bg-white">
        <div className="flex">
          <p className="flex-1 mb-2">Application Information</p>
        </div>
        <p className="text-sm text-grey-400 mb-6">
          Project Owners will need to fill out an application with the details
          below.
        </p>

        {disabledPayoutQuestion}
        <hr />
        {fields.map((field, index) => (
          <Question key={index} index={index} />
        ))}

        <AddQuestion
          onClick={() =>
            append({
              title: "",
              required: false,
              encrypted: false,
              inputType: "text",
            })
          }
        />
      </div>
    </div>
  );
}

function redirectToProgramDetails(
  navigate: NavigateFunction,
  waitSeconds: number,
  programId: string
) {
  setTimeout(() => {
    navigate(`/program/${programId}`);
  }, waitSeconds);
}

const disabledPayoutQuestion = (
  <div className="flex flex-row">
    <div className="text-sm basis-2/5">
      <div className="my-4">{payoutQuestion.title}</div>
    </div>
    <div className="basis-3/5 flex justify-around">
      <div className="my-auto w-1/2">
        <Switch.Group
          as="div"
          className={classNames("opacity-60", "flex items-center justify-end")}
        >
          <span className="flex-grow">
            <Switch.Label
              as="span"
              className="text-sm font-medium text-gray-900 flex justify-end"
              passive
            >
              <p className="text-xs my-auto">Unencrypted</p>

              <InformationCircleIcon
                data-tip
                data-background-color="#0E0333"
                data-for="encrypted-tooltip"
                className="inline h-4 w-4 ml-2 mr-3"
              />

              <ReactTooltip
                id="encrypted-tooltip"
                place="bottom"
                type="dark"
                effect="solid"
              >
                <p className="text-xs">
                  Encryption allows for greater <br />
                  security and confidentiailty <br />
                  for your applicants.
                </p>
              </ReactTooltip>
            </Switch.Label>
          </span>
          <Switch
            checked={false}
            className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
            disabled={true}
          >
            <span
              aria-hidden="true"
              className={classNames(
                "translate-x-0 bg-white",
                "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
              )}
            />
          </Switch>
        </Switch.Group>
      </div>
      <div className="my-auto w-1/3">
        <Switch.Group
          as="div"
          className={classNames("opacity-80", "flex items-center justify-end")}
        >
          <span className="flex-grow">
            <Switch.Label
              as="span"
              className="text-sm font-medium text-gray-900"
              passive
            >
              <p className="text-xs mr-2 text-violet-400 text-right">
                *Required
              </p>
            </Switch.Label>
          </span>
          <Switch
            checked={true}
            className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={true}
          >
            <span
              aria-hidden="true"
              className={classNames(
                "translate-x-5 bg-violet-400",
                "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
              )}
            />
          </Switch>
        </Switch.Group>
      </div>
      <div className="my-auto">
        <XIcon
          className={classNames(
            "invisible",
            "inline h-4 w-4 mb-1 ml-2 text-red-600"
          )}
        />
      </div>
    </div>
  </div>
);

function DeleteQuestion(props: { onClick: () => void }) {
  return (
    <XIcon
      className={classNames("visible", "inline h-4 w-4 mb-1 ml-2 text-red-600")}
      data-testid={"remove-question"}
      onClick={props.onClick}
    />
  );
}

function AddQuestion(props: { onClick: () => void }) {
  return (
    <Button
      type="button"
      $variant="outline"
      className="inline-flex items-center px-3.5 py-2 mt-5 border-none shadow-sm text-sm rounded text-violet-500 bg-violet-100"
      onClick={props.onClick}
    >
      <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
      Add A Question
    </Button>
  );
}

function InfoModalBody() {
  return (
    <div className="text-sm text-grey-400 gap-16">
      <p className="text-sm">
        Each grant round on the protocol requires three smart contracts.
      </p>
      <p className="text-sm my-2">
        You'll have to sign a transaction to deploy each of the following:
      </p>
      <ul className="list-disc list-inside pl-3">
        <li>Quadratic Funding contract</li>
        <li>Payout contract</li>
        <li>Round core contract</li>
      </ul>
    </div>
  );
}
