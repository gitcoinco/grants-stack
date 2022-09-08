import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useCreateRoundMutation } from "../api/services/round";
import { useSaveToIPFSMutation } from "../api/services/ipfs";
import { Round } from "../api/types";
import { FormContext } from "../common/FormWizard";
import { Button, Input } from "../common/styles";
import { generateApplicationSchema } from "../api/utils";
import { useWallet } from "../common/Auth";
import { PencilIcon, XIcon } from "@heroicons/react/solid";
import ProgressModal, { ProgressStatus } from "../common/ProgressModal";
import ErrorModal from "../common/ErrorModal";
import { errorModalDelayMs } from "../../constants";

const ValidationSchema = yup.object().shape({
  applicationMetadata: yup.object({
    customQuestions: yup.object({
      email: yup.string(),
      twitter: yup.string(),
      github: yup.string(),
      githubOrganization: yup.string(),
      fundingSource: yup.string(),
      profit2022: yup.string(),
      teamSize: yup.string(),
    }),
  }),
});

export function RoundApplicationForm(props: {
  initialData: any;
  stepper: any;
}) {
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const { currentStep, setCurrentStep, stepsCount, formData } =
    useContext(FormContext);
  const FormStepper = props.stepper;
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const search = useLocation().search;
  const programId = new URLSearchParams(search).get("programId");

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

  const { chain, signer } = useWallet();

  const [
    saveToIPFS,
    {
      isLoading: isSavingToIPFS,
      isSuccess: isSavedToIPFS,
      isError: isIPFSError,
    },
  ] = useSaveToIPFSMutation();

  const [createRound, { isLoading, isSuccess, isError: isRoundError }] =
    useCreateRoundMutation();

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate(`/program/${programId}`);
      }, 2000);
    }

    if (isLoading) {
      setOpenProgressModal(true);
    }
  }, [isSuccess, isLoading, programId, navigate]);

  useEffect(() => {
    if (isIPFSError || isRoundError) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }
  }, [isIPFSError, isRoundError]);

  const prev = () => setCurrentStep(currentStep - 1);

  const next: SubmitHandler<Round> = async (values) => {
    try {
      setOpenProgressModal(true);

      const data = { ...formData, ...values };

      // Save round and application metadata to IPFS
      const [metadataPointer, applicationMetadataPointer] = await Promise.all([
        saveToIPFS({
          content: data.roundMetadata,
          metadata: {
            name: "round-metadata",
          },
        }).unwrap(),
        saveToIPFS({
          content: {
            lastUpdatedOn: Date.now(),
            applicationSchema: generateApplicationSchema(
              data.applicationMetadata
            ),
          },
          metadata: {
            name: "application-schema",
          },
        }).unwrap(),
      ]);

      // Deploy round contract
      await createRound({
        round: {
          ...data,
          votingStrategy: "0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6", // BulkVotingStrategy contract
          token: "0x21C8a148933E6CA502B47D729a485579c22E8A69", // DAI token
          ownedBy: programId!,
          store: {
            protocol: 1, // IPFS protocol ID is 1
            pointer: metadataPointer,
          },
          applicationStore: {
            protocol: 1, // IPFS protocol ID is 1
            pointer: applicationMetadataPointer,
          },
          operatorWallets: props.initialData.program!.operatorWallets,
        },
        signerOrProvider: signer,
      }).unwrap();

      reset();
    } catch (e) {
      console.error(e);
    }
  };

  const progressSteps: any = [
    {
      name: "Storing",
      description: "The metadata is being saved in a safe place.",
      status: isSavedToIPFS
        ? ProgressStatus.COMPLETE
        : isIPFSError
        ? ProgressStatus.ERROR
        : isSavingToIPFS
        ? ProgressStatus.CURRENT
        : ProgressStatus.UPCOMING,
    },
    {
      name: "Deploying",
      description: `Connecting to the ${chain.name} blockchain.`,
      status: isSuccess
        ? ProgressStatus.COMPLETE
        : isRoundError
        ? ProgressStatus.ERROR
        : isLoading
        ? ProgressStatus.CURRENT
        : ProgressStatus.UPCOMING,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status: isSuccess ? ProgressStatus.CURRENT : ProgressStatus.UPCOMING,
    },
  ];

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <p className="text-base leading-6">Review Information</p>
          <p className="mt-1 text-sm text-grey-400">
            Carefully review the information details Project Owners will need to
            fullfil the application process.
          </p>
          <p className="italic mt-4 text-sm text-grey-400">
            Note: that some personal identifiable information will be stored
            publicly.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="rounded shadow-sm bg-white pt-7 pb-6 sm:px-6">
            <p className="mb-2">Project Information</p>
            <p className="text-sm text-grey-400 mb-6">
              These details will be collected from project owners by default
              during the project creation process.
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
              <span className="flex-1 text-sm">
                Project GitHub Organization
              </span>
              <span className="text-xs text-grey-400">Optional</span>
            </div>
            <hr />
            <div className="flex my-4">
              <span className="flex-1 text-sm">Project Logo</span>
              <span className="text-xs text-violet-400">*Required</span>
            </div>
            <hr />
            <div className="flex my-4">
              <span className="flex-1 text-sm">Project Banner</span>
              <span className="text-xs text-violet-400">*Required</span>
            </div>
            <hr />
            <div className="flex my-4">
              <span className="flex-1 text-sm">Project Description</span>
              <span className="text-xs text-violet-400">*Required</span>
            </div>
          </div>
        </div>
      </div>
      <hr className="my-6" />
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1"></div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit(next)} className="text-grey-500">
            <div className="rounded-t shadow-sm pt-7 pb-10 sm:px-6 bg-white">
              <div className="flex">
                <p className="flex-1 mb-2">Application Information</p>
                {edit ? (
                  <Button
                    type="button"
                    $variant="outline"
                    className="border text-pink-500 w-9 h-9 p-1.5"
                    onClick={() => setEdit(false)}
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    $variant="outline"
                    className="border w-9 h-9 p-1.5"
                    onClick={() => setEdit(true)}
                  >
                    <PencilIcon aria-hidden="true" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-grey-400 mb-6">
                Project Owners will need to fill out an application with the
                details below.
              </p>
              {!edit && (
                <>
                  <hr />
                  <div className="flex my-4">
                    <span className="flex-1 text-sm">
                      Payout Wallet Address
                    </span>
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

              {edit && (
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
                      {...register("applicationMetadata.customQuestions.email")}
                      $hasError={
                        errors.applicationMetadata?.customQuestions?.email
                      }
                      type="text"
                      placeholder='i.e. "email@domain.com"'
                    />
                    {errors.applicationMetadata?.customQuestions?.email && (
                      <p className="text-xs text-pink-500">
                        {
                          errors.applicationMetadata?.customQuestions?.email
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {/* Twitter */}
                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="applicationMetadata.customQuestions.twitter"
                      className="block text-xs font-medium"
                    >
                      Project Twitter
                    </label>
                    <Input
                      {...register(
                        "applicationMetadata.customQuestions.twitter"
                      )}
                      $hasError={
                        errors.applicationMetadata?.customQuestions?.email
                      }
                      type="text"
                      placeholder='i.e. "twitter.com/user-handle"'
                    />
                    {errors.applicationMetadata?.customQuestions?.twitter && (
                      <p className="text-xs text-pink-500">
                        {
                          errors.applicationMetadata?.customQuestions?.twitter
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {/* Github */}
                  <div className="col-span-6 sm:col-span-3 sm:col-start-1">
                    <label
                      htmlFor="applicationMetadata.customQuestions.github"
                      className="block text-xs font-medium"
                    >
                      Your GitHub Username
                    </label>
                    <Input
                      {...register(
                        "applicationMetadata.customQuestions.github"
                      )}
                      $hasError={
                        errors.applicationMetadata?.customQuestions?.github
                      }
                      type="text"
                      placeholder='i.e. "twitter.com/user-handle"'
                    />
                    {errors.applicationMetadata?.customQuestions?.github && (
                      <p className="text-xs text-pink-500">
                        {
                          errors.applicationMetadata?.customQuestions?.github
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {/* Github Organization */}
                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="applicationMetadata.customQuestions.githubOrganization"
                      className="block text-xs font-medium"
                    >
                      Project GitHub Organization
                    </label>
                    <Input
                      {...register(
                        "applicationMetadata.customQuestions.githubOrganization"
                      )}
                      $hasError={
                        errors.applicationMetadata?.customQuestions
                          ?.githubOrganization
                      }
                      type="text"
                      placeholder='i.e "@github-handle"'
                    />
                    {errors.applicationMetadata?.customQuestions
                      ?.githubOrganization && (
                      <p className="text-xs text-pink-500">
                        {
                          errors.applicationMetadata?.customQuestions
                            ?.githubOrganization?.message
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
                      {...register(
                        "applicationMetadata.customQuestions.fundingSource"
                      )}
                      $hasError={
                        errors.applicationMetadata?.customQuestions
                          ?.fundingSource
                      }
                      type="text"
                      placeholder='i.e. "What sources of funding do you currently have?"'
                    />
                    {errors.applicationMetadata?.customQuestions
                      ?.fundingSource && (
                      <p className="text-xs text-pink-500">
                        {
                          errors.applicationMetadata?.customQuestions
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
                      {...register(
                        "applicationMetadata.customQuestions.profit2022"
                      )}
                      $hasError={
                        errors.applicationMetadata?.customQuestions?.profit2022
                      }
                      type="text"
                      placeholder='i.e. "Please enter your profit for 2022."'
                    />
                    {errors.applicationMetadata?.customQuestions
                      ?.profit2022 && (
                      <p className="text-xs text-pink-500">
                        {
                          errors.applicationMetadata?.customQuestions
                            ?.profit2022?.message
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
                      {...register(
                        "applicationMetadata.customQuestions.teamSize"
                      )}
                      $hasError={
                        errors.applicationMetadata?.customQuestions?.teamSize
                      }
                      type="text"
                      placeholder='i.e. "What is the size of your team"'
                    />
                    {errors.applicationMetadata?.customQuestions?.teamSize && (
                      <p className="text-xs text-pink-500">
                        {
                          errors.applicationMetadata?.customQuestions?.teamSize
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 align-middle py-3.5 shadow-md">
              <FormStepper
                currentStep={currentStep}
                stepsCount={stepsCount}
                prev={prev}
                disabledNext={
                  isLoading ||
                  isSavingToIPFS ||
                  isSuccess ||
                  !props.initialData.program
                }
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
