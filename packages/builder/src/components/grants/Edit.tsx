import { useDataLayer } from "data-layer";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useSwitchNetwork } from "wagmi";
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
import { networkPrettyName } from "../../utils/wallet";
import Button, { ButtonVariants } from "../base/Button";
import ExitModal from "../base/ExitModal";
import Preview from "../base/Preview";
import ProjectForm from "../base/ProjectForm";
import PurpleNotificationBox from "../base/PurpleNotificationBox";
import SwitchNetworkModal from "../base/SwitchNetworkModal";
import VerificationForm from "../base/VerificationForm";
import Cross from "../icons/Cross";

function EditProject() {
  const dataLayer = useDataLayer();
  const params = useParams();
  const dispatch = useDispatch();
  const { switchNetwork } = useSwitchNetwork();

  const [modalOpen, toggleModal] = useState(false);
  const [formStatus, setFormStatus] = useState<ProjectFormStatus>(
    ProjectFormStatus.Metadata
  );

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[params.id!];

    return {
      id: params.id,
      projectMetadata: grantMetadata?.metadata,
      metadataStatus: grantMetadata
        ? grantMetadata.status
        : GrantsMetadataStatus.Undefined,
      error: state.newGrant.error,
      formMetaData: state.projectForm.metadata,
      chainId: state.web3.chainID,
      projectNumber: grantMetadata?.metadata?.projectNumber,
    };
  }, shallowEqual);

  const isOnProjectChain = Number(props.chainId) === Number(params.chainId);

  const onSwitchNetwork = () => {
    if (switchNetwork) {
      switchNetwork(Number(params.chainId));
    }
  };

  const renderNetworkChangeModal = () => {
    const roundNetworkName = networkPrettyName(Number(params.chainId));
    return (
      // eslint-disable-next-line
      <SwitchNetworkModal
        networkName={roundNetworkName}
        onSwitchNetwork={onSwitchNetwork}
        action="edit this project"
      />
    );
  };

  useEffect(() => {
    if (
      props.id !== undefined &&
      props.metadataStatus === GrantsMetadataStatus.Undefined
    ) {
      dispatch(fetchGrantData(props.id, dataLayer));
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
    <PurpleNotificationBox>
      Please note that changes to project details will only be reflected on
      subsequent grant round applications.
    </PurpleNotificationBox>
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
        <h5 className="mb-2 sm:text-left text-center">{data.title}</h5>
        <p className="mb-2 sm:text-left text-center">{data.description}</p>
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
            currentProjectId={props.projectNumber?.toString() || props.id}
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="sm:w-full mx-4">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="w-full sm:w-1/3 flex flex-col sm:flex-row">
          <h3 className="mb-2">Edit Your Project</h3>
          <div className="w-full mb-2 inline-block sm:hidden sm:text-center">
            {currentSubText(formStatus)}
          </div>
        </div>
        <div className="w-full sm:w-2/3 flex sm:flex-row flex-col items-center justify-end">
          <div className="flex flex-row">
            <Button
              variant={ButtonVariants.outlineDanger}
              onClick={() => toggleModal(true)}
              styles={["ml-0"]}
            >
              <i className="icon mt-1">
                <Cross color={colors["danger-background"]} />
              </i>{" "}
              <span className="pl-2">Exit</span>
            </Button>
          </div>
        </div>
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
              href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/project-owners"
            >
              Builder Guide.
            </a>
          </p>
        </div>

        <div className="w-full md:w-2/3">{currentForm(formStatus)}</div>
      </div>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
      {!isOnProjectChain && renderNetworkChangeModal()}
    </div>
  );
}

export default EditProject;
