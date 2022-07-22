import { useEffect, useState } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { ValidationError } from "yup";
import { useNavigate } from "react-router-dom";
import { TextArea, TextInput, WebsiteInput } from "../grants/inputs";
import ImageInput from "./ImageInput";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";
import Button, { ButtonVariants } from "./Button";
import { publishGrant, resetStatus } from "../../actions/newGrant";
import { validateProjectForm } from "./formValidation";
import { Status } from "../../reducers/newGrant";
import Toast from "./Toast";
import TXLoading from "./TXLoading";
import ExitModal from "./ExitModal";
import { slugs } from "../../routes";
import { ChangeHandlers } from "../../types";

const initialFormValues = {
  title: "",
  description: "",
  website: "",
};

const validation = {
  message: "",
  valid: false,
};

function ProjectForm({ currentProjectId }: { currentProjectId?: string }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(currentProjectId)];
    return {
      id: currentProjectId,
      loading: grantMetadata ? grantMetadata.loading : false,
      currentProject: grantMetadata?.metadata,
      status: state.newGrant.status,
      error: state.newGrant.error,
    };
  }, shallowEqual);

  const [formValidation, setFormValidation] = useState(validation);
  const [submitted, setSubmitted] = useState(false);
  const [formInputs, setFormInputs] = useState(initialFormValues);
  const [show, showToast] = useState(false);
  const [modalOpen, toggleModal] = useState(false);

  const localResetStatus = () => {
    setSubmitted(false);
    setFormValidation(validation);
    dispatch(resetStatus());
  };
  const [logoImg, setLogoImg] = useState<Blob | undefined>();
  const [bannerImg, setBannerImg] = useState<Blob | undefined>();

  const publishProject = async () => {
    setSubmitted(true);
    if (!formValidation.valid) return;
    localResetStatus();
    showToast(true);
    await dispatch(
      publishGrant(currentProjectId, formInputs, {
        bannerImg,
        logoImg,
      })
    );
  };

  const handleInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    setFormInputs({ ...formInputs, [e.target.name]: value });
  };

  useEffect(() => {
    if (props.status === Status.Completed) {
      setTimeout(() => navigate(slugs.grants), 1500);
    }
  }, [props.status]);

  // TODO: feels like this could be extracted to a component
  useEffect(() => {
    // called twice
    // 1 - when it loads or id changes (it checks if it's cached in local storage)
    if (currentProjectId !== undefined && props.currentProject === undefined) {
      dispatch(fetchGrantData(Number(currentProjectId)));
    }

    const { currentProject } = props;

    if (currentProject) {
      setFormInputs({
        title: currentProject.title,
        description: currentProject.description,
        website: currentProject.website,
      });
    }
  }, [dispatch, currentProjectId, props.currentProject]);

  const validate = async () => {
    try {
      await validateProjectForm(formInputs);
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
  }, [formInputs]);

  // eslint-disable-next-line
  useEffect(() => {
    return () => {
      localResetStatus();
    };
  }, []);

  useEffect(() => {
    if (props.status === Status.Completed) {
      setFormInputs(initialFormValues);
    }
  }, [props.status]);

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
          value={formInputs.title}
          changeHandler={handleInput}
        />
        <WebsiteInput
          label="Project Website"
          name="website"
          value={formInputs.website}
          changeHandler={handleInput}
        />
        <ImageInput
          label="Project Logo"
          dimensions={{
            width: 300,
            height: 300,
          }}
          circle
          currentProject={props.currentProject}
          imgHandler={(buffer: Blob) => setLogoImg(buffer)}
        />
        <ImageInput
          label="Project Banner"
          dimensions={{
            width: 1500,
            height: 500,
          }}
          currentProject={props.currentProject}
          imgHandler={(buffer: Blob) => setBannerImg(buffer)}
        />
        <TextArea
          label="Project Description"
          name="description"
          placeholder="What is the project about and what kind of impact does it aim to have?"
          value={formInputs.description}
          changeHandler={handleInput}
        />
        {!formValidation.valid && submitted && (
          <p className="text-danger-text w-full text-center font-semibold my-2">
            {formValidation.message}
          </p>
        )}
        <div className="flex w-full justify-end mt-6">
          <Button
            disabled={!formValidation.valid && submitted}
            variant={ButtonVariants.outline}
            onClick={() => toggleModal(true)}
          >
            Cancel
          </Button>
          <Button
            disabled={!formValidation.valid && submitted}
            variant={ButtonVariants.primary}
            onClick={publishProject}
          >
            Save &amp; Publish
          </Button>
        </div>
      </form>
      <Toast
        show={show}
        fadeOut={props.status === Status.Completed}
        onClose={() => showToast(false)}
        error={props.status === Status.Error}
      >
        <TXLoading status={props.status} error={props.error} />
      </Toast>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default ProjectForm;
