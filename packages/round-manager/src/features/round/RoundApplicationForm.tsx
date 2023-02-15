import { datadogLogs } from "@datadog/browser-logs";
import {
  EyeIcon, EyeOffIcon, LockClosedIcon,
  LockOpenIcon
} from "@heroicons/react/outline";
import {
  PencilIcon,
  PlusSmIcon,
  XIcon
} from "@heroicons/react/solid";
import { Button } from "common/src/styles";
import { useContext, useEffect, useState } from "react";
import {
  SubmitHandler,
  useFieldArray, useForm
} from "react-hook-form";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { errorModalDelayMs } from "../../constants";
import { useCreateRound } from "../../context/round/CreateRoundContext";
import {
  ApplicationMetadata,
  EditQuestion,
  Program,
  ProgressStatus,
  QuestionOption,
  Round
} from "../api/types";
import { generateApplicationSchema } from "../api/utils";
import AddQuestionModal from "../common/AddQuestionModal";
import ErrorModal from "../common/ErrorModal";
import { FormStepper as FS } from "../common/FormStepper";
import { FormContext } from "../common/FormWizard";
import InfoModal from "../common/InfoModal";
import ProgressModal from "../common/ProgressModal";

import { InputIcon } from "../common/InputIcon";
import PreviewQuestionModal from "../common/PreviewQuestionModal";

const payoutQuestion: QuestionOption = {
  title: "Payout Wallet Address",
  required: true,
  encrypted: false,
  hidden: true,
  inputType: "address",
};

export const initialQuestions: QuestionOption[] = [
  {
    title: "Email Address",
    required: true,
    encrypted: true,
    hidden: true,
    inputType: "email",
  },
  {
    title: "Funding Sources",
    required: true,
    encrypted: false,
    hidden: false,
    inputType: "short-answer",
  },
  {
    title: "Team Size",
    required: true,
    encrypted: false,
    hidden: false,
    inputType: "short-answer",
  },
];

