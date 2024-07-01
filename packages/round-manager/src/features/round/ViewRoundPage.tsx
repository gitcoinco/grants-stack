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
  UserAddIcon,
} from "@heroicons/react/solid";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/round/RoundContext";
import { useDebugMode } from "../../hooks";
import { ProgressStatus, Round } from "../api/types";
import AccessDenied from "../common/AccessDenied";
import CopyToClipboardButton from "../common/CopyToClipboardButton";
import Footer from "common/src/components/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import {
  getPayoutRoundDescription,
  prettyDates2,
  verticalTabStyles,
} from "../common/Utils";
import FundContract from "./FundContract";
import ReclaimFunds from "./ReclaimFunds";
import ViewFundGrantees from "./ViewFundGrantees";
import ViewRoundResults from "./ViewRoundResults/ViewRoundResults";
import ViewRoundSettings from "./ViewRoundSettings";
import ViewRoundStats from "./ViewRoundStats";
import { RoundDates, parseRoundDates } from "../common/parseRoundDates";
import moment from "moment";
import { getChainById, getRoundStrategyType, stringToBlobUrl } from "common";
import { useApplicationsByRoundId } from "../common/useApplicationsByRoundId";
import AlloV1 from "common/src/icons/AlloV1";
import ViewManageTeam from "./ViewManageTeam";
import GrantApplications from "./GrantApplications";
import { ViewGrantsExplorerButton } from "../common/ViewGrantsExplorerButton";
import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";

const builderLink = process.env.REACT_APP_BUILDER_URL;

export const isDirectRound = (round: Round | undefined) => {
  return (
    round?.payoutStrategy?.strategyName &&
    getRoundStrategyType(round.payoutStrategy.strategyName).includes(
      "DirectGrants"
    )
  );
};

export default function ViewRoundPage() {
  datadogLogs.logger.info("====> Route: /round/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  const { switchChain } = useSwitchChain();

  const { chainId, id } = useParams() as { chainId?: string; id: string };
  const { address, chain, connector } = useAccount();

  const roundChainId = chainId ? Number(chainId) : chain?.id;
  const { round, fetchRoundStatus, error } = useRoundById(
    roundChainId as number,
    id.toLowerCase()
  );

  console.log("round", round);

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
      ? round?.roles?.some(
          (role: { address: string }) =>
            role.address.toLowerCase() === address?.toLowerCase()
        )
      : true);
  const roundNotFound = fetchRoundStatus === ProgressStatus.IS_ERROR;

  useEffect(() => {
    if (roundChainId !== chain?.id) {
      switchChain({ connector, chainId: roundChainId as number });
    }
  }, [chain?.id, roundChainId, connector, switchChain]);

  const strategyName = round?.payoutStrategy.strategyName;
  console.log("strategyName", strategyName);
  const badgeColor =
    strategyName === "MERKLE" ? "gradient-border-qf" : "gradient-border-direct";

  return (
    <>
      {roundNotFound && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
      {round && hasAccess && (
        <>
          <Navbar />
          <div className="flex flex-col items-center bg-gray-50">
            <header className="w-full bg-grey-50">
              <div className="w-full max-w-screen-2xl mx-auto px-8 py-6">
                {/* Breadcrumb */}
                <div className="text-grey-400 font-semibold text-sm flex flex-row items-center gap-3">
                  <Link to={`/`}>
                    <span>{"My Programs"}</span>
                  </Link>
                  <ChevronRightIcon className="h-6 w-6" />
                  <Link
                    to={`/chain/${roundChainId}/program/${round.roundMetadata.programContractAddress}`}
                  >
                    <span>{"Program Details"}</span>
                  </Link>
                  <ChevronRightIcon className="h-6 w-6" />
                  <Link to={`/round/${id}`}>
                    <span>{"Round Details"}</span>
                  </Link>
                  <RoundBadgeStatus round={round} />
                </div>
                {/* Round type badge */}
                {getPayoutRoundDescription(
                  round.payoutStrategy.strategyName || ""
                ) && (
                  <div
                    className={`text-sm text-grey-900 h-[20px] inline-flex flex-col justify-center ${badgeColor} px-3 my-2`}
                  >
                    {getPayoutRoundDescription(
                      round.payoutStrategy.strategyName || ""
                    )}
                  </div>
                )}
                <div className="flex flex-row items-center">
                  {/* Chain icon (allo v1 badge if v1) & Round name */}
                  <img
                    src={stringToBlobUrl(
                      getChainById(roundChainId as number).icon
                    )}
                    alt="Chain"
                    className="rounded-full w-6 h-6 mr-2 mt-2"
                  />
                  <RoundName round={round} />
                  {round?.tags?.includes("allo-v1") && (
                    <AlloV1 className="mt-2 ml-2" color="black" />
                  )}
                </div>
                {/* Round open date range & buttons */}
                <div className="flex flex-row items-center justify-between mt-4">
                  <div className="flex flex-row justify-start">
                    <RoundOpenDateRange round={round} />
                  </div>
                  <div className="flex flex-row justify-end">
                    <div className="mr-4">
                      <CopyToClipboardButton
                        textToCopy={`${builderLink}/#/chains/${round.chainId}/rounds/${round.id}`}
                        styles="text-xs font-mono p-2"
                        iconStyle="h-4 w-4 mr-2"
                      />
                    </div>
                    <div className="">
                      <ViewGrantsExplorerButton
                        iconStyle="h-4 w-4"
                        chainId={`${chain?.id}`}
                        roundId={round.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </header>
            {/* Main content & tab */}
            <main className="w-full max-w-screen-2xl mx-auto px-8 py-6">
              <Tab.Group vertical>
                <div className="flex font-semibold">
                  <div className="border-r border-r-grey-100 md:pr-12">
                    <Tab.List
                      className="flex flex-col h-max mr-20"
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
                            <UserAddIcon className="h-6 w-6 mr-2" />
                            <span
                              className="mt-0.5"
                              data-testid="grant-applications"
                            >
                              Manage Team
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
                        chainId={`${chain?.id}`}
                        roundId={id}
                      />
                    </Tab.Panel>
                    {!isDirectRound(round) && (
                      <Tab.Panel>
                        <FundContract round={round} roundId={id} />
                      </Tab.Panel>
                    )}
                    <Tab.Panel>
                      <ViewRoundSettings
                        chainId={roundChainId as number}
                        id={round?.id}
                      />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewManageTeam
                        round={round}
                        userAddress={address?.toString() ?? "0x"}
                      />
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
                            chainId={`${chain?.id}`}
                            roundId={id}
                          />
                        </Tab.Panel>
                      </>
                    )}
                  </Tab.Panels>
                </div>
              </Tab.Group>
              <div className="w-full">
                <Footer />
              </div>
            </main>
          </div>
        </>
      )}
    </>
  );
}

