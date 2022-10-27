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
  ApprovedApplicationsCount,
  RejectedApplicationsCount,
  Select,
  NoApplicationsContent,
} from "./BulkApplicationCommon";
import { datadogLogs } from "@datadog/browser-logs";
import { useBulkUpdateGrantApplications } from "../../context/application/BulkUpdateGrantApplicationContext";
import ProgressModal from "../common/ProgressModal";

export default function ApplicationsOverview({
  id,
  applications,
  isLoading,
  applicationStatus,
}: {
  id: string | undefined;
  applications: GrantApplication[] | undefined;
  isLoading: boolean;
  applicationStatus: ApplicationStatus;
}) {
  const { chain } = useWallet();

  const filteredApplications =
    applications?.filter(
      (a: GrantApplication) => a.status === applicationStatus.toString()
    ) || [];

  const [bulkSelect, setBulkSelect] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
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
    if (!isLoading || !bulkSelect) {
      setSelected(
        (filteredApplications || []).map((application) => {
          return {
            id: application.id,
            round: application.round,
            recipient: application.recipient,
            projectsMetaPtr: application.projectsMetaPtr,
            status: application.status,
          };
        })
      );
    }
  }, [applications, isLoading, bulkSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelection = (
    id: string,
    status1: ProjectStatus,
    status2: ProjectStatus
  ) => {
    const newState = selected?.map((grantApp: GrantApplication) => {
      if (grantApp.id === id) {
        const newStatus = grantApp.status === status1 ? status2 : status1;
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
        applications: updateFilter(applicationStatus.toString(), selected),
      });
      setBulkSelect(false);
      setOpenProgressModal(false);
      window.location.reload();
    } catch (error) {
      datadogLogs.logger.error(`error: handleBulkReview - ${error}, id: ${id}`);
      console.error(error);
    }
  };

  return (
    <>
      {filteredApplications && filteredApplications.length > 0 && (
        <div className="flex items-center justify-end mb-4">
          <span className="text-grey-400 text-sm mr-6">
            Save in gas fees by approving/rejecting multiple applications at
            once.
          </span>
          {bulkSelect ? (
            <Cancel onClick={() => setBulkSelect(false)} />
          ) : (
            <Select onClick={() => setBulkSelect(true)} />
          )}
        </div>
      )}
      <CardsContainer>
        {!isLoading &&
          filteredApplications?.map((application, index) => (
            <BasicCard
              key={index}
              className="application-card"
              data-testid="application-card"
            >
              <CardHeader>
                <ApplicationHeader
                  bulkSelect={bulkSelect}
                  applicationStatus={checkSelectionStatus(application.id)}
                  approveOnClick={
                    applicationStatus === "PENDING"
                      ? () =>
                          toggleSelection(application.id, "APPROVED", "PENDING")
                      : applicationStatus === "REJECTED"
                      ? () =>
                          toggleSelection(
                            application.id,
                            "REJECTED",
                            "APPROVED"
                          )
                      : undefined
                  }
                  rejectOnClick={
                    applicationStatus === "PENDING"
                      ? () =>
                          toggleSelection(application.id, "REJECTED", "PENDING")
                      : applicationStatus === "APPROVED"
                      ? () =>
                          toggleSelection(
                            application.id,
                            "APPROVED",
                            "REJECTED"
                          )
                      : undefined
                  }
                  application={application}
                />
              </CardHeader>
              <Link to={`/round/${id}/application/${application.id}`}>
                <CardContent>
                  <CardTitle>{application?.project?.title}</CardTitle>
                  <CardDescription>
                    {application?.project?.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </BasicCard>
          ))}
        {isLoading && (
          <Spinner text="We're fetching your Grant Applications." />
        )}
        {!isLoading && filteredApplications?.length === 0 && (
          <NoApplicationsContent />
        )}
      </CardsContainer>
      {selected &&
        updateFilter(applicationStatus.toString(), selected).length > 0 && (
          <Continue
            grantApplicationLength={
              updateFilter(applicationStatus.toString(), selected).length
            }
            onClick={() => setOpenConfirmationModal(true)}
          />
        )}

      <ConfirmationModal
        title={"Confirm Decision"}
        confirmButtonText={isBulkUpdateLoading ? "Confirming..." : "Confirm"}
        confirmButtonAction={handleBulkReview}
        cancelButtonAction={() => setOpenConfirmationModal(false)}
        body={
          <>
            <p className="text-sm text-grey-400">
              {applicationStatus.toString() == "REJECTED"
                ? "You have selected multiple Grant Applications to be approved."
                : applicationStatus.toString() == "APPROVED"
                ? "You have selected multiple Grant Applications to be rejected."
                : "You have selected multiple Grant Applications to approve and/or reject."}
            </p>
            <div className="flex my-8 gap-16 justify-center items-center text-center">
              {applicationStatus.toString() !== "APPROVED" && (
                <ApprovedApplicationsCount grantApplications={selected} />
              )}
              {applicationStatus.toString() === "PENDING" && (
                <span className="text-4xl font-thin">|</span>
              )}
              {applicationStatus.toString() !== "REJECTED" && (
                <RejectedApplicationsCount grantApplications={selected} />
              )}
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
    </>
  );
}

const updateFilter = (
  status: string,
  selection: GrantApplication[]
): GrantApplication[] => {
  if (status === "PENDING") {
    return selection?.filter((obj) => obj.status !== "PENDING");
  } else if (status === "APPROVED") {
    return selection?.filter((obj) => obj.status === "REJECTED");
  } else if (status === "REJECTED") {
    return selection?.filter((obj) => obj.status === "APPROVED");
  } else {
    return [];
  }
};
