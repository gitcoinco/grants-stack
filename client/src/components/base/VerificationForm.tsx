import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { credentialsSaved } from "../../actions/projectForm";
import { ChangeHandlers, ProjectFormStatus } from "../../types";
import Button, { ButtonVariants } from "./Button";
import { TextInput } from "../grants/inputs";
import Github from "../providers/Github";
import Twitter from "../providers/Twitter";
import { RootState } from "../../reducers";

const initialFormValues = {
  github: "",
  twitter: "",
};

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

  const [formInputs, setFormInputs] = useState(initialFormValues);
  const [ghVerification, setGHVerification] = useState<VerifiableCredential>();
  const [twitterVerification, setTwitterVerification] =
    useState<VerifiableCredential>();
  const [error, setError] = useState<string | undefined>();
  const handleInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    setFormInputs({ ...formInputs, [e.target.name]: value });
  };

  const saveAndPreview = () => {
    dispatch(
      credentialsSaved({
        github: ghVerification,
        twitter: twitterVerification,
      })
    );
    setVerifying(ProjectFormStatus.Preview);
  };

  return (
    <div className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text px-4">
      <div className="flex items-center mb-6">
        <img
          className="h-12 mr-12"
          src="./assets/github_logo.png"
          alt="Github Logo"
        />
        <TextInput
          disabled
          label="Github"
          info="Connect your project’s GitHub account to verify (Optional)"
          name="github"
          placeholder="What's the project name?"
          value={props.formMetaData.projectGithub}
          changeHandler={handleInput}
        />
        <Github
          org={props.formMetaData.projectGithub ?? ""}
          verificationComplete={setGHVerification}
          verificationError={(providerError) => setError(providerError)}
        />
      </div>
      <hr className="my-4" />
      <div className="flex items-center mb-6">
        <img
          className="h-12 mr-9"
          src="./assets/twitter_logo.svg"
          alt="Twitter Logo"
        />
        <TextInput
          disabled
          label="Twitter"
          info="Connect your project’s Twitter account to verify (Optional)"
          name="twitter"
          placeholder="What's the project name?"
          value={props.formMetaData.projectTwitter}
          changeHandler={handleInput}
        />
        <Twitter
          handle={props.formMetaData.projectTwitter ?? ""}
          verificationComplete={setTwitterVerification}
          verificationError={(providerError) => setError(providerError)}
        />
      </div>
      <hr className="my-4" />
      {error && (
        <div className="flex bg-danger-background/25 p-4 rounded">
          <img
            className="h-4 mt-1 mx-2"
            src="./icons/x-circle.svg"
            alt="error icon"
          />
          <p className="text-danger-text font-normal">{error}</p>
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
          Next
        </Button>
      </div>
    </div>
  );
}
