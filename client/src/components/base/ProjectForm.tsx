import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { ValidationError } from "yup";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { metadataSaved } from "../../actions/projectForm";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/grantsMetadata";
import { ChangeHandlers, FormInputs, ProjectFormStatus } from "../../types";
import { TextArea, TextInput, WebsiteInput } from "../grants/inputs";
import Button, { ButtonVariants } from "./Button";
import ExitModal from "./ExitModal";
import { validateProjectForm } from "./formValidation";
import ImageInput from "./ImageInput";

const validation = {
  messages: [""],
  valid: false,
  errorCount: 0,
};

function ProjectForm({
  currentProjectId,
  setVerifying,
}: {
  currentProjectId?: string;
  setVerifying: (verifying: ProjectFormStatus) => void;
}) {
  const dispatch = useDispatch();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(currentProjectId)];
    return {
      id: currentProjectId,
      loading: grantMetadata ? grantMetadata.status === Status.Loading : false,
      currentProject: grantMetadata?.metadata,
      status: state.newGrant.status,
      error: state.newGrant.error,
      formMetaData: state.projectForm.metadata,
    };
  }, shallowEqual);

  const [formValidation, setFormValidation] = useState(validation);
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, toggleModal] = useState(false);

  const [logoImg, setLogoImg] = useState<Blob | undefined>();
  const [bannerImg, setBannerImg] = useState<Blob | undefined>();

  const handleInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    dispatch(
      metadataSaved({
        ...props.formMetaData,
        [e.target.name]: value,
        bannerImg,
        logoImg,
      })
    );
  };

  useEffect(() => {
    // called twice
    // 1 - when it loads or id changes (it checks if it's cached in local storage)
    if (currentProjectId !== undefined && props.currentProject === undefined) {
      dispatch(fetchGrantData(Number(currentProjectId)));
    }

    const currentProject = props.currentProject as FormInputs;

    if (currentProject) {
      dispatch(
        metadataSaved({
          ...currentProject,
        })
      );
    }
  }, [dispatch, currentProjectId, props.currentProject]);

  const validate = async () => {
    try {
      await validateProjectForm(props.formMetaData);
      setFormValidation({
        messages: [],
        valid: true,
        errorCount: 0,
      });
    } catch (e) {
      const error = e as ValidationError;
      setFormValidation({
        messages: error.inner.map((er) => (er as ValidationError).message),
        valid: false,
        errorCount: error.inner.length,
      });
    }
  };
  // perform validation after the fields state is updated
  useEffect(() => {
    validate();
  }, [props.formMetaData]);

  const nextStep = () => {
    setSubmitted(true);
    if (formValidation.valid) {
      setVerifying(ProjectFormStatus.Verification);
    }
  };

  if (
    // if it's undefined we don't have anything to load
    currentProjectId !== undefined &&
    props.currentProject === undefined &&
    props.loading &&
    props.currentProject === undefined
  ) {
    return <>Loading grant data from IPFS... </>;
  }

  return (
    <div className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text p-0 sm:p-4">
      <form onSubmit={(e) => e.preventDefault()}>
        <TextInput
          label="Project Name"
          name="title"
          placeholder="What's the project name?"
          value={props.formMetaData.title}
          changeHandler={handleInput}
        />
        <WebsiteInput
          label="Project Website"
          name="website"
          value={props.formMetaData.website}
          changeHandler={handleInput}
        />
        <ImageInput
          label="Project Logo"
          dimensions={{
            width: 300,
            height: 300,
          }}
          circle
          existingImg={props.currentProject?.logoImg}
          imgHandler={(buffer: Blob) => setLogoImg(buffer)}
        />
        <ImageInput
          label="Project Banner"
          dimensions={{
            width: 1500,
            height: 500,
          }}
          existingImg={props.currentProject?.bannerImg}
          imgHandler={(buffer: Blob) => setBannerImg(buffer)}
        />
        <TextInput
          label="Project Twitter"
          name="projectTwitter"
          placeholder="twitterusername"
          value={props.formMetaData.projectTwitter}
          changeHandler={handleInput}
        />
        <TextInput
          label="Your Github Username"
          name="userGithub"
          placeholder="githubusername"
          value={props.formMetaData.userGithub}
          changeHandler={handleInput}
        />
        <TextInput
          label="Project Github Organization"
          name="projectGithub"
          placeholder="githuborgname"
          value={props.formMetaData.projectGithub}
          changeHandler={handleInput}
        />
        <TextArea
          label="Project Description"
          name="description"
          placeholder="What is the project about and what kind of impact does it aim to have?"
          value={props.formMetaData.description}
          changeHandler={handleInput}
        />
        {!formValidation.valid && submitted && (
          <div
            className="p-4 text-red-700 border rounded border-red-900/10 bg-red-50 mt-8"
            role="alert"
          >
            <strong className="text-sm font-medium">
              There {formValidation.errorCount === 1 ? "was" : "were"}{" "}
              {formValidation.errorCount} error
              {formValidation.errorCount === 1 ? "" : "s"} with your form
              submission
            </strong>

            <ul className="mt-1 ml-2 text-xs list-disc list-inside">
              {formValidation.messages.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex w-full justify-end mt-6">
          <Button
            variant={ButtonVariants.outline}
            onClick={() => toggleModal(true)}
          >
            Cancel
          </Button>
          <Button
            disabled={!formValidation.valid && submitted}
            variant={ButtonVariants.primary}
            onClick={nextStep}
          >
            Next
          </Button>
        </div>
      </form>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default ProjectForm;
