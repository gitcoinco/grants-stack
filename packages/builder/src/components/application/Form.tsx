import { Stack } from "@chakra-ui/react";
import { datadogRum } from "@datadog/browser-rum";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import {
  ExclamationTriangleIcon,
  GlobeAltIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { renderToHTML } from "common";
import { Fragment, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useEnsName, useNetwork } from "wagmi";
import { ValidationError } from "yup";
import { fetchProjectApplicationInRound } from "../../actions/projects";
import { resetApplicationError } from "../../actions/roundApplication";
import {
  DefaultProjectBanner,
  DefaultProjectLogo,
  GithubLogo,
  TwitterLogo,
} from "../../assets";
import useValidateCredential from "../../hooks/useValidateCredential";
import { RootState } from "../../reducers";
import { editProjectPathByID } from "../../routes";
import colors from "../../styles/colors";
import {
  AddressType,
  ChangeHandlers,
  Metadata,
  ProjectOption,
  Round,
  RoundApplicationQuestion,
} from "../../types";
import {
  RoundApplicationAnswers,
  RoundApplicationMetadata,
} from "../../types/roundApplication";
import { getProjectURIComponents } from "../../utils/utils";
import {
  getNetworkIcon,
  getPayoutIcon,
  networkPrettyName,
} from "../../utils/wallet";
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
import Calendar from "../icons/Calendar";
import GreenVerifiedBadge from "../badges/GreenVerifiedBadge";

const validation = {
  messages: [""],
  valid: false,
  errorCount: 0,
};

enum ValidationStatus {
  Invalid,
  Valid,
}

function ProjectTitle(props: { projectMetadata: Metadata }) {
  const { projectMetadata } = props;
  return (
    <div className="pb-2">
      <h1 className="text-3xl mt-6 font-thin text-black">
        {projectMetadata.title}
      </h1>
    </div>
  );
}

function DetailSummary(props: {
  text: string;
  testID: string;
  sm?: boolean;
  violetcolor?: boolean;
}) {
  const { text, testID, sm, violetcolor } = props;
  return (
    <p
      className={`${sm ? "text-sm" : "text-base"} font-normal 
      ${violetcolor ? "text-gitcoin-violet-400" : "text-black"}`}
      data-testid={testID}
    >
      {" "}
      {text}{" "}
    </p>
  );
}

function AboutProject(props: {
  projectToRender: Metadata;
  questions: RoundApplicationQuestion[];
  answers: RoundApplicationAnswers;
  chainId: number;
}) {
  const { projectToRender, answers, questions, chainId } = props;

  const { website, projectTwitter, projectGithub, userGithub, credentials } =
    projectToRender;

  const { isValid: validTwitterCredential } = useValidateCredential(
    credentials?.twitter,
    projectTwitter
  );

  const { isValid: validGithubCredential } = useValidateCredential(
    credentials?.github,
    projectGithub
  );

  const recipientQuestion = questions.find((item) => item.type === "recipient");
  const recipient = recipientQuestion
    ? answers[recipientQuestion.id.toString()].toString()
    : undefined;

  const { data: ensName } = useEnsName({
    address: recipient ?? "",
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 pt-2 pb-6">
      {recipient && (
        <span className="flex items-center mt-4 gap-1">
          <div className="w-5 h-5 rounded-full overflow-hidden">
            <img
              src={getPayoutIcon(chainId)}
              alt="circle"
              className="w-full h-full object-cover"
            />
          </div>
          <DetailSummary
            text={`${
              ensName || `${recipient.slice(0, 6)}...${recipient.slice(-4)}`
            }`}
            testID="project-recipient"
            sm
          />
        </span>
      )}
      {projectToRender.createdAt && (
        <span className="flex items-center mt-4 gap-2">
          {/* <CalendarIcon className="h-4 w-4 mr-1 opacity-80" /> */}
          <Calendar color={colors["secondary-text"]} />
          <DetailSummary
            text={`Created: ${new Date(
              projectToRender.createdAt
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}`}
            testID="project-createdAt"
          />
        </span>
      )}
      {website && (
        <span className="flex items-center mt-4 gap-1">
          <GlobeAltIcon className="h-4 w-4 mr-1 opacity-40" />
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`${website}`}
              testID="project-website"
              violetcolor
            />
          </a>
        </span>
      )}
      {projectTwitter && (
        <span className="flex items-center mt-4 gap-1">
          <img src={TwitterLogo} className="h-4" alt="Twitter Logo" />
          <a
            href={`https://twitter.com/${projectTwitter}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={projectTwitter}
              testID="project-twitter"
              violetcolor
            />
          </a>
          {validTwitterCredential && <GreenVerifiedBadge />}
        </span>
      )}
      {userGithub && (
        <span className="flex items-center mt-4 gap-2">
          <img src={GithubLogo} className="h-4" alt="GitHub Logo" />
          <a
            href={`https://github.com/${userGithub}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`${userGithub}`}
              testID="user-github"
              violetcolor
            />
          </a>
          {validGithubCredential && <GreenVerifiedBadge />}
        </span>
      )}
      {projectGithub && (
        <span className="flex items-center mt-4 gap-1">
          <img src={GithubLogo} className="h-4" alt="GitHub Logo" />
          <a
            href={`https://github.com/${projectGithub}`}
            target="_blank"
            rel="noreferrer"
            className="text-base font-normal text-black"
          >
            <DetailSummary
              text={`${projectGithub}`}
              testID="project-github"
              violetcolor
            />
          </a>
        </span>
      )}
    </div>
  );
}

function FullPreview(props: {
  project: Metadata;
  answers: RoundApplicationAnswers;
  questions: RoundApplicationQuestion[];
  handleSubmitApplication: Function;
  setPreview: Function;
  disableSubmit: boolean;
  chainId: number;
}) {
  const {
    project,
    answers,
    questions,
    setPreview,
    handleSubmitApplication,
    disableSubmit,
    chainId,
  } = props;
  const ipfsPrefix = `${process.env.REACT_APP_PINATA_GATEWAY!}/ipfs/`;

  return (
    <>
      <div className="relative pt-7">
        <div>
          <div>
            <img
              className="h-32 w-full object-cover lg:h-80 rounded"
              src={`${
                project.bannerImg
                  ? ipfsPrefix + project.bannerImg
                  : DefaultProjectBanner
              }?img-height=320`}
              alt="Project Banner"
            />
          </div>
          <div className="pl-4 sm:pl-6 lg:pl-8">
            <div className="-mt-1 sm:-mt-2 sm:flex sm:items-end sm:space-x-5">
              <div className="flex">
                <div className="pl-4">
                  <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                      <img
                        className="h-16 w-16 rounded-full ring-4 ring-white bg-white"
                        src={
                          project.logoImg
                            ? ipfsPrefix + project.logoImg
                            : DefaultProjectLogo
                        }
                        alt="Project Logo"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="grow">
          <div>
            <ProjectTitle projectMetadata={project} />
            <AboutProject
              projectToRender={project}
              questions={questions}
              answers={answers}
              chainId={chainId}
            />
          </div>
          <div>
            <h1 className="text-2xl mt-8 font-thin text-black">About</h1>
            <p
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: renderToHTML(
                  project.description.replace(/\n/g, "\n\n")
                ),
              }}
              className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
            />

            <div className="mt-4 border-t-2">
              <h1 className="text-2xl mt-6 font-thin text-black">
                Additional Details
              </h1>
              <div>
                {questions.map((question: any) => {
                  const currentAnswer = answers[question.id];
                  const answerText = Array.isArray(currentAnswer)
                    ? currentAnswer.join(", ")
                    : currentAnswer || "";

                  return (
                    <div>
                      {!question.hidden && question.type !== "project" && (
                        <div key={question.id}>
                          <p className="text-md mt-8 mb-3 font-semibold text-black">
                            {question.type === "recipient"
                              ? "Recipient"
                              : question.title}
                          </p>
                          {question.type === "paragraph" ? (
                            <p
                              // eslint-disable-next-line react/no-danger
                              dangerouslySetInnerHTML={{
                                __html: renderToHTML(
                                  answerText.toString().replace(/\n/g, "\n\n")
                                ),
                              }}
                              className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
                            />
                          ) : (
                            <p className="text-base text-black">
                              {answerText.toString().replace(/\n/g, "<br/>")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="flex justify-end">
          <Button
            variant={ButtonVariants.outline}
            onClick={() => {
              setPreview(false);
            }}
          >
            Back to Editing
          </Button>
          <Button
            variant={ButtonVariants.primary}
            onClick={() => {
              handleSubmitApplication();
            }}
            disabled={disableSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}

export default function Form({
  roundApplication,
  round,
  onSubmit,
  onChange,
  showErrorModal,
  readOnly,
  publishedApplication,
}: {
  roundApplication: RoundApplicationMetadata;
  round: Round;
  onSubmit?: (answers: RoundApplicationAnswers) => void;
  onChange?: (answers: RoundApplicationAnswers) => void;
  showErrorModal: boolean;
  readOnly?: boolean;
  publishedApplication?: any;
}) {
  const dispatch = useDispatch();
  const { chains } = useNetwork();

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

    return {
      projectIDs: state.projects.ids,
      allProjectMetadata,
      chainID,
    };
  }, shallowEqual);

  let selectedProjectMetadata: Metadata | undefined;

  if (selectedProjectID !== undefined && selectedProjectID !== "") {
    selectedProjectMetadata =
      props.allProjectMetadata[selectedProjectID]?.metadata;
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
    if (publishedApplication === undefined) {
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
    const { value } = e.target;
    setSelectedProjectID(value);
    setIsLoading(true);
    // don't load the project if the input is empty/blank
    if (value === "") {
      setHasExistingApplication(false);
      setIsLoading(false);
      handleInput(e);
      return;
    }
    const { hasProjectAppliedToRound } = await fetchProjectApplicationInRound(
      value,
      round.address
    );
    setHasExistingApplication(hasProjectAppliedToRound);
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
    dispatch(resetApplicationError(round.address));
  };

  const handleSubmitApplicationRetry = async () => {
    closeErrorModal();
    handleSubmitApplication();
  };

  useEffect(() => {
    const currentOptions = props.projectIDs.map((id): ProjectOption => {
      const { chainId } = getProjectURIComponents(id);
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

  // todo: ensure that the applications are made by a project owner
  const isValidProjectSelected =
    !hasExistingApplication &&
    selectedProjectID &&
    publishedApplication === undefined;

  const needsProject = schema.questions.find((q) => q.type === "project");
  const now = new Date().getTime() / 1000;

  return (
    <>
      {preview && selectedProjectMetadata && (
        <FullPreview
          project={selectedProjectMetadata!}
          answers={answers}
          questions={schema.questions}
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
          {schema.questions.map((input) => {
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
                              label="Is your payout wallet a Gnosis Safe or multi-sig?"
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
                        options={input.options.map((o) => ({
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

          {selectedProjectID && hasExistingApplication && (
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
            selectedProjectID &&
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
                        to={editProjectPathByID(selectedProjectID)!}
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
                    onClick={() => handlePreviewClick()}
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
        <ErrorModal
          open={showErrorModal}
          onClose={closeErrorModal}
          onRetry={handleSubmitApplicationRetry}
          title="Round Application Period Closed"
        >
          {round.applicationsEndTime > now ? (
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
            if (onSubmit) onSubmit(answers);
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
              able to edit or re-apply with the same project to this round.
            </p>
          </>
        </CallbackModal>
      </div>
    </>
  );
}
