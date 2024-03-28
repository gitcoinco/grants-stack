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
} from "../api/types";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  AdditionalGasFeesNote,
  ApplicationHeader,
  Cancel,
  Select,
} from "./BulkApplicationCommon";
import { datadogLogs } from "@datadog/browser-logs";
import { useBulkUpdateGrantApplications } from "../../context/application/BulkUpdateGrantApplicationContext";
import ProgressModal from "../common/ProgressModal";
import { errorModalDelayMs } from "../../constants";
import ErrorModal from "../common/ErrorModal";
import { getRoundStrategyType, renderToPlainText, useAllo } from "common";
import { useWallet } from "../common/Auth";
import { roundApplicationsToCSV } from "../api/exports";
import { CheckIcon } from "@heroicons/react/solid";
import { useApplicationsByRoundId } from "../common/useApplicationsByRoundId";
import { exportAndDownloadCSV } from "./ApplicationsToApproveReject";

// Move applications received in direct grants to In Review

export default function ApplicationsToReview() {
  const { id } = useParams();
  const { chain } = useWallet();

  if (id === undefined) {
    throw new Error("id is undefined");
  }

  const { data: applications, isLoading } = useApplicationsByRoundId(id);
  const allo = useAllo();
  const filteredApplications =
    applications?.filter(
      (a) => a.status === ApplicationStatus.PENDING.toString() && !a.inReview
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
      description: "Indexing the data.",
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
            inReview: application.inReview,
            applicationIndex: application.applicationIndex,
            createdAt: application.createdAt,
            distributionTransaction: application.distributionTransaction,
            anchorAddress: application.anchorAddress,
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

  const toggleSelection = (id: string) => {
    const newState = selected?.map((grantApp: GrantApplication) => {
      if (grantApp.id === id) {
        return { ...grantApp, inReview: !grantApp.inReview };
      }

      return grantApp;
    });

    setSelected(newState);
  };

  const checkSelectionStatus = (id: string): boolean => {
    const selectedApplication = selected?.find(
      (grantApp: GrantApplication) => grantApp.id === id
    );
    if (!selectedApplication) return false;
    return Boolean(selectedApplication.inReview);
  };

  const handleBulkReview = async () => {
    if (
      allo === null ||
      id === undefined ||
      applications === undefined ||
      applications[0].payoutStrategy?.strategyName === undefined ||
      applications[0].payoutStrategy?.id === undefined
    ) {
      return;
    }

    try {
      setOpenProgressModal(true);
      setOpenModal(false);

      await bulkUpdateGrantApplications({
        allo,
        roundId: id,
        applications: applications,
        roundStrategy: getRoundStrategyType(
          applications[0].payoutStrategy.strategyName
        ),
        roundStrategyAddress: applications[0].payoutStrategy.id,
        selectedApplications: selected.filter(
          (application) => application.inReview
        ),
      });
      setBulkSelect(false);
      setOpenProgressModal(false);
    } catch (error) {
      datadogLogs.logger.error(`error: handleBulkReview - ${error}, id: ${id}`);
      console.error("handleBulkReview", error);
    }
  };

  async function handleExportCsvClick(roundId: string, chainId: number) {
    if (
      applications === undefined ||
      applications[0].payoutStrategy?.id === undefined
    ) {
      return;
    }
    try {
      setIsCsvExportLoading(true);
      await exportAndDownloadCSV(
        roundId,
        chainId,
        roundId.startsWith("0x") ? roundId : applications[0].payoutStrategy.id
      );
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
            onClick={() => handleExportCsvClick(utils.getAddress(id), chain.id)}
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
        {filteredApplications && filteredApplications.length > 0 && (
          <div className="flex items-center justify-end ml-auto">
            <span className="text-grey-400 text-sm mr-6">
              Save in gas fees by moving multiple applications to "In Review"
              state at once.
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
                  inReviewOnClick={() => toggleSelection(application.id)}
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
        {!isLoading && filteredApplications?.length === 0 && (
          <NoApplicationsContent />
        )}
      </CardsContainer>
      {selected && selected?.filter((obj) => obj.inReview).length > 0 && (
        <>
          <div className="fixed w-full left-0 bottom-0 bg-white z-20">
            <hr />
            <div className="flex justify-end items-center py-5 pr-20">
              <NumberOfApplicationsSelectedMessage
                grantApplications={selected}
                predicate={(selected) => Boolean(selected.inReview)}
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
                  You have selected multiple Grant Applications to move them to
                  "In Review" state.
                </p>
                <div className="flex my-8 gap-16 justify-center items-center text-center">
                  <div
                    className="grid gap-2"
                    data-testid="approved-applications-count"
                  >
                    <i className="flex justify-center">
                      <CheckIcon
                        className="bg-teal-400 text-grey-500 rounded-full h-6 w-6 p-1"
                        aria-hidden="true"
                      />
                    </i>
                    <>
                      <span className="text-xs text-grey-400 font-semibold text-center mt-2">
                        In review
                      </span>
                      <span className="text-grey-500 font-semibold">
                        {selected?.filter((obj) => obj.inReview).length}
                      </span>
                    </>
                  </div>
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
    <span
      className="text-grey-400 text-sm mr-6"
      data-testid="move-in-review-selected-applications-message"
    >
      You have selected{" "}
      {props.grantApplications?.filter(props.predicate).length} Grant
      Applications
    </span>
  );
}
