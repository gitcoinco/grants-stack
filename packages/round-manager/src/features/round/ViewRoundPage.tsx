import { datadogLogs } from "@datadog/browser-logs";
import { Tab } from "@headlessui/react";
import {
  AdjustmentsIcon,
  ArrowCircleRightIcon,
  CalendarIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentReportIcon,
  DocumentTextIcon,
  InboxIcon,
  UserGroupIcon,
} from "@heroicons/react/solid";
import { Button } from "common/src/styles";
import { Link, useParams } from "react-router-dom";
import tw from "tailwind-styled-components";
import { ReactComponent as GrantExplorerLogo } from "../../assets/grantexplorer-icon.svg";
import { useApplicationByRoundId } from "../../context/application/ApplicationContext";
import { useRoundById } from "../../context/round/RoundContext";
import { useDebugMode } from "../../hooks";
import {
  ApplicationStatus,
  GrantApplication,
  ProgressStatus,
  Round,
} from "../api/types";
import AccessDenied from "../common/AccessDenied";
import { useWallet } from "../common/Auth";
import CopyToClipboardButton from "../common/CopyToClipboardButton";
import Footer from "common/src/components/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { Spinner } from "../common/Spinner";
import {
  ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE,
  getPayoutRoundDescription,
  horizontalTabStyles,
  verticalTabStyles,
} from "../common/Utils";
import ApplicationsApproved from "./ApplicationsApproved";
import ApplicationsByStatus from "./ApplicationsByStatus";
import ApplicationsRejected from "./ApplicationsRejected";
import FundContract from "./FundContract";
import ReclaimFunds from "./ReclaimFunds";
import ViewFundGrantees from "./ViewFundGrantees";
import ViewRoundResults from "./ViewRoundResults/ViewRoundResults";
import ViewRoundSettings from "./ViewRoundSettings";
import ViewRoundStats from "./ViewRoundStats";
import { RoundDates, parseRoundDates } from "../common/parseRoundDates";
import moment from "moment";

