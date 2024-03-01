import { GrantApplication, ProjectStatus } from "../api/types";
import { Button } from "common/src/styles";
import { CheckIcon, XIcon } from "@heroicons/react/solid";
import DefaultBannerImage from "../../assets/default_banner.png";
import DefaultLogoImage from "../../assets/default_logo.png";

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

export function ApplicationLogo(props: {
  application: GrantApplication;
  classNameOverride?: string;
}) {
  const applicationLogoImage = props.application.project?.logoImg
    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.application.project.logoImg}`
    : DefaultLogoImage;

  return (
    <div className="pl-4">
      <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
        <div className="flex">
          <img
            className={
              props.classNameOverride ??
              "h-12 w-12 rounded-full ring-4 ring-white bg-white"
            }
            src={applicationLogoImage}
            alt="Application Logo"
          />
        </div>
      </div>
    </div>
  );
}

export function ApplicationBanner(props: {
  application: GrantApplication;
  classNameOverride?: string;
}) {
  const applicationBannerImage = props.application.project?.bannerImg
    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.application.project.bannerImg}`
    : DefaultBannerImage;

  return (
    <div>
      <img
        className={
          props.classNameOverride ?? "h-[120px] w-full object-cover rounded-t"
        }
        src={applicationBannerImage}
        alt="Application Banner"
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
  applicationStatus?: ProjectStatus;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      $variant="solid"
      className={`border border-grey-400 w-10 h-10 p-2.5 px-3.5 py-2 ${
        props.applicationStatus === "REJECTED"
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
  applicationStatus?: ProjectStatus;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      $variant="solid"
      className={`border border-grey-400 w-10 h-10 p-2.5 px-3.5 py-2 ${
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

function MarkForInReview(props: {
  applicationStatus?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      $variant="solid"
      className={`border border-grey-400 w-10 h-10 p-2.5 px-3.5 py-2 ${
        props.applicationStatus === true
          ? "bg-teal-400 text-grey-500"
          : "bg-grey-500 text-white"
      }`}
      onClick={props.onClick}
      data-testid="in-review-button"
    >
      <CheckIcon aria-hidden="true" />
    </Button>
  );
}

export function ApplicationHeader(props: {
  bulkSelect: boolean | undefined;
  applicationStatus?: ProjectStatus | boolean;
  inReviewOnClick?: () => void;
  approveOnClick?: () => void;
  rejectOnClick?: () => void;
  application: GrantApplication;
}) {
  return (
    <div className="relative">
      {props.bulkSelect && (
        <div
          className="absolute right-4 top-4 gap-2 flex"
          data-testid="bulk-approve-reject-buttons"
        >
          {props.inReviewOnClick && (
            <MarkForInReview
              data-testid="in-review-button"
              applicationStatus={props.applicationStatus as boolean}
              onClick={props.inReviewOnClick}
            />
          )}
          {props.approveOnClick && (
            <MarkForApproval
              data-testid="approve-button"
              applicationStatus={props.applicationStatus as ProjectStatus}
              onClick={props.approveOnClick}
            />
          )}
          {props.rejectOnClick && (
            <MarkForRejection
              data-testid="reject-button"
              applicationStatus={props.applicationStatus as ProjectStatus}
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
      className="text-xs text-pink-500 px-3.5 py-2"
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
      className="text-xs bg-grey-150 border-none px-3.5 py-2"
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
    <div className="fixed w-full left-0 bottom-0 bg-white z-20">
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
          className="text-sm px-3.5 py-2"
          onClick={props.onClick}
          data-testid="continue-button"
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
