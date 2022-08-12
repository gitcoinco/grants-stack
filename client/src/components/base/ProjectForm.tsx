import { useEffect, useState } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { ValidationError } from "yup";
import { TextArea, TextInput, WebsiteInput } from "../grants/inputs";
import ImageInput from "./ImageInput";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";
import Button, { ButtonVariants } from "./Button";
import { validateProjectForm } from "./formValidation";
import ExitModal from "./ExitModal";
import { ChangeHandlers, FormInputs, ProjectFormStatus } from "../../types";
import { metadataSaved } from "../../actions/projectForm";

const validation = {
  message: "",
  valid: false,
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
      loading: grantMetadata ? grantMetadata.loading : false,
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
        message: "",
        valid: true,
      });
    } catch (e) {
      const error = e as ValidationError;
      setFormValidation({
        message: error.message,
        valid: false,
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
          <p className="text-danger-text w-full text-center font-semibold my-2">
            {formValidation.message}
          </p>
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
