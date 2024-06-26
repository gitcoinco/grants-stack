import React from "react";
import { ApplicationStatusViewProps } from "../common/types";
// import { Link } from "react-router-dom";
// import { ReactComponent as CheckerLogo } from "../../assets/checker-logo.svg";
// import ActionPanel from "../common/ActionPanel";

const ApplicationStatusView: React.FC<ApplicationStatusViewProps> = (props) => {
  const allAppsCount =
    props.allApplications.pendingApplications.length +
    props.allApplications.approvedApplications.length +
    props.allApplications.rejectedApplications.length;

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-6 text-grey-500 font-mono font-normal">
          <div className="bg-grey-50 p-6 text-center rounded-2xl">
            <p className="text-3xl">
              {props.allApplications.pendingApplications.length || 0}
            </p>
            <p className="mt-4">Applications pending</p>
          </div>
          <div className="bg-grey-50 p-6 text-center rounded-2xl">
            <p className="text-3xl">
              {props.allApplications.approvedApplications.length || 0}
            </p>
            <p className="mt-4">Applications accepted</p>
          </div>
          <div className="bg-grey-50 p-6 text-center rounded-2xl">
            <p className="text-3xl">
              {props.allApplications.rejectedApplications.length || 0}
            </p>
            <p className="mt-4">Applications rejected</p>
          </div>
          <div className="bg-grey-50 p-6 text-center rounded-2xl">
            <p className="text-3xl">{allAppsCount}</p>
            <p className="mt-4">Total applications</p>
          </div>
        </div>
        {/* todo: add a check if any actions and display the action panel */}
        {/* <ActionPanel /> */}
        {/* todo: implement - need the checker URL for passing the right params */}
        {/* <div className="flex justify-center mt-6 border border-grey-100 p-4 rounded-2xl">
          <div className="flex flex-col justify-between items-center text-grey-500 font-normal">
            <span className="flex flex-row items-center font-normal mb-4">
              <span className="text-center px-4 md:px-8">
                Looking for a more powerful review experience? Leverage
                AI-enabled application screening and allow for multiple
                evaluations with
                <CheckerLogo className="inline h-6 w-6 mx-1" />
                Checker
              </span>
            </span>
            <Link
              to={"https://checker.gitcoin.co"}
              rel="_blank"
              className="text-center text-xs bg-orange-100 px-1 p-2 rounded-md hover:shadow-md font-normal font-mono w-44"
            >
              Review applications
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ApplicationStatusView;
