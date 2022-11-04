import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { credentialsSaved, metadataSaved } from "../../actions/projectForm";
import { RootState } from "../../reducers";
import { ChangeHandlers, ProjectFormStatus } from "../../types";
import { TextInput } from "../grants/inputs";
import Github from "../providers/Github";
import Twitter from "../providers/Twitter";
import Button, { ButtonVariants } from "./Button";

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

  const [ghVerification, setGHVerification] = useState<VerifiableCredential>();
  const [twitterVerification, setTwitterVerification] =
    useState<VerifiableCredential>();
  const [error, setError] = useState<string | undefined>();

  const handleInput = (e: ChangeHandlers) => {
    if (e.target.name === "projectGithub" || e.target.name === "userGithub") {
      setGHVerification(undefined);
    }
    if (e.target.name === "projectTwitter") {
      setTwitterVerification(undefined);
    }
    const { value } = e.target;
    dispatch(
      metadataSaved({
        ...props.formMetaData,
        [e.target.name]: value,
      })
    );
  };

  const saveAndPreview = () => {
    dispatch(
      credentialsSaved({
        github: ghVerification!,
        twitter: twitterVerification!,
      })
    );
    setVerifying(ProjectFormStatus.Preview);
  };

  return (
    <div className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text px-4">
      <div className="flex items-center mb-6">
        <img
          className="h-12 mr-12 mt-6"
          src="./assets/github_logo.png"
          alt="Github Logo"
        />
        <TextInput
          label="Your Github Username"
          name="userGithub"
          placeholder="GitHub username you use to contribute to the project"
          value={props.formMetaData.userGithub}
          changeHandler={handleInput}
          required={false}
        />
      </div>
      <div className="flex items-center mb-6">
        <div className="h-12 mr-12 w-12" />
        <TextInput
          label="Github Oganization"
          info="Connect your project’s GitHub account to verify (Optional)"
          name="projectGithub"
          placeholder="What's the project name?"
          value={props.formMetaData.projectGithub}
          changeHandler={handleInput}
          required={false}
        />
        <Github
          org={props.formMetaData.projectGithub ?? ""}
          canVerify={
            !!props.formMetaData.projectGithub &&
            !!props.formMetaData.userGithub
          }
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
          disabled={twitterVerification !== undefined}
          label="Twitter"
          info="Connect your project’s Twitter account to verify (Optional)"
          name="projectTwitter"
          placeholder="What's the project name?"
          value={props.formMetaData.projectTwitter}
          changeHandler={handleInput}
          required={false}
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