export default function ViewRoundPage() {
  datadogLogs.logger.info("====> Route: /round/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { id } = useParams() as { id: string };
  const { address, chain } = useWallet();

  const { round, fetchRoundStatus, error } = useRoundById(id.toLowerCase());
  const isRoundFetched =
    fetchRoundStatus == ProgressStatus.IS_SUCCESS && !error;

  const { applications } = useApplicationByRoundId(id);

  const debugModeEnabled = useDebugMode();
  const hasAccess =
    debugModeEnabled ||
    (round
      ? round?.operatorWallets?.includes(address.toLowerCase() ?? "")
      : true);

  const roundNotFound = fetchRoundStatus === ProgressStatus.IS_ERROR;

  return (
    <>
      {roundNotFound && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
      {round && hasAccess && (
        <>
          <Navbar />
          <div className="flex flex-col w-screen mx-0">
            <header className="border-b bg-grey-150 px-3 md:px-20 py-6">
              <div className="text-grey-400 font-semibold text-sm flex flex-row items-center gap-3">
                <Link to={`/`}>
                  <span>{"My Programs"}</span>
                </Link>
                <ChevronRightIcon className="h-6 w-6" />
                <Link to={`/program/${round?.ownedBy}`}>
                  <span>{"Program Details"}</span>
                </Link>
                <ChevronRightIcon className="h-6 w-6" />
                <Link to={`/round/${id}`}>
                  <span>{"Round Details"}</span>
                </Link>
                <RoundBadgeStatus round={round} />
              </div>
              {/* Round type */}
              {getPayoutRoundDescription(
                round.payoutStrategy.strategyName || ""
              ) && (
                <div
                  className={`text-sm text-gray-900 h-[20px] inline-flex flex-col justify-center bg-grey-100 px-3 mt-4`}
                  style={{ borderRadius: "20px" }}
                >
                  {getPayoutRoundDescription(
                    round.payoutStrategy.strategyName || ""
                  )}
                </div>
              )}
              <div className="flex flex-row mb-1 items-center">
                <RoundName round={round} />
              </div>
              <div className="flex flex-row flex-wrap relative">
                {round.payoutStrategy.strategyName != ROUND_PAYOUT_DIRECT && (
                  <ApplicationOpenDateRange round={round} />
                )}
                <RoundOpenDateRange round={round} />
                <div className="absolute right-0">
                  <ViewGrantsExplorerButton
                    iconStyle="h-4 w-4"
                    chainId={`${chain.id}`}
                    roundId={id}
                  />
                </div>
              </div>
            </header>
            <main className="px-3 md:px-20 pt-6">
              <Tab.Group vertical>
                <div className="flex flex-row">
                  <div className="w-24 basis-1/6 border-r">
                    <Tab.List
                      className="flex flex-col h-max"
                      data-testid="side-nav-bar"
                    >
                      <Tab
                        className={({ selected }) =>
                          verticalTabStyles(selected)
                        }
                      >
                        {({ selected }) => (
                          <div
                            className={
                              selected
                                ? "text-black-500 flex flex-row"
                                : "flex flex-row"
                            }
                          >
                            <InboxIcon className="h-6 w-6 mr-2" />
                            <span
                              className="mt-0.5"
                              data-testid="grant-applications"
                            >
                              Grant Applications
                            </span>
                          </div>
                        )}
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          verticalTabStyles(selected)
                        }
                      >
                        {({ selected }) => (
                          <div
                            className={
                              selected
                                ? "text-black-500 flex flex-row"
                                : "flex flex-row"
                            }
                          >
                            <DocumentTextIcon className="h-6 w-6 mr-2" />
                            <span
                              className="mt-0.5"
                              data-testid="fund-contract"
                            >
                              Fund Contract
                            </span>
                          </div>
                        )}
                      </Tab>

                      <Tab
                        className={({ selected }) =>
                          verticalTabStyles(selected)
                        }
                      >
                        {({ selected }) => (
                          <div
                            className={
                              selected
                                ? "text-black-500 flex flex-row"
                                : "flex flex-row"
                            }
                          >
                            <AdjustmentsIcon className="h-6 w-6 mr-2" />
                            <span
                              className="mt-0.5"
                              data-testid="round-settings"
                            >
                              Round Settings
                            </span>
                          </div>
                        )}
                      </Tab>

                      <Tab
                        className={({ selected }) =>
                          verticalTabStyles(selected)
                        }
                      >
                        {({ selected }) => (
                          <div
                            className={
                              selected
                                ? "text-black-500 flex flex-row"
                                : "flex flex-row"
                            }
                          >
                            <ChartBarIcon className="h-6 w-6 mr-2" />
                            <span className="mt-0.5" data-testid="round-stats">
                              Round Stats
                            </span>
                          </div>
                        )}
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          verticalTabStyles(selected)
                        }
                      >
                        {({ selected }) => (
                          <div
                            className={
                              selected
                                ? "text-black-500 flex flex-row"
                                : "flex flex-row"
                            }
                          >
                            <DocumentReportIcon className="h-6 w-6 mr-2" />
                            <span
                              className="mt-0.5"
                              data-testid="round-results"
                            >
                              Round Results
                            </span>
                          </div>
                        )}
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          verticalTabStyles(selected)
                        }
                      >
                        {({ selected }) => (
                          <div
                            className={
                              selected
                                ? "text-black-500 flex flex-row"
                                : "flex flex-row"
                            }
                          >
                            <UserGroupIcon className="h-6 w-6 mr-2" />
                            <span
                              className="mt-0.5"
                              data-testid="fund-grantees"
                            >
                              Fund Grantees
                            </span>
                          </div>
                        )}
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          verticalTabStyles(selected)
                        }
                      >
                        {({ selected }) => (
                          <div
                            className={
                              selected
                                ? "text-black-500 flex flex-row"
                                : "flex flex-row"
                            }
                          >
                            <ArrowCircleRightIcon className="h-6 w-6 mr-2" />
                            <span
                              className="mt-0.5"
                              data-testid="reclaim-funds"
                            >
                              Reclaim Funds
                            </span>
                          </div>
                        )}
                      </Tab>
                    </Tab.List>
                  </div>
                  <Tab.Panels className="basis-5/6 ml-6">
                    <Tab.Panel>
                      <GrantApplications
                        isDirect={
                          round.payoutStrategy.strategyName ==
                          ROUND_PAYOUT_DIRECT
                        }
                        applications={applications}
                        isRoundsFetched={isRoundFetched}
                        fetchRoundStatus={fetchRoundStatus}
                        chainId={`${chain.id}`}
                        roundId={id}
                      />
                    </Tab.Panel>
                    <Tab.Panel>
                      <FundContract round={round} roundId={id} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewRoundSettings id={round?.id} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewRoundStats />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewRoundResults />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewFundGrantees
                        isRoundFinalized={
                          round?.payoutStrategy?.isReadyForPayout ?? undefined
                        }
                        round={round}
                      />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ReclaimFunds
                        round={round}
                        chainId={`${chain.id}`}
                        roundId={id}
                      />
                    </Tab.Panel>
                  </Tab.Panels>
                </div>
              </Tab.Group>
            </main>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

function GrantApplications(props: {
  isDirect?: boolean;
  applications: GrantApplication[] | undefined;
  isRoundsFetched: boolean;
  fetchRoundStatus: ProgressStatus;
  chainId: string;
  roundId: string | undefined;
}) {
  const pendingApplications =
    props.applications?.filter(
      (a) => a.status === ApplicationStatus.PENDING.toString()
    ) || [];
  const approvedApplications =
    props.applications?.filter(
      (a) => a.status === ApplicationStatus.APPROVED.toString()
    ) || [];
  const rejectedApplications =
    props.applications?.filter(
      (a) => a.status === ApplicationStatus.REJECTED.toString()
    ) || [];
  const inReviewApplications =
    props.applications?.filter(
      (a) => a.status === ApplicationStatus.IN_REVIEW.toString()
    ) || [];

  const TabApplicationCounter = tw.div`
  rounded-md
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
                    {props.isDirect && (
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
                              data-testid="received-application-counter"
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
                <div className="text-right absolute ml-24 bottom-4 left-3/4">
                  <CopyToClipboardButton
                    textToCopy={`https://builder.gitcoin.co/#/chains/${props.chainId}/rounds/${props.roundId}`}
                    styles="text-xs p-2"
                    iconStyle="h-4 w-4 mr-1"
                  />
                </div>
              </div>
              <Tab.Panels>
                <Tab.Panel>
                  <ApplicationsByStatus />
                </Tab.Panel>
                {props.isDirect && (
                  <Tab.Panel>
                    <ApplicationsByStatus
                      status={ApplicationStatus.IN_REVIEW}
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
      )}
      {props.fetchRoundStatus == ProgressStatus.IN_PROGRESS && (
        <Spinner text="We're fetching your Round." />
      )}
    </div>
  );
}

type ViewGrantsExplorerButtonType = {
  styles?: string;
  iconStyle?: string;
  chainId: string;
  roundId: string | undefined;
};

function RoundName(props: { round?: Round }) {
  return (
    <h1 className="text-3xl sm:text-[32px] my-2">
      {props.round?.roundMetadata?.name || "Round Details"}
    </h1>
  );
}

export function ViewGrantsExplorerButton(props: ViewGrantsExplorerButtonType) {
  const { chainId, roundId } = props;

  return (
    <Button
      type="button"
      className={`inline-flex items-center bg-white text-xs border border-grey-100 text-grey-500 py-1.5 px-2.5 w-48 h-7 drop-shadow-sm justify-center ${props.styles}`}
      onClick={() => {
        redirectToGrantExplorer(chainId, roundId);
      }}
      data-testid="round-explorer"
    >
      <GrantExplorerLogo className={props.iconStyle} aria-hidden="true" />
      View on Explorer
    </Button>
  );
}

function redirectToGrantExplorer(chainId: string, roundId: string | undefined) {
  const url = `${process.env.REACT_APP_GRANT_EXPLORER}/#/round/${chainId}/${roundId}`;
  setTimeout(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, 1000);
}

function ApplicationOpenDateRange({ round }: { round: RoundDates }) {
  const res = parseRoundDates(round);

  return (
    <div className="flex gap-1 text-sm">
      <CalendarIcon className="h-5 w-5 text-grey-400" />
      <span className="text-grey-400">Applications:</span>
      <span className="mr-1">{res.application.iso.start}</span>
      <span className="text-grey-400">({res.application.utc.start})</span>
      <span className="mx-1">-</span>
      <span className="mr-1">{res.application.iso.end}</span>
      {res.application.utc.end && (
        <span className="text-grey-400">({res.application.utc.end})</span>
      )}
    </div>
  );
}

function RoundOpenDateRange({ round }: { round: RoundDates }) {
  const res = parseRoundDates(round);

  return (
    <div className="flex gap-1 text-sm">
      <ClockIcon className="h-5 w-5 text-grey-400" />
      <span className="text-grey-400">Round:</span>
      <span className="mr-1">{res.round.iso.start}</span>
      <span className="text-grey-400">{res.round.utc.start}</span>
      <span className="mx-1">-</span>
      <span className="mr-1">{res.round.iso.end}</span>
      {res.round.utc.end && (
        <span className="text-grey-400">{res.round.utc.end}</span>
      )}
    </div>
  );
}

function RoundBadgeStatus({ round }: { round: Round }) {
  const applicationEnds = round.applicationsEndTime;
  const roundEnds = round.roundEndTime;
  const now = moment();

  if (
    (round.payoutStrategy.strategyName == ROUND_PAYOUT_MERKLE &&
      now.isBefore(applicationEnds)) ||
    (round.payoutStrategy.strategyName == ROUND_PAYOUT_DIRECT &&
      now.isBefore(roundEnds))
  ) {
    return (
      <div
        style={{
          borderRadius: "24px",
          lineHeight: "1.2",
        }}
        className={`text-sm h-[24px] inline-flex flex-col justify-center px-4 ml-auto bg-violet-500 text-white font-normal`}
      >
        Applications in progress
      </div>
    );
  }

  return null;
}
