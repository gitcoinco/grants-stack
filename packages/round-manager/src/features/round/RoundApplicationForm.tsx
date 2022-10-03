import { useContext, useEffect, useState } from "react";
import {
  FieldErrors,
  SubmitHandler,
  useForm,
  UseFormRegisterReturn,
} from "react-hook-form";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormStepper as FS } from "../common/FormStepper";
import { ProgressStatus, Round } from "../api/types";
import { FormContext } from "../common/FormWizard";
import { Button, Input } from "../common/styles";
import { generateApplicationSchema } from "../api/utils";
import { useWallet } from "../common/Auth";
import { PencilIcon, XIcon } from "@heroicons/react/solid";
import ProgressModal from "../common/ProgressModal";
import ErrorModal from "../common/ErrorModal";
import { errorModalDelayMs } from "../../constants";
import { useCreateRound } from "../../context/round/CreateRoundContext";

const ValidationSchema = yup.object().shape({
  applicationMetadata: yup.object({
    customQuestions: yup.object({
      email: yup.string(),
      fundingSource: yup.string(),
      profit2022: yup.string(),
      teamSize: yup.string(),
    }),
  }),
});

export function RoundApplicationForm(props: {
  initialData: any;
  stepper: typeof FS;
}) {
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const { currentStep, setCurrentStep, stepsCount, formData } =
    useContext(FormContext);
  const Steps = props.stepper;
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const search = useLocation().search;
  /* Reasonable to assume programId is non-null since we would redirect to 404 otherwise */
  const programId = new URLSearchParams(search).get("programId") as string;

  const navigate = useNavigate();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Round>({
    defaultValues: formData,
    resolver: yupResolver(ValidationSchema),
  });

  const { chain } = useWallet();

  const {
    createRound,
    IPFSCurrentStatus,
    contractDeploymentStatus,
    indexingStatus,
  } = useCreateRound();

  useEffect(() => {
    const isSuccess =
      IPFSCurrentStatus === ProgressStatus.IS_SUCCESS &&
      contractDeploymentStatus === ProgressStatus.IS_SUCCESS &&
      indexingStatus === ProgressStatus.IS_SUCCESS;

    if (isSuccess) {
      redirectToProgramDetails(navigate, 2000, programId);
    }
  }, [
    IPFSCurrentStatus,
    contractDeploymentStatus,
    indexingStatus,
    programId,
    navigate,
  ]);

  useEffect(() => {
    if (
      IPFSCurrentStatus === ProgressStatus.IS_ERROR ||
      contractDeploymentStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      redirectToProgramDetails(navigate, 5000, programId);
    }
  }, [
    IPFSCurrentStatus,
    contractDeploymentStatus,
    indexingStatus,
    navigate,
    programId,
  ]);

  const prev = () => setCurrentStep(currentStep - 1);

  const next: SubmitHandler<Round> = async (values) => {
    try {
      setOpenProgressModal(true);
      const data = { ...formData, ...values };

      const roundMetadataWithProgramContractAddress = {
        ...data.roundMetadata,
        programContractAddress: programId!,
      };

      const applicationQuestions = {
        lastUpdatedOn: Date.now(),
        applicationSchema: generateApplicationSchema(data.applicationMetadata),
      };

      const round = {
        ...data,
        votingStrategy: "0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6", // QuadraticFundingVotingStrategy contract
        token: "0x21C8a148933E6CA502B47D729a485579c22E8A69", // DAI token
        ownedBy: programId!,
        operatorWallets: props.initialData.program!.operatorWallets,
      };

      await createRound({
        roundMetadataWithProgramContractAddress,
        applicationQuestions,
        round,
      });

      reset();
    } catch (e) {
      console.error(e);
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
      description: `Connecting to the ${chain.name} blockchain.`,
      status: contractDeploymentStatus,
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
    contractDeploymentStatus === ProgressStatus.IN_PROGRESS ||
    indexingStatus === ProgressStatus.IN_PROGRESS ||
    indexingStatus === ProgressStatus.IS_SUCCESS ||
    !props.initialData.program;

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
              edit={edit}
              onClick={() => setEdit(false)}
              onClick1={() => setEdit(true)}
              register={register("applicationMetadata.customQuestions.email")}
              errors={errors}
              register1={register(
                "applicationMetadata.customQuestions.fundingSource"
              )}
              register2={register(
                "applicationMetadata.customQuestions.profit2022"
              )}
              register3={register(
                "applicationMetadata.customQuestions.teamSize"
              )}
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
          <ProgressModal
            isOpen={openProgressModal}
            setIsOpen={setOpenProgressModal}
            subheading={"Please hold while we create your Grant Round."}
            steps={progressSteps}
          />

          <ErrorModal
            isOpen={openErrorModal}
            setIsOpen={setOpenErrorModal}
            tryAgainFn={handleSubmit(next)}
          />
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

function ApplicationInformation(props: {
  edit: boolean;
  onClick: () => void;
  onClick1: () => void;
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  register1: UseFormRegisterReturn<string>;
  register2: UseFormRegisterReturn<string>;
  register3: UseFormRegisterReturn<string>;
}) {
  return (
    <div className="rounded-t shadow-sm pt-7 pb-10 sm:px-6 bg-white">
      <div className="flex">
        <p className="flex-1 mb-2">Application Information</p>
        {props.edit ? (
          <ExitEditMode onClick={props.onClick} />
        ) : (
          <EnterEditMode onClick={props.onClick1} />
        )}
      </div>
      <p className="text-sm text-grey-400 mb-6">
        Project Owners will need to fill out an application with the details
        below.
      </p>
      {!props.edit && (
        <>
          <hr />
          <div className="flex my-4">
            <span className="flex-1 text-sm">Payout Wallet Address</span>
            <span className="text-xs text-violet-400">*Required</span>
          </div>
          <hr />
          <div className="flex my-4">
            <span className="flex-1 text-sm">Email Address</span>
            <span className="text-xs text-violet-400">*Required</span>
          </div>
          <hr />
          <hr />
          <div className="flex my-4">
            <span className="flex-1 text-sm">Funding Sources</span>
            <span className="text-xs text-violet-400">*Required</span>
          </div>
          <hr />
          <div className="flex my-4">
            <span className="flex-1 text-sm">2022 Profit</span>
            <span className="text-xs text-violet-400">*Required</span>
          </div>
          <hr />
          <div className="flex my-4">
            <span className="flex-1 text-sm">Team Size</span>
            <span className="text-xs text-violet-400">*Required</span>
          </div>
          <hr />
        </>
      )}

      {props.edit && (
        <div className="grid grid-cols-6 gap-6">
          {/* Email */}
          <div className="col-span-6 sm:col-span-3 sm:col-start-1">
            <label
              htmlFor="applicationMetadata.contact.email"
              className="block text-xs font-medium"
            >
              Email Address
            </label>
            <Input
              {...props.register}
              $hasError={
                props.errors.applicationMetadata?.customQuestions?.email
              }
              type="text"
              placeholder='i.e. "email@domain.com"'
            />
            {props.errors.applicationMetadata?.customQuestions?.email && (
              <p className="text-xs text-pink-500">
                {
                  props.errors.applicationMetadata?.customQuestions?.email
                    ?.message
                }
              </p>
            )}
          </div>

          {/* Funding Sources */}
          <div className="col-span-6 sm:col-span-3">
            <label
              htmlFor="applicationMetadata.customQuestions.fundingSources"
              className="block text-xs font-medium"
            >
              Funding Sources
            </label>
            <Input
              {...props.register1}
              $hasError={
                props.errors.applicationMetadata?.customQuestions?.fundingSource
              }
              type="text"
              placeholder='i.e. "What sources of funding do you currently have?"'
            />
            {props.errors.applicationMetadata?.customQuestions
              ?.fundingSource && (
              <p className="text-xs text-pink-500">
                {
                  props.errors.applicationMetadata?.customQuestions
                    ?.fundingSource?.message
                }
              </p>
            )}
          </div>

          {/* 2022 Profit */}
          <div className="col-span-6 sm:col-span-3">
            <label
              htmlFor="applicationMetadata.customQuestions.profit2022"
              className="block text-xs font-medium"
            >
              2022 Profit
            </label>
            <Input
              {...props.register2}
              $hasError={
                props.errors.applicationMetadata?.customQuestions?.profit2022
              }
              type="text"
              placeholder='i.e. "Please enter your profit for 2022."'
            />
            {props.errors.applicationMetadata?.customQuestions?.profit2022 && (
              <p className="text-xs text-pink-500">
                {
                  props.errors.applicationMetadata?.customQuestions?.profit2022
                    ?.message
                }
              </p>
            )}
          </div>

          {/* Team Size */}
          <div className="col-span-6 sm:col-span-3">
            <label
              htmlFor="applicationMetadata.customQuestions.teamSize"
              className="block text-xs font-medium"
            >
              Team Size
            </label>
            <Input
              {...props.register3}
              $hasError={
                props.errors.applicationMetadata?.customQuestions?.teamSize
              }
              type="text"
              placeholder='i.e. "What is the size of your team"'
            />
            {props.errors.applicationMetadata?.customQuestions?.teamSize && (
              <p className="text-xs text-pink-500">
                {
                  props.errors.applicationMetadata?.customQuestions?.teamSize
                    ?.message
                }
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EnterEditMode(props: { onClick: () => void }) {
  return (
    <Button
      type="button"
      $variant="outline"
      className="border w-9 h-9 p-1.5"
      onClick={props.onClick}
    >
      <PencilIcon aria-hidden="true" />
    </Button>
  );
}

function ExitEditMode(props: { onClick: () => void }) {
  return (
    <Button
      type="button"
      $variant="outline"
      className="border text-pink-500 w-9 h-9 p-1.5"
      onClick={props.onClick}
    >
      <XIcon aria-hidden="true" />
    </Button>
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
