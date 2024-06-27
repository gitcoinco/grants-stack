import React from "react";
import { ApplicationStatusViewProps } from "../common/types";

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
      </div>
    </div>
  );
};

export default ApplicationStatusView;
