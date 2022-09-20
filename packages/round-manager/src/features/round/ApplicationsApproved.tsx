import { Link, useParams } from "react-router-dom";

import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery,
} from "../api/services/grantApplication";
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
import { GrantApplication, ProjectStatus } from "../api/types";
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

export default function ApplicationsApproved() {
  const { id } = useParams();
  const { provider, signer } = useWallet();

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!,
    signerOrProvider: provider,
    status: "APPROVED",
  });
  const [bulkSelectApproved, setBulkSelectApproved] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<GrantApplication[]>([]);
  const [bulkUpdateGrantApplications, { isLoading: isBulkUpdateLoading }] =
    useBulkUpdateGrantApplicationsMutation();

  useEffect(() => {
    if (isSuccess || !bulkSelectApproved) {
      setSelected(
        (data || []).map((application) => {
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
  }, [data, isSuccess, bulkSelectApproved]);

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
      await bulkUpdateGrantApplications({
        roundId: id!,
        applications: selected.filter(
          (application) => application.status === "REJECTED"
        ),
        signer,
        provider,
      }).unwrap();
      setBulkSelectApproved(false);
      setOpenModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {data && data.length > 0 && (
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
        {isSuccess &&
          data?.map((application, index) => (
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
        selected?.filter((obj) => obj.status === "REJECTED").length > 0 && (
          <Continue
            grantApplications={selected}
            status="REJECTED"
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
              {"You have selected multiple Grant Applications to be rejected."}
            </p>
            <div className="flex my-8 gap-16 justify-center items-center text-center">
              <RejectedApplicationsCount grantApplications={selected} />
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
