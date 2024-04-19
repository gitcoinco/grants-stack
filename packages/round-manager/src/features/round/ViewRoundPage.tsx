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
  getPayoutRoundDescription,
  horizontalTabStyles,
  verticalTabStyles,
} from "../common/Utils";
import ApplicationsApproved from "./ApplicationsApproved";
import ApplicationsRejected from "./ApplicationsRejected";
import FundContract from "./FundContract";
import ReclaimFunds from "./ReclaimFunds";
import ViewFundGrantees from "./ViewFundGrantees";
import ViewRoundResults from "./ViewRoundResults/ViewRoundResults";
import ViewRoundSettings from "./ViewRoundSettings";
import ViewRoundStats from "./ViewRoundStats";
import { RoundDates, parseRoundDates } from "../common/parseRoundDates";
import moment from "moment";
import ApplicationsToApproveReject from "./ApplicationsToApproveReject";
import ApplicationsToReview from "./ApplicationsToReview";
import { getRoundStrategyType } from "common";
import { useApplicationsByRoundId } from "../common/useApplicationsByRoundId";
import AlloV1 from "common/src/icons/AlloV1";
import AlloV2 from "common/src/icons/AlloV2";

export const isDirectRound = (round: Round | undefined) => {
  return (
    round?.payoutStrategy?.strategyName &&
    getRoundStrategyType(round.payoutStrategy.strategyName) === "DirectGrants"
  );
};

export default function ViewRoundPage() {
  datadogLogs.logger.info("====> Route: /round/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { id } = useParams() as { id: string };
  const { address, chain } = useWallet();

  const { round, fetchRoundStatus, error } = useRoundById(id.toLowerCase());
  const isRoundFetched =
    fetchRoundStatus == ProgressStatus.IS_SUCCESS && !error;

  const { data: applications } = useApplicationsByRoundId(id);
  const roundStrategyType = round?.payoutStrategy?.strategyName
    ? getRoundStrategyType(round?.payoutStrategy?.strategyName)
    : null;

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
          <Navbar alloVersionSwitcherVisible={false} />
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
              <div className="mb-3">
                {round?.tags?.includes("allo-v1") && <AlloV1 color="black" />}
                {round?.tags?.includes("allo-v2") && <AlloV2 color="black" />}
              </div>
              <div className="flex flex-row flex-wrap relative gap-2 md:gap-8 xl:gap-36 pr-44">
                {!isDirectRound(round) && (
                  <ApplicationOpenDateRange round={round} />
                )}
                <RoundOpenDateRange round={round} />
                <div className="absolute right-0">
                  <ViewGrantsExplorerButton
                    iconStyle="h-4 w-4"
                    chainId={`${chain.id}`}
                    roundId={round.id}
                  />
                </div>
              </div>
            </header>
            <main className="px-3 md:px-20 pt-6">
              <Tab.Group vertical>
                <div className="flex">
                  <div className="border-r md:pr-12 pr-4">
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
                      {!isDirectRound(round) && (
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
                                Fund Round
                              </span>
                            </div>
                          )}
                        </Tab>
                      )}
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
                      {!isDirectRound(round) && (
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
                              <span
                                className="mt-0.5"
                                data-testid="round-stats"
                              >
                                Round Stats
                              </span>
                            </div>
                          )}
                        </Tab>
                      )}
                      {!isDirectRound(round) && (
                        <>
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
                        </>
                      )}
                    </Tab.List>
                  </div>
                  <Tab.Panels className="flex-grow ml-6">
                    <Tab.Panel>
                      <GrantApplications
                        isDirectRound={roundStrategyType === "DirectGrants"}
                        applications={applications}
                        isRoundsFetched={isRoundFetched}
                        fetchRoundStatus={fetchRoundStatus}
                        chainId={`${chain.id}`}
                        roundId={id}
                      />
                    </Tab.Panel>
                    {!isDirectRound(round) && (
                      <Tab.Panel>
                        <FundContract round={round} roundId={id} />
                      </Tab.Panel>
                    )}
                    <Tab.Panel>
                      <ViewRoundSettings id={round?.id} />
                    </Tab.Panel>
                    {!isDirectRound(round) && (
                      <>
                        <Tab.Panel>
                          <ViewRoundStats />
                        </Tab.Panel>
                        <Tab.Panel>
                          <ViewRoundResults />
                        </Tab.Panel>
                        <Tab.Panel>
                          <ViewFundGrantees
                            isRoundFinalized={
                              round?.payoutStrategy?.isReadyForPayout ??
                              undefined
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
                      </>
                    )}
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

  const builderLink = process.env.REACT_APP_BUILDER_URL;

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
                    textToCopy={`${builderLink}/#/chains/${props.chainId}/rounds/${props.roundId}`}
                    styles="text-xs p-2"
                    iconStyle="h-4 w-4 mr-1"
                  />
                </div>
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

export function RoundName(props: { round?: Round }) {
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
  const isAlloV1 = roundId?.startsWith("0x");
  const explorerBaseUrl = isAlloV1
    ? "https://explorer-v1.gitcoin.co"
    : process.env.REACT_APP_GRANT_EXPLORER;

  const url = `${explorerBaseUrl}/#/round/${chainId}/${roundId}`;
  setTimeout(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, 1000);
}

export function ApplicationOpenDateRange({ round }: { round: RoundDates }) {
  const res = parseRoundDates(round);

  return (
    <div className="flex gap-2 text-sm">
      <CalendarIcon className="h-5 w-5 text-grey-400" />
      <span className="text-grey-400 mr-2">Applications:</span>
      <div className="flex flex-row gap-2">
        <p className="flex flex-col">
          <span>{res.application.iso.start}</span>
          <span className="text-grey-400 text-xs">
            ({res.application.utc.start})
          </span>
        </p>
        <p className="flex flex-col">
          <span className="mx-1">-</span>
        </p>
        <p className="flex flex-col">
          <span className="[&>*]:flex [&>*]:flex-col">
            {res.application.iso.end}
          </span>
          {res.application.utc.end && (
            <span className="text-grey-400 text-xs">
              {res.application.utc.end}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function RoundOpenDateRange({ round }: { round: RoundDates }) {
  const res = parseRoundDates(round);

  return (
    <div className="flex gap-2 text-sm">
      <ClockIcon className="h-5 w-5 text-grey-400" />
      <span className="text-grey-400 mr-2">Round:</span>
      <div className="flex flex-row gap-2">
        <p className="flex flex-col">
          <span>{res.round.iso.start}</span>
          <span className="text-grey-400 text-xs">{res.round.utc.start}</span>
        </p>
        <p className="flex flex-col">
          <span className="mx-1">-</span>
        </p>
        <p className="flex flex-col">
          <span className="[&>*]:flex [&>*]:flex-col">{res.round.iso.end}</span>
          {res.round.utc.end && (
            <span className="text-grey-400 text-xs">{res.round.utc.end}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function RoundBadgeStatus({ round }: { round: Round }) {
  const roundEnds = round.roundEndTime;
  const now = moment();

  const roundStrategyType = round?.payoutStrategy?.strategyName
    ? getRoundStrategyType(round.payoutStrategy?.strategyName)
    : null;

  if (
    (roundStrategyType === "QuadraticFunding" &&
      now.isBetween(
        round.applicationsStartTime,
        round.applicationsEndTime || now
      )) ||
    (roundStrategyType === "DirectGrants" && now.isBefore(roundEnds))
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
