import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { utils } from "ethers";
import {
  InboxInIcon as NoApplicationsForRoundIcon,
  DownloadIcon,
} from "@heroicons/react/outline";
import { Spinner, LoadingRing } from "../common/Spinner";
import {
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardsContainer,
  CardTitle,
} from "../common/styles";
import { Button } from "common/src/styles";
import {
  ApplicationStatus,
  GrantApplication,
  ProgressStatus,
  ProgressStep,
  ProjectStatus,
} from "../api/types";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  AdditionalGasFeesNote,
  ApplicationHeader,
  ApprovedApplicationsCount,
  Cancel,
  RejectedApplicationsCount,
  Select,
} from "./BulkApplicationCommon";
import { useApplicationByRoundId } from "../../context/application/ApplicationContext";
import { datadogLogs } from "@datadog/browser-logs";
import { useBulkUpdateGrantApplications } from "../../context/application/BulkUpdateGrantApplicationContext";
import ProgressModal from "../common/ProgressModal";
import { errorModalDelayMs } from "../../constants";
import ErrorModal from "../common/ErrorModal";
import { renderToPlainText } from "common";
import { useWallet } from "../common/Auth";
import { roundApplicationsToCSV } from "../api/exports";

async function exportAndDownloadCSV(
  roundId: string,
  chainId: number,
  chainName: string
) {
  const csv = await roundApplicationsToCSV(roundId, chainId, chainName);

  // create a download link and click it
  const outputBlob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");

  try {
    const dataUrl = URL.createObjectURL(outputBlob);
    link.setAttribute("href", dataUrl);
    link.setAttribute("download", `applications-${roundId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
  } finally {
    document.body.removeChild(link);
  }
}

export default function ApplicationsReceived() {
  const { id } = useParams();
  const { chain } = useWallet();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { applications, isLoading } = useApplicationByRoundId(id!);
  const pendingApplications =
    applications?.filter(
      (a) => a.status == ApplicationStatus.PENDING.toString()
    ) || [];

  const [bulkSelect, setBulkSelect] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [selected, setSelected] = useState<GrantApplication[]>([]);
  const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);

  const {
    bulkUpdateGrantApplications,
    contractUpdatingStatus,
    indexingStatus,
  } = useBulkUpdateGrantApplications();
  const isBulkUpdateLoading =
    contractUpdatingStatus == ProgressStatus.IN_PROGRESS ||
    indexingStatus == ProgressStatus.IN_PROGRESS;

  const progressSteps: ProgressStep[] = [
    {
      name: "Updating",
      description: `Updating application statuses on the contract.`,
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
        (pendingApplications || []).map((application) => {
          return {
            id: application.id,
            round: application.round,
            recipient: application.recipient,
            projectsMetaPtr: application.projectsMetaPtr,
            status: application.status,
            applicationIndex: application.applicationIndex,
            createdAt: application.createdAt,
          };
        })
      );
    }
  }, [applications, isLoading, bulkSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (contractUpdatingStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        setOpenErrorModal(true);
        setOpenProgressModal(false);
      }, errorModalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_SUCCESS) {
      window.location.reload();
    }
  }, [contractUpdatingStatus, indexingStatus]);

  const handleDone = () => {
    window.location.reload();
  };

  const toggleSelection = (id: string, status: ProjectStatus) => {
    const newState = selected?.map((grantApp: GrantApplication) => {
      if (grantApp.id === id) {
        const newStatus = grantApp.status === status ? "PENDING" : status;
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
      setOpenModal(false);
      await bulkUpdateGrantApplications({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        roundId: id!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        applications: applications!,
        selectedApplications: selected.filter(
          (application) => application.status !== "PENDING"
        ),
      });
      setBulkSelect(false);
      setOpenProgressModal(false);
    } catch (error) {
      datadogLogs.logger.error(`error: handleBulkReview - ${error}, id: ${id}`);
      console.error("handleBulkReview", error);
    }
  };

  async function handleExportCsvClick(
    roundId: string,
    chainId: number,
    chainName: string
  ) {
    try {
      setIsCsvExportLoading(true);
      await exportAndDownloadCSV(roundId, chainId, chainName);
    } catch (e) {
      datadogLogs.logger.error(
        `error: exportApplicationCsv - ${e}, id: ${roundId}`
      );
      console.error("exportApplicationCsv", e);
    } finally {
      setIsCsvExportLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        {id && applications && applications.length > 0 && (
          <Button
            type="button"
            $variant="outline"
            className="text-xs px-3 py-1 inline-block"
            disabled={isCsvExportLoading}
            onClick={() =>
              handleExportCsvClick(utils.getAddress(id), chain.id, chain.name)
            }
          >
            {isCsvExportLoading ? (
              <>
                <LoadingRing className="animate-spin w-3 h-3 inline-block mr-2 -mt-0.5" />
                <span className="text-grey-400">Exporting...</span>
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4 inline -mt-0.5 mr-1" />
                <span>CSV</span>
              </>
            )}
          </Button>
        )}
        {pendingApplications && pendingApplications.length > 0 && (
          <div className="flex items-center justify-end ml-auto">
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
      </div>
      <CardsContainer>
        {!isLoading &&
          pendingApplications?.map((application, index) => (
            <BasicCard
              key={index}
              className="application-card"
              data-testid="application-card"
            >
              <CardHeader>
                <ApplicationHeader
                  bulkSelect={bulkSelect}
                  applicationStatus={checkSelectionStatus(application.id)}
                  approveOnClick={() =>
                    toggleSelection(application.id, "APPROVED")
                  }
                  rejectOnClick={() =>
                    toggleSelection(application.id, "REJECTED")
                  }
                  application={application}
                />
              </CardHeader>
              <Link to={`/round/${id}/application/${application.id}`}>
                <CardContent>
                  <CardTitle>{application?.project?.title}</CardTitle>
                  <CardDescription>
                    {renderToPlainText(application?.project?.description ?? "")}
                  </CardDescription>
                </CardContent>
              </Link>
            </BasicCard>
          ))}
        {isLoading && (
          <Spinner text="We're fetching your Grant Applications." />
        )}
        {!isLoading && pendingApplications?.length === 0 && (
          <NoApplicationsContent />
        )}
      </CardsContainer>
      {selected &&
        selected?.filter((obj) => obj.status !== "PENDING").length > 0 && (
          <>
            <div className="fixed w-full left-0 bottom-0 bg-white">
              <hr />
              <div className="flex justify-end items-center py-5 pr-20">
                <NumberOfApplicationsSelectedMessage
                  grantApplications={selected}
                  predicate={(selected) => selected.status !== "PENDING"}
                />
                <Continue onClick={() => setOpenModal(true)} />
              </div>
            </div>
            <ConfirmationModal
              title={"Confirm Decision"}
              confirmButtonText={
                isBulkUpdateLoading ? "Confirming..." : "Confirm"
              }
              body={
                <>
                  <p className="text-sm text-grey-400">
                    {
                      "You have selected multiple Grant Applications to approve and/or reject."
                    }
                  </p>
                  <div className="flex my-8 gap-16 justify-center items-center text-center">
                    <ApprovedApplicationsCount grantApplications={selected} />
                    <span className="text-4xl font-thin">|</span>
                    <RejectedApplicationsCount grantApplications={selected} />
                  </div>
                  <AdditionalGasFeesNote />
                </>
              }
              confirmButtonAction={handleBulkReview}
              cancelButtonAction={() => setOpenModal(false)}
              isOpen={openModal}
              setIsOpen={setOpenModal}
            />
          </>
        )}
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
    </div>
  );
}

function NoApplicationsMessage() {
  return (
    <>
      <h2 className="mt-8 text-2xl antialiased">No Applications</h2>
      <div className="mt-2 text-sm">
        Applications have not been submitted yet.
      </div>
      <div className="text-sm">
        Try promoting your Grant Program to get more traction!
      </div>
    </>
  );
}

function NoApplicationsContent() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <NoApplicationsForRoundIcon className="w-6 h-6" />
      </div>
      <NoApplicationsMessage />
    </div>
  );
}

function Continue(props: { onClick: () => void }) {
  return (
    <Button
      type="button"
      $variant="solid"
      className="text-sm px-5"
      onClick={props.onClick}
    >
      Continue
    </Button>
  );
}

function NumberOfApplicationsSelectedMessage(props: {
  grantApplications: GrantApplication[];
  predicate: (obj: GrantApplication) => boolean;
}) {
  return (
    <span className="text-grey-400 text-sm mr-6">
      You have selected{" "}
      {props.grantApplications?.filter(props.predicate).length} Grant
      Applications
    </span>
  );
}
