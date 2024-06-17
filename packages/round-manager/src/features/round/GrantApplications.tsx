import {
  ApplicationStatus,
  GrantApplication,
  ProgressStatus,
} from "../api/types";
import { Spinner } from "../common/Spinner";
import ApplicationsApproved from "./ApplicationsApproved";
import ApplicationsRejected from "./ApplicationsRejected";
import ApplicationsToApproveReject from "./ApplicationsToApproveReject";
import ApplicationsToReview from "./ApplicationsToReview";
import ApplicationStatusView from "./ApplicationStatusView";
import tw from "tailwind-styled-components";
import { Tab } from "@headlessui/react";
import { horizontalTabStyles } from "../common/Utils";
import { FaTools } from "react-icons/fa";

function GrantApplications(props: {
  isDirectRound?: boolean;
  applications: GrantApplication[] | undefined;
  isRoundsFetched: boolean;
  fetchRoundStatus: ProgressStatus;
  chainId: string;
  roundId: string | undefined;
}) {
  const pendingApplications = (props.applications || [])
    .filter((a) => a.status === ApplicationStatus.PENDING.toString())
    .filter((a) => (props.isDirectRound ? !a.inReview : true));

  const approvedApplications = (props.applications || []).filter(
    (a) => a.status === ApplicationStatus.APPROVED.toString()
  );
  const rejectedApplications = (props.applications || []).filter(
    (a) => a.status === ApplicationStatus.REJECTED.toString()
  );
  const inReviewApplications = (props.applications || []).filter((a) =>
    props.isDirectRound ? a.inReview : true
  );

  const allApplications = {
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    inReviewApplications,
  };

  const TabApplicationCounter = tw.div`
      rounded-lg
      ml-2
      w-8
      h-5
      float-right
      font-sm
      font-normal
    `;

  return (
    <div>
      {props.isRoundsFetched && (
        <div>
          <div>
            {/* Checker & Stats */}
            <ApplicationStatusView
              allApplications={allApplications}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              isDirectRound={props.isDirectRound!}
            />
            <div className="py-5 mb-8">
              <details className="group">
                <summary className="flex justify-end items-center text-md font-normal font-momo cursor-pointer list-none">
                  <FaTools className="h-4 w-4 mr-2" />
                  <span>Manual Review</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shape-rendering="geometricPrecision"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                {/* Manual */}
                <Tab.Group>
                  <div className="justify-end grow relative">
                    <Tab.List className="border-b mb-6 flex items-center justify-between">
                      <div className="space-x-8">
                        <Tab
                          className={({ selected }) =>
                            horizontalTabStyles(selected)
                          }
                        >
                          {({ selected }) => (
                            <div className={selected ? "text-violet-500" : ""}>
                              Received
                              <TabApplicationCounter
                                className={
                                  selected ? "bg-violet-100" : "bg-grey-150"
                                }
                                data-testid="received-application-counter"
                              >
                                {pendingApplications?.length || 0}
                              </TabApplicationCounter>
                            </div>
                          )}
                        </Tab>
                        {props.isDirectRound && (
                          <Tab
                            className={({ selected }) =>
                              horizontalTabStyles(selected)
                            }
                          >
                            {({ selected }) => (
                              <div
                                className={selected ? "text-violet-500" : ""}
                              >
                                In Review
                                <TabApplicationCounter
                                  className={
                                    selected ? "bg-violet-100" : "bg-grey-150"
                                  }
                                  data-testid="in-review-application-counter"
                                >
                                  {inReviewApplications?.length || 0}
                                </TabApplicationCounter>
                              </div>
                            )}
                          </Tab>
                        )}
                        <Tab
                          className={({ selected }) =>
                            horizontalTabStyles(selected)
                          }
                        >
                          {({ selected }) => (
                            <div className={selected ? "text-violet-500" : ""}>
                              Approved
                              <TabApplicationCounter
                                className={
                                  selected ? "bg-violet-100" : "bg-grey-150"
                                }
                                data-testid="approved-application-counter"
                              >
                                {approvedApplications?.length || 0}
                              </TabApplicationCounter>
                            </div>
                          )}
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            horizontalTabStyles(selected)
                          }
                        >
                          {({ selected }) => (
                            <div className={selected ? "text-violet-500" : ""}>
                              Rejected
                              <TabApplicationCounter
                                className={
                                  selected ? "bg-violet-100" : "bg-grey-150"
                                }
                                data-testid="rejected-application-counter"
                              >
                                {rejectedApplications?.length || 0}
                              </TabApplicationCounter>
                            </div>
                          )}
                        </Tab>
                      </div>
                    </Tab.List>
                  </div>
                  <Tab.Panels>
                    <Tab.Panel>
                      {props.isDirectRound ? (
                        <ApplicationsToReview />
                      ) : (
                        <ApplicationsToApproveReject
                          isDirectRound={Boolean(props.isDirectRound)}
                        />
                      )}
                    </Tab.Panel>
                    {props.isDirectRound && (
                      <Tab.Panel>
                        <ApplicationsToApproveReject
                          isDirectRound={Boolean(props.isDirectRound)}
                        />
                      </Tab.Panel>
                    )}
                    <Tab.Panel>
                      <ApplicationsApproved />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ApplicationsRejected />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </details>
            </div>
          </div>
        </div>
      )}
      {props.fetchRoundStatus == ProgressStatus.IN_PROGRESS && (
        <Spinner text="We're fetching your Round." />
      )}
    </div>
  );
}

export default GrantApplications;
