import { Stack } from "@chakra-ui/react";
import { datadogRum } from "@datadog/browser-rum";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { Fragment, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNetwork } from "wagmi";
import { ValidationError } from "yup";
import {
  resetApplicationError,
  submitApplication,
} from "../../actions/roundApplication";
import useValidateCredential from "../../hooks/useValidateCredential";
import { RootState } from "../../reducers";
import { editProjectPathByID } from "../../routes";
import {
  AddressType,
  ChangeHandlers,
  CredentialProvider,
  DynamicFormInputs,
  Metadata,
  ProjectOption,
  Round,
} from "../../types";
import { RoundApplicationMetadata } from "../../types/roundApplication";
import { getProjectURIComponents } from "../../utils/utils";
import { getNetworkIcon, networkPrettyName } from "../../utils/wallet";
import Button, { ButtonVariants } from "../base/Button";
import ErrorModal from "../base/ErrorModal";
import { validateApplication } from "../base/formValidation";
import {
  CustomSelect,
  TextArea,
  TextInput,
  TextInputAddress,
} from "../grants/inputs";
import Radio from "../grants/Radio";
import Toggle from "../grants/Toggle";

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
  showErrorModal,
  readOnly,
  publishedApplication,
}: {
  roundApplication: RoundApplicationMetadata;
  round: Round;
  onSubmit: () => void;
  showErrorModal: boolean;
  readOnly?: boolean;
  publishedApplication?: any;
}) {
  const dispatch = useDispatch();
  const { chains } = useNetwork();

  const [formInputs, setFormInputs] = useState<DynamicFormInputs>({});
  const [preview, setPreview] = useState(readOnly || false);
  const [formValidation, setFormValidation] = useState(validation);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>();
  const [showProjectDetails] = useState(true);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    CredentialProvider.Twitter,
    selectedProjectMetadata?.projectTwitter
  );

  const githubCredentialValidation = useValidateCredential(
    selectedProjectMetadata?.credentials?.github,
    CredentialProvider.Github,
    selectedProjectMetadata?.projectGithub
  );

  const chainInfo = chains.find((i) => i.id === props.chainID);
  const schema = roundApplication.applicationSchema;

  useEffect(() => {
    if (publishedApplication === undefined) {
      return;
    }

    const inputValues: DynamicFormInputs = {};
    publishedApplication.application.answers.forEach((answer: any) => {
      inputValues[answer.questionId] = answer.answer ?? "***";
    });
    inputValues[Object.keys(inputValues).length] =
      publishedApplication.application.recipient;
    inputValues[Object.keys(inputValues).length] =
      publishedApplication.application.project.title;
    setFormInputs(inputValues);
  }, [publishedApplication]);

  const validate = async (inputs: DynamicFormInputs) => {
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

  const handleInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    const inputs = { ...formInputs, [e.target.name]: value };
    setFormInputs(inputs);
    if (submitted) {
      validate(inputs);
    }
  };

  const handleProjectInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    setSelectedProjectID(value);
    handleInput(e);
  };

  const handlePreviewClick = async () => {
    setSubmitted(true);
    const valid = await validate(formInputs);
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
      onSubmit();
      dispatch(submitApplication(round.address, formInputs));
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

  const projectRequirementsResult = [];

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

  const isValidProjectSelected =
    selectedProjectID && projectRequirementsResult.length === 0;

  return (
    <div className="border-0 sm:border sm:border-solid border-gitcoin-grey-100 rounded text-primary-text p-0 sm:p-4">
      <form onSubmit={(e) => e.preventDefault()}>
        {schema.questions.map((input) => {
          if (input.inputType !== "project" && !isValidProjectSelected) {
            return null;
          }

          switch (input.inputType) {
            case "project":
              return readOnly ? (
                <TextInput
                  key="project"
                  label="Select a project you would like to apply for funding:"
                  name="project"
                  value={formInputs.project ?? ""}
                  disabled={preview}
                  changeHandler={(e) => {
                    handleInput(e);
                  }}
                  required
                  feedback={
                    feedback.find((fb) => fb.title === "project") ?? {
                      type: "none",
                      message: "",
                    }
                  }
                />
              ) : (
                <Fragment key="project">
                  <div className="mt-6 w-full sm:w-1/2 relative">
                    <CustomSelect
                      key="project"
                      label="Select a project you would like to apply for funding:"
                      name="project"
                      value={formInputs.project ?? ""}
                      options={projectOptions ?? []}
                      disabled={preview}
                      changeHandler={handleProjectInput}
                      required
                      feedback={
                        feedback.find((fb) => fb.title === "project") ?? {
                          type: "none",
                          message: "",
                        }
                      }
                    />
                  </div>
                  <div>
                    <Toggle
                      projectMetadata={selectedProjectMetadata}
                      showProjectDetails={showProjectDetails}
                    />
                  </div>
                  {isValidProjectSelected && (
                    <div>
                      <p className="text-xs mt-4 mb-1 whitespace-normal sm:w-1/2">
                        To complete your application to{" "}
                        {round.roundMetadata.name}, a little more info is
                        needed:
                      </p>
                      <hr className="w-1/2" />
                    </div>
                  )}
                </Fragment>
              );
            case "recipient":
              /* Radio for safe or multi-sig */
              return (
                <Fragment key="recipient">
                  {!readOnly && (
                    <div className="relative mt-2" data-testid="wallet-type">
                      <Stack>
                        <Radio
                          label="Is your payout wallet a Gnosis Safe or multi-sig?"
                          choices={["Yes", "No"]}
                          changeHandler={handleInput}
                          name="isSafe"
                          value={formInputs.isSafe}
                          info=""
                          required
                          disabled={preview}
                          feedback={
                            feedback.find((fb) => fb.title === "isSafe") ?? {
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
                    key="recipient"
                    label="Payout Wallet Address"
                    name="recipient"
                    placeholder="Address that will receive funds"
                    // eslint-disable-next-line max-len
                    tooltipValue="Please make sure the payout wallet address you provide is a valid address that you own on the network you are applying on."
                    value={formInputs.recipient}
                    disabled={preview}
                    changeHandler={handleInput}
                    required
                    onAddressType={(v) => setAddressType(v)}
                    warningHighlight={
                      addressType &&
                      ((formInputs.isSafe === "Yes" &&
                        !addressType.isContract) ||
                        (formInputs.isSafe === "No" && addressType.isContract))
                    }
                    feedback={
                      feedback.find((fb) => fb.title === "recipient") ?? {
                        type: "none",
                        message: "",
                      }
                    }
                  />
                </Fragment>
              );
            case "text":
              return (
                <TextInput
                  key={input.id}
                  label={input.title}
                  name={`${input.id}`}
                  value={formInputs[`${input.id}`] ?? ""}
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
                  label={input.title}
                  name={`${input.id}`}
                  value={formInputs[`${input.id}`] ?? ""}
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
            case "multiple-choice":
              return (
                <Radio
                  key={input.id}
                  label={input.title}
                  name={`${input.id}`}
                  value={
                    formInputs[`${input.id}`] ??
                    (input.options && input.options[0])
                  }
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
          }
          return null;
        })}
        {selectedProjectID && projectRequirementsResult.length > 0 && (
          <div className="relative bg-gitcoin-violet-100 mt-3 p-3 rounded-md flex flex-1 justify-between items-center">
            <div className="flex flex-1 justify-start items-start">
              <div className="text-gitcoin-violet-500 fill-current w-6 shrink-0 mx-4">
                <InformationCircleIcon />
              </div>
              <div className="text-black text-sm">
                <p className="text-primary-text pb-1 font-medium">
                  Some information of your project is required to apply to this
                  round. Complete the required details{" "}
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
          ((formInputs.isSafe === "Yes" && !addressType.isContract) ||
            (formInputs.isSafe === "No" && addressType.isContract)) && (
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
                    {formInputs.isSafe === "Yes" &&
                      (!addressType.isContract || !addressType.isSafe) &&
                      // eslint-disable-next-line max-len
                      `It looks like the payout wallet address you have provided may not be a valid multi-sig on the ${chainInfo?.name} network. Please update your payout wallet address before proceeding.`}
                    {formInputs.isSafe === "No" &&
                      (addressType.isSafe || addressType.isContract) &&
                      // eslint-disable-next-line max-len
                      `It looks like the payout wallet address you have provided is a multi-sig. Please update your selection to indicate your payout wallet address will be a multi-sig, or update your payout wallet address.`}
                  </li>
                </ul>
              </div>
            </div>
          )}
        {!formValidation.valid &&
          showError &&
          formValidation.errorCount > 0 && (
            <div
              className="p-4 text-gitcoin-pink-500 border rounded border-red-900/10 bg-gitcoin-pink-100 mt-8"
              role="alert"
            >
              <strong className="text-gitcoin-pink-500 font-medium text-sm">
                There {formValidation.errorCount === 1 ? "was" : "were"}{" "}
                {formValidation.errorCount}{" "}
                {formValidation.errorCount === 1 ? "error" : "errors"} with your
                form submission
              </strong>
              <ul className="mt-1 ml-2 text-black text-sm list-disc list-inside">
                {formValidation.messages.map((o) => (
                  <li className="text-black my-1" key={o}>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        {!readOnly && (
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
      />
    </div>
  );
}
