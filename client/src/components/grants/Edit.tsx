import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchGrantData } from "../../actions/grantsMetadata";
import {
  credentialsSaved,
  formReset,
  metadataSaved,
} from "../../actions/projectForm";
import { RootState } from "../../reducers";
import { Status as GrantsMetadataStatus } from "../../reducers/grantsMetadata";
import colors from "../../styles/colors";
import { ProjectFormStatus } from "../../types";
import Button, { ButtonVariants } from "../base/Button";
import ExitModal from "../base/ExitModal";
import Preview from "../base/Preview";
import ProjectForm from "../base/ProjectForm";
import VerificationForm from "../base/VerificationForm";
import Cross from "../icons/Cross";

function EditProject() {
  const params = useParams();
  const dispatch = useDispatch();

  const [modalOpen, toggleModal] = useState(false);
  const [formStatus, setFormStatus] = useState<ProjectFormStatus>(
    ProjectFormStatus.Metadata
  );

  const props = useSelector((state: RootState) => {
    const fullId = `${params.chainId}:${params.registryAddress}:${params.id}`;

    const grantMetadata = state.grantsMetadata[fullId];

    return {
      id: fullId,
      projectMetadata: grantMetadata?.metadata,
      metadataStatus: grantMetadata
        ? grantMetadata.status
        : GrantsMetadataStatus.Undefined,
      error: state.newGrant.error,
      formMetaData: state.projectForm.metadata,
    };
  }, shallowEqual);

  useEffect(() => {
    if (
      props.id !== undefined &&
      props.metadataStatus === GrantsMetadataStatus.Undefined
    ) {
      dispatch(fetchGrantData(props.id));
    }
  }, [dispatch, props.id, props.metadataStatus]);

  useEffect(() => {
    if (props.projectMetadata !== undefined) {
      dispatch(
        metadataSaved({
          ...props.projectMetadata,
        })
      );

      if (props.projectMetadata.credentials !== undefined) {
        dispatch(credentialsSaved(props.projectMetadata.credentials));
      }
    }

    return () => {
      dispatch(formReset());
    };
  }, [props.projectMetadata]);

  if (
    props.metadataStatus === GrantsMetadataStatus.Undefined ||
    props.metadataStatus === GrantsMetadataStatus.Loading
  ) {
    return <>loading...</>;
  }

  if (
    props.projectMetadata === undefined ||
    props.metadataStatus === GrantsMetadataStatus.Error
  ) {
    return <>Couldn&apos;t load project data.</>;
  }

  const editNotification = (
    <div className="flex rounded-md p-4 bg-gitcoin-violet-100 mr-4">
      <p className="flex">
        <InformationCircleIcon
          className="flex text-gitcoin-grey-300 fill-gitcoin-violet-400"
          color="gitcoin-violet-500"
          width={20}
          height={20}
        />
      </p>
      <p className="flex mx-5 text-sm text-gitcoin-violet-500 text=[14px]">
        Please note that changes to project details will only be reflected on
        subsequent grant round applications.
      </p>
    </div>
  );

  const currentSubText = (status: ProjectFormStatus) => {
    let data:
      | { title: string; description: string; element: JSX.Element | null }
      | undefined;
    switch (status) {
      case ProjectFormStatus.Metadata:
        data = {
          title: "Project Details",
          description: "Tell us more about what you’re working on.",
          element: editNotification,
        };
        break;
      case ProjectFormStatus.Verification:
        data = {
          title: "Project Socials",
          description: "Share where we can learn more about your project.",
          element: editNotification,
        };
        break;
      case ProjectFormStatus.Preview:
        data = {
          title: "Project Preview",
          description: "Preview your project's page.",
          element: editNotification,
        };
        break;
      default:
        return null;
    }

    return data ? (
      <>
        <h5 className="mb-2">{data.title}</h5>
        <p className="mb-2">{data.description}</p>
        {data.element}
      </>
    ) : null;
  };

  const currentForm = (status: ProjectFormStatus) => {
    switch (status) {
      case ProjectFormStatus.Metadata:
        return (
          <ProjectForm
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
      case ProjectFormStatus.Verification:
        return (
          <VerificationForm
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
      case ProjectFormStatus.Preview:
        return (
          <Preview
            currentProjectId={props.id}
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <h3 className="mb-2">Edit Your Project</h3>
        <div className="w-full mb-2 inline-block sm:hidden">
          {currentSubText(formStatus)}
        </div>
        <Button
          variant={ButtonVariants.outlineDanger}
          onClick={() => toggleModal(true)}
          styles={["w-full sm:w-auto mx-w-full ml-0"]}
        >
          <i className="icon mt-1.5">
            <Cross color={colors["danger-background"]} />
          </i>{" "}
          <span className="pl-2">Exit</span>
        </Button>
      </div>

      <div className="w-full flex">
        <div className="w-full md:w-1/3 mb-2 hidden sm:inline-block">
          {currentSubText(formStatus)}
          <p className="mt-4">
            Need Help? Check out the{" "}
            <a
              target="_blank"
              rel="noreferrer"
              className="text-gitcoin-violet-400"
              href="https://support.gitcoin.co/gitcoin-grants-protocol"
            >
              Grants Hub Guide.
            </a>
          </p>
        </div>

        <div className="w-full md:w-2/3">{currentForm(formStatus)}</div>
      </div>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default EditProject;
