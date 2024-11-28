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
import { Tab } from "@headlessui/react";
import { horizontalTabStyles } from "../common/Utils";
import { MdRateReview } from "react-icons/md";
import { TabApplicationCounter } from "../common/styles";
import { Link } from "react-router-dom";

function GrantApplications(props: {
  isDirectRound?: boolean;
  applications: GrantApplication[] | undefined;
  isRoundsFetched: boolean;
  fetchRoundStatus: ProgressStatus;
  chainId: string;
  roundId: string | undefined;
}) {
  // Filter applications into pending, approved, rejected & in-review
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
              <div className="w-[954px] h-[164px] p-6 bg-[#f6fcf0] rounded-2xl border border-[#eaeaea] flex-col justify-start items-start gap-6 inline-flex">
                <div className="self-stretch h-[60px] flex-col justify-start items-start gap-2 flex">
                  <div className="self-stretch text-black text-lg font-medium font-['Modern Era'] leading-relaxed">
                    Checker is now in Beta
                  </div>
                  <div className="self-stretch text-black text-base font-normal font-['Modern Era'] leading-relaxed">
                    Use our AI-powered application assistant to process
                    applicants with confidence
                  </div>
                </div>
                <div className="h-8 px-3 py-2 bg-[#00433b] rounded-lg border border-[#00433b] justify-center items-center gap-1.5 inline-flex">
                  <Link
                    to={`https://beta.checker.gitcoin.co/review/${props.chainId}/${props.roundId}`}
                    className="text-white text-sm font-medium font-['DM Mono'] leading-none"
                  >
                    Review Applications
                  </Link>
                </div>
              </div>
              <div className="my-4 flex justify-start items-center text-md font-normal font-momo">
                <MdRateReview className="h-4 w-4 mr-2 text-rose-300" />
                <span>Manual Review</span>
              </div>
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
                            <div className={selected ? "text-violet-500" : ""}>
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
