import { useAllo } from "common";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { publishGrant, resetStatus } from "../../actions/newGrant";
import { unloadAll as unloadAllMetadata } from "../../actions/grantsMetadata";
import { unloadProjects } from "../../actions/projects";
import { formReset } from "../../actions/projectForm";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/newGrant";
import { slugs } from "../../routes";
import { ProjectFormStatus } from "../../types";
import Details from "../grants/Details";
import Button, { ButtonVariants } from "./Button";
import { addAlert } from "../../actions/ui";
import { grantSteps } from "../../utils/steps";
import StatusModal from "./StatusModal";
import ErrorModal from "./ErrorModal";
import { DefaultProjectBanner, DefaultProjectLogo } from "../../assets";

export default function Preview({
  currentProjectId,
  setVerifying,
}: {
  currentProjectId?: string;
  setVerifying: (verifying: ProjectFormStatus) => void;
}) {
  const dispatch = useDispatch();

  const [submitted, setSubmitted] = useState(false);
  const [show, showModal] = useState(false);

  const props = useSelector((state: RootState) => {
    const prevMetadata = state.grantsMetadata[currentProjectId || ""];

    return {
      prevMetadata,
      metadata: state.projectForm.metadata,
      credentials: state.projectForm.credentials,
      status: state.newGrant.status,
      error: state.newGrant.error,
      openErrorModal: state.newGrant.error !== undefined,
    };
  }, shallowEqual);

  const localResetStatus = () => {
    setSubmitted(false);
    dispatch(resetStatus());
    dispatch(formReset());
  };

  const resetSubmit = () => {
    setSubmitted(false);
    showModal(false);
    dispatch(resetStatus());
  };

  const allo = useAllo();

  const publishProject = async () => {
    if (allo === null) {
      return;
    }

    setSubmitted(true);
    showModal(true);
    dispatch(publishGrant(allo, currentProjectId));
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (props.status === Status.Completed) {
      setTimeout(() => {
        navigate(slugs.grants);
        localResetStatus();
        dispatch(
          addAlert(
            "success",
            "Your project has been saved successfully!",
            undefined
          )
        );
      }, 1500);
    }

    return () => {
      if (props.status === Status.Completed) {
        dispatch(unloadAllMetadata());
        dispatch(unloadProjects());
      }
    };
  }, [props.status]);

  const { credentials } = props;
  const project = {
    ...props.metadata,
    credentials,
  };

  return (
    <div>
      <Details
        updatedAt={+Date.now()}
        createdAt={props.prevMetadata?.metadata?.createdAt ?? +Date.now()}
        project={project}
        logoImg={props.metadata?.logoImgData ?? DefaultProjectLogo}
        bannerImg={props.metadata?.bannerImgData ?? DefaultProjectBanner}
        showApplications={false}
        showTabs={false}
      />
      <div className="flex justify-end">
        <Button
          variant={ButtonVariants.outline}
          onClick={() => setVerifying(ProjectFormStatus.Verification)}
          dataTrackEvent="project-create-publish-back"
        >
          Back to Editing
        </Button>
        <Button
          disabled={submitted}
          variant={ButtonVariants.primary}
          onClick={publishProject}
          dataTrackEvent="project-create-publish-next"
        >
          Save and Publish
        </Button>
      </div>
      <StatusModal
        open={show && !props.openErrorModal}
        onClose={() => showModal(false)}
        currentStatus={props.status}
        steps={grantSteps}
        error={props.error}
        title="Please hold on while we create your project."
      />
      <ErrorModal
        open={props.openErrorModal}
        onClose={resetSubmit}
        onRetry={publishProject}
      />
    </div>
  );
}