export function RoundName(props: { round?: Round }) {
  return (
    <h1 className="text-3xl sm:text-[32px] my-1 -mb-2">
      {props.round?.roundMetadata?.name || "Round Details"}
    </h1>
  );
}

export function ApplicationOpenDateRange({ round }: { round: RoundDates }) {
  const res = parseRoundDates(round);

  return (
    <div className="flex gap-2 text-sm">
      <CalendarIcon className="h-5 w-5 text-grey-400" />
      <span className="text-grey-400 mr-2">Applications:</span>
      <div className="flex flex-row gap-2">
        <p className="flex flex-col">
          <span>{res.application.local_iso.start}</span>
          <span className="text-grey-400 text-xs">
            ({res.application.local.start})
          </span>
        </p>
        <p className="flex flex-col">
          <span className="mx-1">-</span>
        </p>
        <p className="flex flex-col">
          <span className="[&>*]:flex [&>*]:flex-col">
            {res.application.local_iso.end}
          </span>
          {res.application.local.end && (
            <span className="text-grey-400 text-xs">
              {res.application.local.end}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function RoundOpenDateRange({ round }: { round: RoundDates }) {
  const dates = prettyDates2(round.roundStartTime, round.roundEndTime);

  return (
    <div className="flex flex-row text-sm text-grey-400">
      <ClockIcon className="h-5 w-5 text-grey-500" />
      <span className="mx-2">Round:</span>
      <span className="text-grey-500">{dates.start.date}</span>
      <span className="mx-1">
        {dates.start.time} {dates.start.timezone}
      </span>
      {" - "}
      {dates.end && (
        <>
          <span className="text-grey-500 ml-1">
            {dates.end.date ?? dates.end}
          </span>
          <span className="mx-1">
            {dates.end.time ?? ""} {dates.end.timezone ?? ""}
          </span>
        </>
      )}
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
    (roundStrategyType === "DirectGrants" && now.isBetween(roundEnds, now))
  ) {
    return (
      <div
        style={{
          borderRadius: "24px",
          lineHeight: "1.2",
        }}
        className={`text-sm h-[24px] inline-flex flex-col justify-center px-4 mt-2 ml-auto bg-blue-100 text-black font-normal`}
      >
        Applications in progress
      </div>
    );
  }

  return null;
}
