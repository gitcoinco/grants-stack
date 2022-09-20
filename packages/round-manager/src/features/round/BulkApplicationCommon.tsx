import { GrantApplication, ProjectStatus } from "../api/types";
import { Button } from "../common/styles";
import { CheckIcon, XIcon } from "@heroicons/react/solid";

export function NumberOfStatus(props: {
  grantApplications: GrantApplication[];
  status: ProjectStatus;
}) {
  return (
    <>
      <span className="text-xs text-grey-400 font-semibold text-center mt-2">
        {props.status}
      </span>
      <span className="text-grey-500 font-semibold">
        {
          props.grantApplications?.filter(
            (application) => application.status === props.status
          ).length
        }
      </span>
    </>
  );
}

export function ApplicationLogo(props: { application: any }) {
  return (
    <div className="pl-4">
      <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
        <div className="flex">
          <img
            className="h-12 w-12 rounded-full ring-4 ring-white bg-white"
            src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${
              props.application.project!.logoImg
            }`}
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

export function ApplicationBanner(props: { application: any }) {
  return (
    <div>
      <img
        className="h-[120px] w-full object-cover rounded-t"
        src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${
          props.application.project!.bannerImg
        }`}
        alt=""
      />
    </div>
  );
}

export function AdditionalGasFeesNote() {
  return (
    <p className="text-sm italic text-grey-400 mb-2">
      Changes could be subject to additional gas fees.
    </p>
  );
}

function MarkForRejection(props: {
  checkSelection:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "APPEAL"
    | "FRAUD"
    | undefined;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      $variant="solid"
      className={`border border-grey-400 w-9 h-8 p-2.5 ${
        props.checkSelection === "REJECTED"
          ? "bg-white text-pink-500"
          : "bg-grey-500 text-white"
      }`}
      onClick={props.onClick}
      data-testid="reject-button"
    >
      <XIcon aria-hidden="true" />
    </Button>
  );
}

function MarkForApproval(props: {
  applicationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "APPEAL" | "FRAUD";
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      $variant="solid"
      className={`border border-grey-400 w-9 h-8 p-2.5 ${
        props.applicationStatus === "APPROVED"
          ? "bg-teal-400 text-grey-500"
          : "bg-grey-500 text-white"
      }`}
      onClick={props.onClick}
      data-testid="approve-button"
    >
      <CheckIcon aria-hidden="true" />
    </Button>
  );
}

export function ApplicationHeader(props: {
  bulkSelect: boolean | undefined;
  applicationStatus:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "APPEAL"
    | "FRAUD"
    | undefined;
  approveOnClick?: () => void;
  rejectOnClick?: () => void;
  application: any;
}) {
  return (
    <div className="relative">
      {props.bulkSelect && (
        <div
          className="absolute right-4 top-4 gap-2 flex"
          data-testid="bulk-approve-reject-buttons"
        >
          {props.approveOnClick && (
            <MarkForApproval
              applicationStatus={props.applicationStatus}
              onClick={props.approveOnClick}
            />
          )}
          {props.rejectOnClick && (
            <MarkForRejection
              checkSelection={props.applicationStatus}
              onClick={props.rejectOnClick}
            />
          )}
        </div>
      )}
      <div>
        <ApplicationBanner application={props.application} />
        <ApplicationLogo application={props.application} />
      </div>
    </div>
  );
}

export function Cancel(props: { onClick: () => void }) {
  return (
    <Button
      type="button"
      $variant="outline"
      className="text-xs text-pink-500"
      onClick={props.onClick}
    >
      Cancel
    </Button>
  );
}

export function Select(props: { onClick: () => void }) {
  return (
    <Button
      type="button"
      $variant="outline"
      className="text-xs bg-grey-150 border-none"
      onClick={props.onClick}
      data-testid="select"
    >
      Select
    </Button>
  );
}

export function Continue(props: {
  grantApplications: GrantApplication[];
  status: ProjectStatus;
  onClick: () => void;
}) {
  return (
    <div className="fixed w-full left-0 bottom-0 bg-white">
      <hr />
      <div className="flex justify-end items-center py-5 pr-20">
        <span className="text-grey-400 text-sm mr-6">
          You have selected{" "}
          {
            props.grantApplications?.filter(
              (application) => application.status === props.status
            ).length
          }{" "}
          Grant Applications
        </span>
        <Button
          type="button"
          $variant="solid"
          className="text-sm px-5"
          onClick={props.onClick}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export function RejectedApplicationsCount(props: {
  grantApplications: GrantApplication[];
}) {
  return (
    <div className="grid gap-2" data-testid="rejected-applications-count">
      <i className="flex justify-center">
        <XIcon
          className="bg-pink-500 text-white rounded-full h-6 w-6 p-1"
          aria-hidden="true"
        />
      </i>
      <NumberOfStatus
        grantApplications={props.grantApplications}
        status={"REJECTED"}
      />
    </div>
  );
}

export function ApprovedApplicationsCount(props: {
  grantApplications: GrantApplication[];
}) {
  return (
    <div className="grid gap-2" data-testid="approved-applications-count">
      <i className="flex justify-center">
        <CheckIcon
          className="bg-teal-400 text-grey-500 rounded-full h-6 w-6 p-1"
          aria-hidden="true"
        />
      </i>
      <NumberOfStatus
        grantApplications={props.grantApplications}
        status={"APPROVED"}
      />
    </div>
  );
}
