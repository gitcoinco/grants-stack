import { Link, useParams } from "react-router-dom";
import { useWallet } from "../common/Auth";
import { Spinner } from "../common/Spinner";
import {
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardsContainer,
  CardTitle,
} from "../common/styles";
import {
  ApplicationStatus,
  GrantApplication,
  ProgressStatus,
  ProgressStep,
  ProjectStatus,
} from "../api/types";
import { useEffect, useState } from "react";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  AdditionalGasFeesNote,
  ApplicationHeader,
  Cancel,
  Continue,
  RejectedApplicationsCount,
  Select,
} from "./BulkApplicationCommon";
import { useApplicationByRoundId } from "../../context/application/ApplicationContext";
import { datadogLogs } from "@datadog/browser-logs";
import { useBulkUpdateGrantApplications } from "../../context/application/BulkUpdateGrantApplicationContext";
import ProgressModal from "../common/ProgressModal";
import { errorModalDelayMs } from "../../constants";
import ErrorModal from "../common/ErrorModal";

export default function ApplicationsApproved() {
  const { id } = useParams();
  const { chain } = useWallet();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { applications, isLoading } = useApplicationByRoundId(id!);
  const approvedApplications =
    applications?.filter(
      (a: GrantApplication) =>
        a.status === ApplicationStatus.APPROVED.toString()
    ) || [];

  const [bulkSelectApproved, setBulkSelectApproved] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [selected, setSelected] = useState<GrantApplication[]>([]);

  const {
    bulkUpdateGrantApplications,
    IPFSCurrentStatus,
    contractUpdatingStatus,
    indexingStatus,
  } = useBulkUpdateGrantApplications();
  const isBulkUpdateLoading =
    IPFSCurrentStatus == ProgressStatus.IN_PROGRESS ||
    contractUpdatingStatus == ProgressStatus.IN_PROGRESS ||
    indexingStatus == ProgressStatus.IN_PROGRESS;

  const progressSteps: ProgressStep[] = [
    {
      name: "Storing",
      description: "The metadata is being saved in a safe place.",
      status: IPFSCurrentStatus,
    },
    {
      name: "Updating",
      description: `Connecting to the ${chain.name} blockchain.`,
      status: contractUpdatingStatus,
    },
    {
      name: "Indexing",
      description: "The subgraph is indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  useEffect(() => {
    if (
      IPFSCurrentStatus === ProgressStatus.IS_ERROR ||
      contractUpdatingStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenErrorModal(true);
        setOpenProgressModal(false);
      }, errorModalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_SUCCESS) {
      window.location.reload();
    }
  }, [IPFSCurrentStatus, contractUpdatingStatus, indexingStatus]);

  useEffect(() => {
    if (!isLoading || !bulkSelectApproved) {
      setSelected(
        approvedApplications.map((application) => {
          return {
            id: application.id,
            round: application.round,
            recipient: application.recipient,
            projectsMetaPtr: application.projectsMetaPtr,
            status: application.status,
            createdAt: application.createdAt,
          };
        })
      );
    }
  }, [applications, isLoading, bulkSelectApproved]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDone = () => {
    window.location.reload();
  };

  const toggleRejection = (id: string) => {
    const newState = selected?.map((grantApp: GrantApplication) => {
      if (grantApp.id === id) {
        const newStatus: ProjectStatus =
          grantApp.status === "REJECTED" ? "APPROVED" : "REJECTED";
        return { ...grantApp, status: newStatus };
      }

      return grantApp;
    });

    setSelected(newState);
  };

  const checkSelectionStatus = (id: string) => {
    return selected?.find((grantApp: GrantApplication) => grantApp.id === id)
      ?.status;
  };

  const handleBulkReview = async () => {
    try {
      setOpenProgressModal(true);
      setOpenConfirmationModal(false);
      await bulkUpdateGrantApplications({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        roundId: id!,
        applications: selected.filter(
          (application) => application.status === "REJECTED"
        ),
      });
      setBulkSelectApproved(false);
      setOpenProgressModal(false);
    } catch (error) {
      datadogLogs.logger.error(`error: handleBulkReview - ${error}, id: ${id}`);
      console.error("handleBulkReview", error);
    }
  };

  return (
    <>
      {approvedApplications && approvedApplications.length > 0 && (
        <div className="flex items-center justify-end mb-4">
          <span className="text-grey-400 text-sm mr-6">
            Save in gas fees by approving/rejecting multiple applications at
            once.
          </span>
          {bulkSelectApproved ? (
            <Cancel onClick={() => setBulkSelectApproved(false)} />
          ) : (
            <Select onClick={() => setBulkSelectApproved(true)} />
          )}
        </div>
      )}
      <CardsContainer>
        {!isLoading &&
          approvedApplications?.map((application, index) => (
            <BasicCard
              key={index}
              className="application-card"
              data-testid="application-card"
            >
              <CardHeader>
                <ApplicationHeader
                  bulkSelect={bulkSelectApproved}
                  applicationStatus={checkSelectionStatus(application.id)}
                  rejectOnClick={() => toggleRejection(application.id)}
                  application={application}
                />
              </CardHeader>
              <Link to={`/round/${id}/application/${application.id}`}>
                <CardContent>
                  <CardTitle>{application.project?.title}</CardTitle>
                  <CardDescription>
                    {application.project?.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </BasicCard>
          ))}
        {isLoading && (
          <Spinner text="We're fetching your Grant Applications." />
        )}
      </CardsContainer>
      {selected &&
        selected?.filter((obj) => obj.status === "REJECTED").length > 0 && (
          <Continue
            grantApplications={selected}
            status="REJECTED"
            onClick={() => setOpenConfirmationModal(true)}
          />
        )}
      <ConfirmationModal
        title={"Confirm Decision"}
        confirmButtonText={isBulkUpdateLoading ? "Confirming..." : "Confirm"}
        confirmButtonAction={handleBulkReview}
        body={
          <>
            <p className="text-sm text-grey-400">
              {"You have selected multiple Grant Applications to be rejected."}
            </p>
            <div className="flex my-8 gap-16 justify-center items-center text-center">
              <RejectedApplicationsCount grantApplications={selected} />
            </div>
            <AdditionalGasFeesNote />
          </>
        }
        isOpen={openConfirmationModal}
        setIsOpen={setOpenConfirmationModal}
      />
      <ProgressModal
        isOpen={openProgressModal}
        subheading={"Please hold while we update the grant applications."}
        steps={progressSteps}
      />
      <ErrorModal
        isOpen={openErrorModal}
        setIsOpen={setOpenErrorModal}
        tryAgainFn={handleBulkReview}
        doneFn={handleDone}
      />
    </>
  );
}
