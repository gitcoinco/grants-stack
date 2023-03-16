import { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { ValidationError } from "yup";
import { metadataSaved } from "../../actions/projectForm";
import { GithubLogo, TwitterLogo } from "../../assets";
import { XCircle } from "../../assets/icons";
import { RootState } from "../../reducers";
import { ChangeHandlers, ProjectFormStatus } from "../../types";
import { TextInput } from "../grants/inputs";
import Github from "../providers/Github";
import Twitter from "../providers/Twitter";
import Button, { ButtonVariants } from "./Button";
import { validateVerificationForm } from "./formValidation";

export default function VerificationForm({
  setVerifying,
}: {
  setVerifying: (verifying: ProjectFormStatus) => void;
}) {
  const dispatch = useDispatch();

  const props = useSelector(
    (state: RootState) => ({
      formMetaData: state.projectForm.metadata,
    }),
    shallowEqual
  );

  const [failed, setFailed] = useState<string | undefined>();
  const [formValidation, setFormValidation] = useState({
    messages: [""],
    valid: true,
    errorCount: 0,
  });

  const [feedback, setFeedback] = useState([
    { title: "", type: "none", message: "" },
  ]);

  const handleInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    dispatch(
      metadataSaved({
        ...props.formMetaData,
        [e.target.name]: value,
      })
    );
  };

  const validate = async () => {
    try {
      await validateVerificationForm(props.formMetaData);
      setFormValidation({
        messages: [],
        valid: true,
        errorCount: 0,
      });
      setFeedback([{ title: "", type: "none", message: "" }]);
      return true;
    } catch (e) {
      const error = e as ValidationError;
      setFormValidation({
        messages: error.inner.map((er) => (er as ValidationError).message),
        valid: false,
        errorCount: error.inner.length,
      });
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

      return false;
    }
  };

  const saveAndPreview = async () => {
    const valid = await validate();
    if (valid) {
      setVerifying(ProjectFormStatus.Preview);
    }
  };

  return (
    <div className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text px-4">
      <div className="grid lg:grid-cols-12">
        <div className="lg:col-span-1 flex items-center justify-center">
          <img src={TwitterLogo} className="h-7 mt-4" alt="Twitter Logo" />
        </div>
        <div className="lg:col-span-11">
          <div className="row-span-1 flex items-center">
            <TextInput
              label="Project Twitter Account"
              name="projectTwitter"
              placeholder="Your project's Twitter handle"
              value={props.formMetaData.projectTwitter}
              changeHandler={handleInput}
              required={false}
              feedback={
                feedback.find((fb) => fb.title === "projectTwitter") ?? {
                  type: "none",
                  message: "",
                }
              }
              prefixBoxText="@"
            />
            <Twitter
              handle={props.formMetaData.projectTwitter ?? ""}
              verificationError={(providerError) => setFailed(providerError)}
              canVerify={!!props.formMetaData.projectTwitter}
            />
          </div>
        </div>
      </div>
      <hr className="my-4" />
      <div className="grid lg:grid-cols-12">
        <div className="lg:col-span-1 flex items-center justify-center">
          <img src={GithubLogo} className="h-8" alt="GitHub Logo" />
        </div>
        <div className="lg:col-span-11">
          <div className="row-span-2 flex items-center">
            <TextInput
              label="Your GitHub Username"
              name="userGithub"
              placeholder="GitHub username you use to contribute to the project"
              value={props.formMetaData.userGithub}
              changeHandler={handleInput}
              required={false}
              feedback={
                feedback.find((fb) => fb.title === "userGithub") ?? {
                  type: "none",
                  message: "",
                }
              }
            />
          </div>
          <div className="row-span-2 flex items-center">
            <TextInput
              label="GitHub Organization"
              name="projectGithub"
              placeholder="GitHub org name your project is part of"
              value={props.formMetaData.projectGithub}
              changeHandler={handleInput}
              required={false}
              tooltip={`In order to successfully verify,
          please make sure that you are a public member of the GitHub organization.
          GitHub organization and usernames are case sensitive.`}
              feedback={
                feedback.find((fb) => fb.title === "projectGithub") ?? {
                  type: "none",
                  message: "",
                }
              }
            />
            <Github
              org={props.formMetaData.projectGithub ?? ""}
              canVerify={
                !!props.formMetaData.projectGithub &&
                !!props.formMetaData.userGithub
              }
              verificationError={(providerError) => setFailed(providerError)}
            />
          </div>
        </div>
      </div>
      <hr className="my-4" />
      {failed && (
        <div className="flex bg-danger-background/25 p-4 rounded">
          <img className="h-4 mt-1 mx-2" src={XCircle} alt="error icon" />
          <p className="text-danger-text font-normal">{failed}</p>
        </div>
      )}
      {!formValidation.valid && (
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
      <div className="flex w-full justify-end mt-6">
        <Button
          variant={ButtonVariants.outline}
          onClick={() => setVerifying(ProjectFormStatus.Metadata)}
        >
          Back
        </Button>
        <Button variant={ButtonVariants.primary} onClick={saveAndPreview}>
          {!props.formMetaData.userGithub &&
          !props.formMetaData.projectGithub &&
          !props.formMetaData.projectTwitter
            ? "Skip"
            : "Next"}
        </Button>
      </div>
    </div>
  );
}
