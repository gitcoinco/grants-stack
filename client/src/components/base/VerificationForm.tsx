import { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { metadataSaved } from "../../actions/projectForm";
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

  const [error, setError] = useState<string | undefined>();

  const handleInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    dispatch(
      metadataSaved({
        ...props.formMetaData,
        [e.target.name]: value,
      })
    );
  };

  const saveAndPreview = () => {
    setVerifying(ProjectFormStatus.Preview);
  };

  return (
    <div className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text px-4">
      <div className="flex items-center mb-6">
        <img
          className="h-12 mr-9"
          src="./assets/twitter_logo.svg"
          alt="Twitter Logo"
        />
        <TextInput
          label="Twitter"
          name="projectTwitter"
          placeholder="Your project's Twitter handle"
          value={props.formMetaData.projectTwitter}
          changeHandler={handleInput}
          required={false}
        />
        <Twitter
          handle={props.formMetaData.projectTwitter ?? ""}
          verificationError={(providerError) => setError(providerError)}
          canVerify={!!props.formMetaData.projectTwitter}
        />
      </div>
      <hr className="my-4" />
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
          name="projectGithub"
          placeholder="GitHub org name your project is part of"
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
          verificationComplete={() => {}} // todo: remove me
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
