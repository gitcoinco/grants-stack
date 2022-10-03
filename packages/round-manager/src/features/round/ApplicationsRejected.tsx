import { datadogLogs } from "@datadog/browser-logs";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApplicationByRoundId } from "../../context/application/ApplicationContext";

import { useBulkUpdateGrantApplicationsMutation } from "../api/services/grantApplication";
import {
  ApplicationStatus,
  GrantApplication,
  ProjectStatus,
} from "../api/types";
import { useWallet } from "../common/Auth";
import ConfirmationModal from "../common/ConfirmationModal";
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
  AdditionalGasFeesNote,
  ApplicationHeader,
  ApprovedApplicationsCount,
  Cancel,
  Continue,
  Select,
} from "./BulkApplicationCommon";

export default function ApplicationsRejected() {
  const { id } = useParams();
  const { provider, signer } = useWallet();

  const { applications, isLoading } = useApplicationByRoundId(id!);
  const rejectedApplications =
    applications?.filter(
      (a) => a.status == ApplicationStatus.REJECTED.toString()
    ) || [];

  const [bulkSelectRejected, setBulkSelectRejected] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<GrantApplication[]>([]);

  const [bulkUpdateGrantApplications, { isLoading: isBulkUpdateLoading }] =
    useBulkUpdateGrantApplicationsMutation();

  useEffect(() => {
    if (!isLoading || !bulkSelectRejected) {
      setSelected(
        rejectedApplications?.map((application) => {
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
  }, [applications, isLoading, bulkSelectRejected]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleApproval = (id: string) => {
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
      await bulkUpdateGrantApplications({
        roundId: id!,
        applications: selected.filter(
          (application) => application.status === "APPROVED"
        ),
        signer,
        provider,
      }).unwrap();
      setBulkSelectRejected(false);
      setOpenModal(false);
    } catch (error) {
      datadogLogs.logger.error(`error: handleBulkReview - ${error}, id: ${id}`);
      console.error(error);
    }
  };

  return (
    <>
      {rejectedApplications && rejectedApplications.length > 0 && (
        <div className="flex items-center justify-end mb-4">
          <span className="text-grey-400 text-sm mr-6">
            Save in gas fees by approving/rejecting multiple applications at
            once.
          </span>
          {bulkSelectRejected ? (
            <Cancel onClick={() => setBulkSelectRejected(false)} />
          ) : (
            <Select onClick={() => setBulkSelectRejected(true)} />
          )}
        </div>
      )}
      <CardsContainer>
        {!isLoading &&
          rejectedApplications?.map((application, index) => (
            <BasicCard
              key={index}
              className="application-card"
              data-testid="application-card"
            >
              <CardHeader>
                <ApplicationHeader
                  bulkSelect={bulkSelectRejected}
                  applicationStatus={checkSelectionStatus(application.id)}
                  approveOnClick={() => toggleApproval(application.id)}
                  application={application}
                />
              </CardHeader>
              <Link
                key={index}
                to={`/round/${id}/application/${application.id}`}
              >
                <CardContent>
                  <CardTitle>{application.project!.title}</CardTitle>
                  <CardDescription>
                    {application.project!.description}
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
        selected?.filter((obj) => obj.status === "APPROVED").length > 0 && (
          <Continue
            grantApplications={selected}
            status="APPROVED"
            onClick={() => setOpenModal(true)}
          />
        )}
      <ConfirmationModal
        title={"Confirm Decision"}
        confirmButtonText={isBulkUpdateLoading ? "Confirming..." : "Confirm"}
        confirmButtonAction={handleBulkReview}
        body={
          <>
            <p className="text-sm text-grey-400">
              {"You have selected multiple Grant Applications to be approved."}
            </p>
            <div className="flex my-8 gap-16 justify-center items-center text-center">
              <ApprovedApplicationsCount grantApplications={selected} />
            </div>
            <AdditionalGasFeesNote />
          </>
        }
        isOpen={openModal}
        setIsOpen={setOpenModal}
      />
    </>
  );
}
