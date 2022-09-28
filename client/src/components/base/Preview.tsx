import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { publishGrant, resetStatus } from "../../actions/newGrant";
import { formReset } from "../../actions/projectForm";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/newGrant";
import { slugs } from "../../routes";
import { ProjectFormStatus } from "../../types";
import { formatDate } from "../../utils/components";
import Details from "../grants/Details";
import Button, { ButtonVariants } from "./Button";
import Toast from "./Toast";
import TXLoading from "./TXLoading";

export default function Preview({
  currentProjectId,
  setVerifying,
}: {
  currentProjectId?: string;
  setVerifying: (verifying: ProjectFormStatus) => void;
}) {
  const dispatch = useDispatch();

  const [submitted, setSubmitted] = useState(false);
  const [show, showToast] = useState(false);

  const props = useSelector(
    (state: RootState) => ({
      metadata: state.projectForm.metadata,
      credentials: state.projectForm.credentials,
      status: state.newGrant.status,
      error: state.newGrant.error,
    }),
    shallowEqual
  );

  const localResetStatus = () => {
    setSubmitted(false);
    dispatch(resetStatus());
    dispatch(formReset());
  };

  const publishProject = async () => {
    setSubmitted(true);
    showToast(true);
    await dispatch(publishGrant(currentProjectId));
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (props.status === Status.Completed) {
      setTimeout(() => {
        navigate(slugs.grants);
        localResetStatus();
      }, 1500);
    }
  }, [props.status]);

  const { credentials } = props;
  const project = {
    ...props.metadata,
    credentials,
  };

  return (
    <div>
      {/* TODO: fetch proper "created at" date */}
      <Details
        preview
        updatedAt={formatDate(Date.now() / 1000)}
        createdAt={formatDate(Date.now() / 1000)}
        project={project}
        logoImg={
          props.metadata?.logoImgData ?? "./assets/default-project-logo.png"
        }
        bannerImg={
          props.metadata?.bannerImgData ?? "./assets/default-project-banner.png"
        }
      />
      <div className="flex justify-end">
        <Button
          variant={ButtonVariants.outline}
          onClick={() => setVerifying(ProjectFormStatus.Verification)}
        >
          Back to Editing
        </Button>
        <Button
          disabled={submitted}
          variant={ButtonVariants.primary}
          onClick={publishProject}
        >
          Save and Publish
        </Button>
      </div>
      <Toast
        show={show}
        fadeOut={props.status === Status.Completed}
        onClose={() => showToast(false)}
        error={props.status === Status.Error}
      >
        <TXLoading status={props.status} error={props.error} />
      </Toast>
    </div>
  );
}
