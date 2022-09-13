import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { InboxInIcon as NoApplicationsForRoundIcon } from "@heroicons/react/outline";
import {
  useBulkUpdateGrantApplicationsMutation,
  useListGrantApplicationsQuery,
} from "../api/services/grantApplication";
import { useWallet } from "../common/Auth";
import { Spinner } from "../common/Spinner";
import {
  BasicCard,
  Button,
  CardContent,
  CardDescription,
  CardHeader,
  CardsContainer,
  CardTitle,
} from "../common/styles";
import { GrantApplication, ProjectStatus } from "../api/types";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  AdditionalGasFeesNote,
  ApplicationHeader,
  ApprovedApplicationsCount,
  Cancel,
  RejectedApplicationsCount,
  Select,
} from "./BulkApplicationCommon";

export default function ApplicationsReceived() {
  const [openModal, setOpenModal] = useState(false);
  const [bulkSelect, setBulkSelect] = useState(false);
  const { id } = useParams();
  const { provider, signer } = useWallet();

  const { data, refetch, isLoading, isSuccess } = useListGrantApplicationsQuery(
    {
      /* Non-issue since if ID was null or undef., we wouldn't render this page, but a 404 instead  */
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      roundId: id!,
      signerOrProvider: provider,
      status: "PENDING",
    }
  );

  const [bulkUpdateGrantApplications, { isLoading: isBulkUpdateLoading }] =
    useBulkUpdateGrantApplicationsMutation();

  const [selected, setSelected] = useState<GrantApplication[]>([]);

  useEffect(() => {
    if (isSuccess || !bulkSelect) {
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
  }, [data, isSuccess, bulkSelect]);

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
      await bulkUpdateGrantApplications({
        roundId: id!,
        applications: selected.filter(
          (application) => application.status !== "PENDING"
        ),
        signer,
        provider,
      }).unwrap();
      setBulkSelect(false);
      setOpenModal(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {data && data.length > 0 && (
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
        {isSuccess &&
          data?.map((application, index) => (
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
                  <CardTitle>{application.project!.title}</CardTitle>
                  <CardDescription>
                    {application.project!.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </BasicCard>
          ))}
        {isLoading && <Spinner text="Fetching Grant Applications" />}
        {!isLoading && data?.length === 0 && (
          <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
            <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
              <NoApplicationsForRoundIcon className="w-6 h-6" />
            </div>
            <NoApplicationsMessage />
          </div>
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
  predicate: (obj: any) => boolean;
}) {
  return (
    <span className="text-grey-400 text-sm mr-6">
      You have selected{" "}
      {props.grantApplications?.filter(props.predicate).length} Grant
      Applications
    </span>
  );
}
