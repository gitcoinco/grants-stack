import { Stack } from "@chakra-ui/react";
import { datadogRum } from "@datadog/browser-rum";
import { getConfig } from "common/src/config";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  ProjectApplicationWithRound,
  RoundCategory,
  useDataLayer,
} from "data-layer";
import {
  RoundApplicationAnswers,
  RoundApplicationMetadata,
} from "data-layer/dist/roundApplication.types";
import { Fragment, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNetwork } from "wagmi";
import { ValidationError } from "yup";
import { resetApplicationError } from "../../actions/roundApplication";
import useValidateCredential from "../../hooks/useValidateCredential";
import { RootState } from "../../reducers";
import { editPath } from "../../routes";
import {
  AddressType,
  ChangeHandlers,
  Metadata,
  ProjectOption,
  Round,
} from "../../types";
import { getNetworkIcon, networkPrettyName } from "../../utils/wallet";
import Button, { ButtonVariants } from "../base/Button";
import CallbackModal from "../base/CallbackModal";
import ErrorModal from "../base/ErrorModal";
import FormValidationErrorList from "../base/FormValidationErrorList";
import InputLabel from "../base/InputLabel";
import LoadingSpinner from "../base/LoadingSpinner";
import { validateApplication } from "../base/formValidation";
import Checkbox from "../grants/Checkbox";
import Radio from "../grants/Radio";
import Toggle from "../grants/Toggle";
import {
  ProjectSelect,
  Select,
  TextArea,
  TextInput,
  TextInputAddress,
} from "../grants/inputs";
import { FullPreview } from "./FullPreview";

const validation = {
  messages: [""],
  valid: false,
  errorCount: 0,
};

enum ValidationStatus {
  Invalid,
  Valid,
}

