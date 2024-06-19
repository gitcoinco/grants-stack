import React from "react";
import { ApplicationStatus } from "../api/types";
import { ApplicationStatusViewProps } from "../common/types";
import { Link } from "react-router-dom";
import { ReactComponent as CheckerLogo } from "../../assets/checker-logo.svg";
// import ActionPanel from "../common/ActionPanel";

const ApplicationStatusView: React.FC<ApplicationStatusViewProps> = (props) => {
  // todo: test these
  const pendingApplications = (props.allApplications.pendingApplications || [])
    .filter((a) => a.status === ApplicationStatus.PENDING.toString())
    .filter((a) => (props.isDirectRound ? !a.status : true));
  const approvedApplications = (
    props.allApplications.approvedApplications || []
  )
    .filter((a) => a.status === ApplicationStatus.APPROVED.toString())
    .filter((a) => (props.isDirectRound ? !a.status : true));
  const rejectedApplications = (
    props.allApplications.rejectedApplications || []
  )
    .filter((a) => a.status === ApplicationStatus.REJECTED.toString())
    .filter((a) => (props.isDirectRound ? !a.status : true));
  const inReviewApplications = (
    props.allApplications.inReviewApplications || []
  )
    .filter((a) => a.status === ApplicationStatus.IN_REVIEW.toString())
    .filter((a) => (props.isDirectRound ? a.status : true));
  const allAppsCount =
    pendingApplications.length +
    approvedApplications.length +
    rejectedApplications.length +
    inReviewApplications.length;

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-3xl font-semibold">
              {pendingApplications?.length || 0}
            </p>
            <p className="text-gray-600 mt-4">Applications pending</p>
          </div>
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-3xl font-semibold">
              {approvedApplications?.length || 0}
            </p>
            <p className="text-gray-600 mt-4">Applications accepted</p>
          </div>
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-3xl font-semibold">
              {rejectedApplications?.length || 0}
            </p>
            <p className="text-gray-600 mt-4">Applications rejected</p>
          </div>
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-3xl font-semibold">{allAppsCount}</p>
            <p className="text-gray-600 mt-4">Total applications</p>
          </div>
        </div>
        {/* todo: add a check if any actions and display the action panel */}
        {/* <ActionPanel /> */}
        <div className="flex justify-center mt-20 border border-gray-100 p-4 rounded-2xl">
          <div className="flex flex-col justify-between items-center text-gray-500 font-normal">
            <span className="flex flex-row items-center font-normal mb-4">
              <span className="text-center px-4 md:px-8">
                Looking for a more powerful review experience? Leverage
                AI-enabled application screening and allow for multiple
                evaluations with
                <CheckerLogo className="inline h-6 w-6 mx-1" />
                Checker
              </span>
            </span>
            {/* todo: implement - need the checker URL for passing the right params */}
            <Link
              to={"https://checker.gitcoin.co"}
              rel="_blank"
              className="text-center text-xs bg-orange-100 px-1 p-2 rounded-md hover:shadow-md font-normal font-mono w-44"
            >
              Review applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatusView;