export function RoundApplicationForm(props: {
  initialData: {
    program: Program;
  };
  stepper: typeof FS;
}) {
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [openAddQuestionModal, setOpenAddQuestionModal] = useState(false);
  const [openHeadsUpModal, setOpenHeadsUpModal] = useState(false);
  const [toEdit, setToEdit] = useState<EditQuestion | undefined>();

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { control, handleSubmit, register, getValues } = useForm<Round>({
    defaultValues: {
      ...formData,
      applicationMetadata: {
        questions: defaultQuestions,
      },
    },
  });

  const { fields, remove, append, update } = useFieldArray({
    name: "applicationMetadata.questions",
    control,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      await createRound({
        roundMetadataWithProgramContractAddress,
        applicationQuestions,
        round,
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

  const singleQuestion = (field: QuestionOption, key: number) => (
    <div key={key}>
      <div className="flex flex-row my-4 items-center">
        <div className="text-sm basis-2/3">
          <div className="flex flex-row text-xs text-grey-400 items-center">
            <span>
              <InputIcon className="mr-1 mb-0.5 w-3 h-3" type={field.inputType} />
            </span>
            <span className="first-letter:capitalize">
              {field.inputType.replace("-", " ")}
            </span>
          </div>
          {field.title}
        </div>
        <div className="basis-1/3 flex justify-end items-center">
          <div className="text-sm justify-end p-2 leading-tight">
            <div className="flex justify-end">
              {fieldRequired(field.required)}
            </div>
            <div className="flex justify-end">
              {fieldEncrypted(field.encrypted)}
            </div>
            <div className="flex justify-end">
              {fieldHidden(field.hidden)}
            </div>
          </div>
          <div className="text-sm justify-center flex p-2">
            <div className="w-5">
              {key >= 0 &&
                <PencilIcon
                  className="cursor-pointer"
                  onClick={() => {
                    setToEdit({
                      index: key,
                      field: field,
                    });
                    setOpenAddQuestionModal(true);
                  }} />}
            </div>
          </div>
          <div className="w-5 text-red-600">
            {key >= 0 && <XIcon className="cursor-pointer" onClick={() => removeQuestion(key)} />}
          </div>
        </div>
      </div>
      <hr />
    </div>
  )

  const ApplicationQuestions = () => {
    const lockedQuestion = singleQuestion(payoutQuestion, -1);
    const f = fields.map((field, i) => (
      singleQuestion(field, i)
    ));

    return (
      <div data-testid="application-question">
        {/* todo: update the element to reflect tests */}
        {[lockedQuestion, ...f]}
        <Button
          type="button"
          $variant="outline"
          className="inline-flex items-center px-3.5 py-2 mt-5 border-none shadow-sm text-sm rounded text-violet-500 bg-violet-100"
          onClick={() => {
            setToEdit(undefined);
            setOpenAddQuestionModal(true);
          }}
        >
          <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
          Add a Question
        </Button>
        <AddQuestionModal
          show={openAddQuestionModal}
          onSave={addOrEditQuestion}
          onClose={() => {
            setToEdit(undefined)
            setOpenAddQuestionModal(false)
          }}
          question={toEdit}
        />
        <PreviewQuestionModal
          show={openPreviewModal}
          onClose={() => setOpenPreviewModal(false)}
        />
      </div>
    )
  };

  const addOrEditQuestion = (question: EditQuestion) => {
    setOpenAddQuestionModal(false);
    if (question.field) {
      if (!question.index) {
        append(question.field);
      } else {
        update(question.index, question.field);
      }
    }
  };

  const removeQuestion = (index: number) => {
    remove(index);
  };

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <ReviewInformation />
        <Box
          title="Project Information"
          description="These details will be collected from project owners by default during the project creation process.">
          <ProjectInformation />
        </Box>
      </div>
      <div className="md:grid md:grid-cols-3 md:gap-6 mt-7">
        <div className="md:col-span-1"></div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <Box
            title="Application Questions"
            description="Add round application questions for project owners to fulfill the application process."
            onlyTopRounded={true} >
            <ApplicationQuestions />
          </Box>
          <form onSubmit={handleSubmit(next)} className="text-grey-500">
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

const fieldRequired = (required: boolean) => (
  <span className={`text-xs ${required ? "text-violet-400" : "text-grey-400"}`}>
    {required ? "*Required" : "Optional"}
  </span>
)

const fieldEncrypted = (encrypted: boolean) => (
  <div className={`text-xs text-grey-400 flex flex-row`}>
    <div className="w-4 mr-1">
      {encrypted ? <LockClosedIcon /> : <LockOpenIcon />}
    </div>
    <div>
      {encrypted ? "Encrypted" : "Not Encrypted"}
    </div>
  </div>
)

const fieldHidden = (hidden: boolean) => (
  <div className={`text-xs text-grey-400 flex flex-row`}>
    <div className="w-4 mr-1">
      {hidden ? <EyeOffIcon /> : <EyeIcon />}
    </div>
    <div>
      {hidden ? "Hidden from Explorer" : "Shown in Explorer"}
    </div>
  </div>
)

// is this always going to be static?
function ProjectInformation() {
  const fields = [
    { name: "Project Name", required: true },
    { name: "Project Website", required: true },
    { name: "Project Logo", required: false },
    { name: "Project Banner", required: false },
    { name: "Project Description", required: true },
  ];

  return (
    <>
      {fields.map((field, i) => (
        <div key={i} >
          <div className="flex my-4">
            <span className="flex-1 text-sm">{field.name}</span>
            {fieldRequired(field.required)}
          </div>
          {i !== fields.length - 1 && <hr />}
        </div>
      ))}
    </>
  );
}

const Box = ({ title, description, onlyTopRounded = false, children }: { title: string, description: string, onlyTopRounded?: boolean, children: React.ReactNode }) => (
  <div className="mt-5 md:mt-0 md:col-span-2">
    <div className={`${onlyTopRounded ? "rounded-t" : "rounded"} shadow-sm bg-white pt-7 pb-6 sm:px-6`}>
      <p className="mb-2 font-bold">{title}</p>
      <p className="text-sm text-grey-400 mb-6">
        {description}
      </p>
      <hr />
      <div>
        {children}
      </div>
    </div>
  </div>
)

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

function redirectToProgramDetails(
  navigate: NavigateFunction,
  waitSeconds: number,
  programId: string
) {
  setTimeout(() => {
    navigate(`/program/${programId}`);
  }, waitSeconds);
}