export default function Form({
  roundApplication,
  round,
  onSubmit,
  onChange,
  showErrorModal,
  readOnly,
  publishedApplication,
  setCreateLinkedProject,
}: {
  roundApplication: RoundApplicationMetadata;
  round: Round;
  onSubmit?: (answers: RoundApplicationAnswers, createProfile: boolean) => void;
  onChange?: (answers: RoundApplicationAnswers) => void;
  showErrorModal: boolean;
  readOnly?: boolean;
  publishedApplication?: any;
  setCreateLinkedProject: (createLinkedProject: boolean) => void;
}) {
  const dispatch = useDispatch();
  const dataLayer = useDataLayer();
  const { chains } = useNetwork();
  const { version } = getConfig().allo;

  const [projectApplications, setProjectApplications] = useState<
    ProjectApplicationWithRound[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [answers, setAnswers] = useState<RoundApplicationAnswers>({});
  const [preview, setPreview] = useState(readOnly || false);
  const [formValidation, setFormValidation] = useState(validation);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>();
  const [showProjectDetails] = useState(true);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [selectedProjectID, setSelectedProjectID] = useState<
    string | undefined
  >(undefined);
  const [showError, setShowError] = useState(false);
  const [addressType, setAddressType] = useState<AddressType | undefined>();
  const [feedback, setFeedback] = useState([
    { title: "", type: "none", message: "" },
  ]);

  const props = useSelector((state: RootState) => {
    const allProjectMetadata = state.grantsMetadata;
    const { chainID } = state.web3;

    const projectIds = Object.keys(allProjectMetadata);

    return {
      anchors: state.projects.anchor,
      projectIDs: projectIds,
      allProjectMetadata,
      chainID,
    };
  }, shallowEqual);

  async function loadApplications() {
    const applications = await dataLayer.getApplicationsByRoundIdAndProjectIds({
      chainId: props.chainID as number,
      roundId: round.id.toLowerCase() as `0x${Lowercase<string>}`,
      projectIds: props.projectIDs,
    });
    if (applications) {
      setProjectApplications(applications);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  let selectedProjectMetadata: Metadata | undefined;
  let createLinkedProject = false;

  if (selectedProjectID !== undefined && selectedProjectID !== "") {
    selectedProjectMetadata =
      props.allProjectMetadata[selectedProjectID]?.metadata;
    createLinkedProject =
      Number(selectedProjectMetadata!.chainId) !== Number(props.chainID) &&
      (!selectedProjectMetadata!.linkedChains ||
        !selectedProjectMetadata!.linkedChains.includes(Number(props.chainID)));
    setCreateLinkedProject(createLinkedProject);
  }

  const twitterCredentialValidation = useValidateCredential(
    selectedProjectMetadata?.credentials?.twitter,
    selectedProjectMetadata?.projectTwitter
  );

  const githubCredentialValidation = useValidateCredential(
    selectedProjectMetadata?.credentials?.github,
    selectedProjectMetadata?.projectGithub
  );

  const chainInfo = chains.find((i) => i.id === props.chainID);
  const schema = roundApplication.applicationSchema;

  useEffect(() => {
    if (publishedApplication === undefined || showErrorModal) {
      return;
    }

    const inputValues: RoundApplicationAnswers = {};
    publishedApplication.application.answers.forEach((answer: any) => {
      inputValues[answer.questionId] = answer.answer ?? "***";
    });

    const recipientQuestion = schema.questions.find(
      (q) => q.type === "recipient"
    );

    if (recipientQuestion) {
      inputValues[recipientQuestion.id] =
        publishedApplication.application.recipient;
    }

    const projectQuestion = schema.questions.find((q) => q.type === "project");

    if (projectQuestion) {
      inputValues[projectQuestion.id] =
        publishedApplication.application.project.title;
    }
    setAnswers(inputValues);
  }, [publishedApplication]);

  const validate = async (inputs: RoundApplicationAnswers) => {
    try {
      await validateApplication(schema.questions, inputs);
      setFormValidation({
        messages: [],
        valid: true,
        errorCount: 0,
      });
      setDisableSubmit(false);
      setFeedback([{ title: "", type: "none", message: "" }]);
      return ValidationStatus.Valid;
    } catch (e) {
      const error = e as ValidationError;
      datadogRum.addError(error);
      console.log(error);
      setFormValidation({
        messages: error.inner.map((er) => (er as ValidationError).message),
        valid: false,
        errorCount: error.inner.length,
      });
      setDisableSubmit(true);
      setFeedback([
        ...error.inner.map((er) => {
          const err = er as ValidationError;
          console.log("ERROR", { err });
          if (err !== null) {
            return {
              title: err.path!,
              type: "error",
              message: err.message,
            };
          }
          return {
            title: "",
            type: "none",
            message: "",
          };
        }),
      ]);
      return ValidationStatus.Invalid;
    }
  };

  const setAnswer = (key: string | number, value: string | string[]) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    if (onChange) {
      onChange(newAnswers);
    }
    if (submitted) {
      validate(newAnswers);
    }
  };

  const handleInput = async (e: ChangeHandlers) => {
    const { value } = e.target;

    setAnswer(e.target.name, value);
  };

  const handleProjectInput = async (e: ChangeHandlers) => {
    const { value: projectId } = e.target;
    setSelectedProjectID(projectId);
    setIsLoading(true);

    if (projectId === "") {
      setHasExistingApplication(false);
      setIsLoading(false);
      handleInput(e);
      return;
    }

    const hasProjectAppliedToRound =
      projectApplications.filter((app) => app.projectId === projectId).length >
      0;

    if (version === "allo-v2") {
      setHasExistingApplication(hasProjectAppliedToRound);
    }
    setIsLoading(false);
    handleInput(e);
  };

  const handlePreviewClick = async () => {
    setSubmitted(true);
    const valid = await validate(answers);
    if (valid === ValidationStatus.Valid) {
      setPreview(true);
      setShowError(false);
    } else {
      setPreview(false);
      setShowError(true);
    }
  };

  const handleSubmitApplication = async () => {
    if (formValidation.valid) {
      setInfoModal(true);
    }
  };

  const closeErrorModal = async () => {
    dispatch(resetApplicationError(round.id));
  };

  const handleSubmitApplicationRetry = async () => {
    closeErrorModal();
    handleSubmitApplication();
  };

  useEffect(() => {
    const currentOptions = props.projectIDs.map((id): ProjectOption => {
      const chainId = props.allProjectMetadata[id]?.metadata?.chainId;
      const projectChainIconUri = getNetworkIcon(Number(chainId));
      const chainName = networkPrettyName(Number(chainId));
      return {
        id,
        title: props.allProjectMetadata[id]?.metadata?.title,
        chainInfo: {
          chainId: Number(chainId),
          icon: projectChainIconUri,
          chainName,
        },
      };
    });
    currentOptions.unshift({ id: undefined, title: "", chainInfo: undefined });

    setProjectOptions(currentOptions);
  }, [props.allProjectMetadata]);

  const projectRequirementsResult: string[] = [];

  if (
    roundApplication.applicationSchema.requirements.twitter.required &&
    !selectedProjectMetadata?.projectTwitter
  ) {
    projectRequirementsResult.push("Project Twitter is required.");
  }

  if (
    roundApplication.applicationSchema.requirements.twitter.verification &&
    !twitterCredentialValidation.isLoading &&
    !twitterCredentialValidation.isValid
  ) {
    projectRequirementsResult.push(
      "Verification of project Twitter is required."
    );
  }

  if (
    roundApplication.applicationSchema.requirements.github.required &&
    !selectedProjectMetadata?.projectGithub
  ) {
    projectRequirementsResult.push("Project Github is required.");
  }

  if (
    roundApplication.applicationSchema.requirements.github.verification &&
    !githubCredentialValidation.isLoading &&
    !githubCredentialValidation.isValid
  ) {
    projectRequirementsResult.push(
      "Verification of project Github is required."
    );
  }

  const haveProjectRequirementsBeenMet = projectRequirementsResult.length === 0;

  const isDirectRound =
    round.payoutStrategy !== null &&
    round.payoutStrategy === RoundCategory.Direct;
  // todo: ensure that the applications are made by a project owner
  const isValidProjectSelected =
    (isDirectRound || !hasExistingApplication) &&
    selectedProjectID !== null &&
    publishedApplication === undefined;

  const needsProject = !schema.questions.find((q) => q.type === "project");
  const now = new Date().getTime() / 1000;

  return (
    <>
      {preview && selectedProjectMetadata && (
        <FullPreview
          project={selectedProjectMetadata!}
          answers={answers}
          questions={schema.questions}
          preview={preview}
          setPreview={setPreview}
          handleSubmitApplication={handleSubmitApplication}
          disableSubmit={disableSubmit}
          chainId={chainInfo?.id || 1}
        />
      )}
      <div
        className={`border-0 sm:border sm:border-solid border-gitcoin-grey-100 rounded text-primary-text p-0 sm:p-4 ${
          preview && selectedProjectMetadata ? "hidden" : ""
        }`}
      >
        <form onSubmit={(e) => e.preventDefault()}>
          {schema.questions.map((input: any) => {
            if (
              needsProject &&
              input.type !== "project" &&
              !isValidProjectSelected
            ) {
              return null;
            }

            if (input.type === "project") {
              return readOnly ? (
                <TextInput
                  key={input.id.toString()}
                  label="Select a project you would like to apply for funding:"
                  name={input.id.toString()}
                  value={(answers[input.id] as string) ?? ""}
                  disabled={preview}
                  changeHandler={(e) => {
                    handleInput(e);
                  }}
                  required
                  feedback={
                    feedback.find((fb) => fb.title === input.id.toString()) ?? {
                      type: "none",
                      message: "",
                    }
                  }
                />
              ) : (
                <Fragment key="project">
                  <div className="mt-6 xl:w-1/2 sm:w-full lg:w-2/3 md:w-2/3 relative">
                    <ProjectSelect
                      key={input.id.toString()}
                      label="Select a project you would like to apply for funding:"
                      name={input.id.toString()}
                      value={(answers[input.id] as string) ?? ""}
                      options={projectOptions ?? []}
                      disabled={preview}
                      changeHandler={handleProjectInput}
                      required
                      feedback={
                        feedback.find(
                          (fb) => fb.title === input.id.toString()
                        ) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  </div>
                  {isValidProjectSelected && !isLoading && (
                    <div>
                      <Toggle
                        projectMetadata={selectedProjectMetadata}
                        showProjectDetails={showProjectDetails}
                      />
                    </div>
                  )}
                </Fragment>
              );
            }

            // Add isPreview for Application View when readonly
            if (
              (isValidProjectSelected || readOnly) &&
              haveProjectRequirementsBeenMet &&
              !isLoading
            ) {
              switch (input.type) {
                case "recipient":
                  /* Radio for safe or multi-sig */
                  return (
                    <Fragment key={input.id}>
                      {!readOnly && (
                        <div
                          className="relative mt-2"
                          data-testid="wallet-type"
                        >
                          <Stack>
                            <Radio
                              label="Is your Payout Wallet a Gnosis Safe or multi-sig?"
                              choices={["Yes", "No"]}
                              changeHandler={handleInput}
                              name="isSafe"
                              value={answers.isSafe as string}
                              info=""
                              required
                              disabled={preview}
                              feedback={
                                feedback.find(
                                  (fb) => fb.title === "isSafe"
                                ) ?? {
                                  type: "none",
                                  message: "",
                                }
                              }
                            />
                          </Stack>
                        </div>
                      )}
                      {/* todo: do we need this tooltip for all networks? */}
                      <TextInputAddress
                        data-testid="address-input-wrapper"
                        key={input.id}
                        label={
                          <InputLabel
                            title="Payout Wallet Address"
                            encrypted={false}
                            hidden={false}
                          />
                        }
                        name={input.id.toString()}
                        placeholder="Address that will receive funds"
                        // eslint-disable-next-line max-len
                        tooltipValue="Please make sure the payout wallet address you provide is a valid address that you own on the network you are applying on."
                        value={answers[input.id.toString()] as string}
                        disabled={preview}
                        changeHandler={handleInput}
                        required
                        onAddressType={(v) => setAddressType(v)}
                        warningHighlight={
                          addressType &&
                          ((answers.isSafe === "Yes" &&
                            !addressType.isContract) ||
                            (answers.isSafe === "No" && addressType.isContract))
                        }
                        feedback={
                          feedback.find(
                            (fb) => fb.title === input.id.toString()
                          ) ?? {
                            type: "none",
                            message: "",
                          }
                        }
                      />
                    </Fragment>
                  );
                case "short-answer":
                case "text":
                case "link":
                  return (
                    <TextInput
                      key={input.id}
                      label={
                        <InputLabel
                          title={input.title}
                          encrypted={input.encrypted}
                          hidden={input.hidden}
                        />
                      }
                      name={`${input.id}`}
                      value={(answers[input.id] as string) ?? ""}
                      disabled={preview}
                      changeHandler={(e) => {
                        handleInput(e);
                      }}
                      required={input.required ?? false}
                      feedback={
                        feedback.find((fb) => fb.title === `${input.id}`) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  );
                case "email":
                  return (
                    <TextInput
                      inputType="email"
                      key={input.id}
                      label={
                        <InputLabel
                          title={input.title}
                          encrypted={input.encrypted}
                          hidden={input.hidden}
                        />
                      }
                      placeholder="name@example.com"
                      name={`${input.id}`}
                      value={(answers[input.id] as string) ?? ""}
                      disabled={preview}
                      changeHandler={(e) => {
                        handleInput(e);
                      }}
                      required={input.required ?? false}
                      feedback={
                        feedback.find((fb) => fb.title === `${input.id}`) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  );
                case "address":
                  return (
                    <TextInput
                      inputType="text"
                      key={input.id}
                      label={
                        <InputLabel
                          title={input.title}
                          encrypted={input.encrypted}
                          hidden={input.hidden}
                        />
                      }
                      name={`${input.id}`}
                      value={(answers[input.id] as string) ?? ""}
                      disabled={preview}
                      changeHandler={(e) => {
                        handleInput(e);
                      }}
                      required={input.required ?? false}
                      feedback={
                        feedback.find((fb) => fb.title === `${input.id}`) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  );
                case "paragraph":
                  return (
                    <TextArea
                      key={input.id}
                      label={
                        <InputLabel
                          title={input.title}
                          encrypted={input.encrypted}
                          hidden={input.hidden}
                        />
                      }
                      name={`${input.id}`}
                      value={(answers[input.id] as string) ?? ""}
                      disabled={preview}
                      changeHandler={handleInput}
                      required={input.required ?? false}
                      feedback={
                        feedback.find((fb) => fb.title === `${input.id}`) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  );
                case "dropdown":
                  return (
                    <div
                      key={input.id}
                      className="mt-6 w-full sm:max-w-md relative"
                    >
                      <Select
                        label={
                          <InputLabel
                            title={input.title}
                            encrypted={input.encrypted}
                            hidden={input.hidden}
                          />
                        }
                        name={`${input.id}`}
                        value={answers[input.id] as string}
                        options={input.options.map((o: any) => ({
                          id: o,
                          title: o,
                        }))}
                        disabled={preview}
                        changeHandler={handleInput}
                        required={input.required}
                        feedback={
                          feedback.find((fb) => fb.title === `${input.id}`) ?? {
                            type: "none",
                            message: "",
                          }
                        }
                      />
                    </div>
                  );
                case "multiple-choice":
                  return (
                    <Radio
                      key={input.id}
                      label={
                        <InputLabel
                          title={input.title}
                          encrypted={input.encrypted}
                          hidden={input.hidden}
                        />
                      }
                      name={`${input.id}`}
                      value={answers[input.id] as string}
                      choices={input.options}
                      disabled={preview}
                      changeHandler={handleInput}
                      required={input.required ?? false}
                      feedback={
                        feedback.find((fb) => fb.title === `${input.id}`) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  );
                case "checkbox":
                  return (
                    <Checkbox
                      key={input.id}
                      label={
                        <InputLabel
                          title={input.title}
                          encrypted={input.encrypted}
                          hidden={input.hidden}
                        />
                      }
                      name={`${input.id}`}
                      values={(answers[input.id] as string[]) ?? []}
                      choices={input.options}
                      disabled={preview}
                      onChange={(newValues: string[]) => {
                        setAnswer(input.id, newValues);
                      }}
                      required={input.required ?? false}
                      feedback={
                        feedback.find((fb) => fb.title === `${input.id}`) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  );
                case "number":
                  return (
                    <TextInput
                      inputType="number"
                      key={input.id}
                      label={
                        <InputLabel
                          title={input.title}
                          encrypted={input.encrypted}
                          hidden={input.hidden}
                        />
                      }
                      placeholder="0"
                      name={`${input.id}`}
                      value={(answers[input.id] as number) ?? 0}
                      disabled={preview}
                      changeHandler={(e) => {
                        handleInput(e);
                      }}
                      required={input.required ?? false}
                      feedback={
                        feedback.find((fb) => fb.title === `${input.id}`) ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  );
                default:
                  return null;
              }
            }

            if (isLoading) {
              <LoadingSpinner
                label="Fetching Details"
                size="24"
                thickness="6px"
                showText
              />;
            }

            return null;
          })}

          {!!selectedProjectID && !isDirectRound && hasExistingApplication && (
            <div className="rounded-md bg-red-50 p-4 mt-5">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <h3 className="ml-3 text-sm font-medium text-red-800">
                  You have applied to this round with this project. Please
                  select another project to continue.
                </h3>
              </div>
            </div>
          )}

          {!hasExistingApplication &&
            !!selectedProjectID &&
            selectedProjectID !== "0" &&
            !haveProjectRequirementsBeenMet && (
              <div className="relative bg-gitcoin-violet-100 mt-3 p-3 rounded-md flex flex-1 justify-between items-center">
                <div className="flex flex-1 justify-start items-start">
                  <div className="text-gitcoin-violet-500 fill-current w-6 shrink-0 mx-4">
                    <InformationCircleIcon />
                  </div>
                  <div className="text-black text-sm">
                    <p className="text-primary-text pb-1 font-medium">
                      Some information of your project is required to apply to
                      this round. Complete the required details{" "}
                      <Link
                        className="text-link"
                        target="_blank"
                        to={
                          editPath(
                            selectedProjectMetadata?.chainId.toString()!,
                            selectedProjectMetadata?.registryAddress!,
                            selectedProjectID
                          )!
                        }
                      >
                        here
                      </Link>{" "}
                      and refresh this page.
                    </p>
                    <ul className="mt-1 ml-2 text-black text-sm list-disc list-inside">
                      {projectRequirementsResult.map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          {addressType &&
            ((answers.isSafe === "Yes" && !addressType.isContract) ||
              (answers.isSafe === "No" && addressType.isContract)) && (
              <div
                className="flex flex-1 flex-row p-4 rounded bg-gitcoin-yellow mt-8"
                role="alert"
                data-testid="review-wallet-address"
              >
                <div className="text-gitcoin-yellow-500">
                  <ExclamationTriangleIcon height={25} width={25} />
                </div>
                <div className="pl-6">
                  <strong className="text-gitcoin-yellow-500 font-medium">
                    Review your payout wallet address.
                  </strong>
                  <ul className="mt-1 ml-2 text-sm text-black list-disc list-inside">
                    <li className="text-black">
                      {answers.isSafe === "Yes" &&
                        (!addressType.isContract || !addressType.isSafe) &&
                        // eslint-disable-next-line max-len
                        `It looks like the payout wallet address you have provided may not be a valid multi-sig on the ${chainInfo?.name} network. Please update your payout wallet address before proceeding.`}
                      {answers.isSafe === "No" &&
                        (addressType.isSafe || addressType.isContract) &&
                        // eslint-disable-next-line max-len
                        `It looks like the payout wallet address you have provided is a multi-sig. Please update your selection to indicate your payout wallet address will be a multi-sig, or update your payout wallet address.`}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          {showError && selectedProjectID && (
            <FormValidationErrorList formValidation={formValidation} />
          )}
          {!readOnly &&
            !isLoading &&
            isValidProjectSelected &&
            haveProjectRequirementsBeenMet && (
              <div className="flex justify-end">
                {!preview ? (
                  <Button
                    variant={ButtonVariants.primary}
                    disabled={!isValidProjectSelected}
                    onClick={() => {
                      handlePreviewClick();
                    }}
                  >
                    Preview Application
                  </Button>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      variant={ButtonVariants.outline}
                      onClick={() => setPreview(false)}
                    >
                      Back to Editing
                    </Button>
                    <Button
                      variant={ButtonVariants.primary}
                      onClick={handleSubmitApplication}
                      disabled={disableSubmit}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            )}
        </form>
        {/* TODO: this is displayed regardless of the error, e.g. when receiving a 401 from Pinata */}
        <ErrorModal
          open={showErrorModal}
          onClose={closeErrorModal}
          onRetry={handleSubmitApplicationRetry}
          title="Round Application Error"
        >
          {round.applicationsEndTime < now ? (
            <div className="my-2">
              The application period for this round has closed.
            </div>
          ) : (
            <div className="my-2">
              There was a problem with your round application transaction.
            </div>
          )}
        </ErrorModal>
        <CallbackModal
          modalOpen={infoModal}
          confirmText="Proceed"
          cancelText="Cancel"
          confirmHandler={() => {
            if (onSubmit) onSubmit(answers, createLinkedProject);
            setInfoModal(false);
          }}
          toggleModal={() => setInfoModal(!infoModal)}
          hideCloseButton
        >
          <>
            <h5 className="font-medium mt-5 mb-2 text-lg">
              Are you sure you want to submit your application?
            </h5>
            <p className="mb-6">
              Please note that once you submit this application, you will NOT be
              able to edit
              {!isDirectRound &&
                " or re-apply with the same project to this round."}
            </p>
          </>
        </CallbackModal>
      </div>
    </>
  );
}
