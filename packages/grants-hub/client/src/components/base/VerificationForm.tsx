import { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { metadataSaved } from "../../actions/projectForm";
import { GithubLogo, TwitterLogo } from "../../assets";
import { XCircle } from "../../assets/icons";
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
              feedback={{ type: "none", message: "" }}
            />
            <Twitter
              handle={props.formMetaData.projectTwitter ?? ""}
              verificationError={(providerError) => setError(providerError)}
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
              feedback={{ type: "none", message: "" }}
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
              feedback={{ type: "none", message: "" }}
            />
            <Github
              org={props.formMetaData.projectGithub ?? ""}
              canVerify={
                !!props.formMetaData.projectGithub &&
                !!props.formMetaData.userGithub
              }
              verificationError={(providerError) => setError(providerError)}
            />
          </div>
        </div>
      </div>
      <hr className="my-4" />
      {error && (
        <div className="flex bg-danger-background/25 p-4 rounded">
          <img className="h-4 mt-1 mx-2" src={XCircle} alt="error icon" />
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
