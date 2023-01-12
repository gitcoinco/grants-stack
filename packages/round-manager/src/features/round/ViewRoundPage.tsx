import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useWallet } from "../common/Auth";
import Navbar from "../common/Navbar";
import {
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  InboxIcon,
  ChartBarIcon,
  DocumentReportIcon,
} from "@heroicons/react/solid";
import { Tab } from "@headlessui/react";
import ApplicationsReceived from "./ApplicationsReceived";
import ApplicationsApproved from "./ApplicationsApproved";
import ApplicationsRejected from "./ApplicationsRejected";
import Footer from "../common/Footer";
import tw from "tailwind-styled-components";
import { datadogLogs } from "@datadog/browser-logs";
import NotFoundPage from "../common/NotFoundPage";
import AccessDenied from "../common/AccessDenied";
import CopyToClipboardButton from "../common/CopyToClipboardButton";
import { useRoundById } from "../../context/round/RoundContext";
import { Spinner } from "../common/Spinner";
import { useApplicationByRoundId } from "../../context/application/ApplicationContext";
import {
  ApplicationStatus,
  GrantApplication,
  ProgressStatus,
  Round,
} from "../api/types";
import { Button } from "../common/styles";
import { ReactComponent as GrantExplorerLogo } from "../../assets/grantexplorer-icon.svg";
import ViewFundingAdmin from "./ViewFundingAdmin";
import ViewRoundStats from "./ViewRoundStats";
import { getUTCDate, getUTCTime } from "../api/utils";

export default function ViewRoundPage() {
  datadogLogs.logger.info("====> Route: /round/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  const { id } = useParams();
  const { address, chain } = useWallet();

  const { round, fetchRoundStatus, error } = useRoundById(id);
  const isRoundsFetched =
    fetchRoundStatus == ProgressStatus.IS_SUCCESS && !error;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { applications } = useApplicationByRoundId(id!);

  const [roundExists, setRoundExists] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  const tabStyles = (selected: boolean) =>
    selected
      ? "border-violet-500 border-b whitespace-nowrap py-4 px-1 text-sm outline-none"
      : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

  useEffect(() => {
    if (isRoundsFetched) {
      setRoundExists(!!round);

      if (round) {
        round.operatorWallets?.includes(address?.toLowerCase())
          ? setHasAccess(true)
          : setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    }
  }, [isRoundsFetched, round, address]);

  return (
    <>
      {!roundExists && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
      {roundExists && hasAccess && (
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
              </div>
              <div className="flex flex-row mb-4 mt-4 items-center">
                <RoundName round={round} />
              </div>

              <div className="flex flex-row flex-wrap relative">
                <ApplicationOpenDateRange
                  startTime={round?.applicationsStartTime}
                  endTime={round?.applicationsEndTime}
                />
                <RoundOpenDateRange
                  startTime={round?.roundStartTime}
                  endTime={round?.roundEndTime}
                />
                <div className="ml-32 absolute left-3/4">
                  <ViewGrantsExplorerButton
                    iconStyle="h-4 w-4 mr-2"
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
                      <Tab className={({ selected }) => tabStyles(selected)}>
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
                      <Tab className={({ selected }) => tabStyles(selected)}>
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
                      <Tab className={({ selected }) => tabStyles(selected)}>
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
                              data-testid="funding-admin"
                            >
                              Funding Admin
                            </span>
                          </div>
                        )}
                      </Tab>
                    </Tab.List>
                  </div>
                  <Tab.Panels className="basis-5/6 ml-6">
                    <Tab.Panel>
                      <GrantApplications
                        applications={applications}
                        isRoundsFetched={isRoundsFetched}
                        fetchRoundStatus={fetchRoundStatus}
                        chainId={`${chain.id}`}
                        roundId={id}
                      />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewRoundStats
                        roundStats=""
                        isRoundStatsFetched={true}
                      />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewFundingAdmin
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

  const TabApplicationCounter = tw.div`
  rounded-md
  ml-2
  w-8
  h-5
  float-right
  font-sm
  font-normal
`;

  const tabStyles = (selected: boolean) =>
    selected
      ? "border-violet-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none"
      : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

  return (
    <div>
      {props.isRoundsFetched && (
        <div>
          <div>
            <Tab.Group>
              <div className="justify-end grow relative">
                <Tab.List className="border-b mb-6 flex items-center justify-between">
                  <div className="space-x-8">
                    <Tab className={({ selected }) => tabStyles(selected)}>
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
                    <Tab className={({ selected }) => tabStyles(selected)}>
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
                    <Tab className={({ selected }) => tabStyles(selected)}>
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
                    textToCopy={`https://grantshub.gitcoin.co/#/chains/${props.chainId}/rounds/${props.roundId}`}
                    styles="text-xs p-2"
                    iconStyle="h-4 w-4 mr-1"
                  />
                </div>
              </div>
              <Tab.Panels>
                <Tab.Panel>
                  <ApplicationsReceived />
                </Tab.Panel>
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

      <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4 mb-8">
        {props.fetchRoundStatus == ProgressStatus.IN_PROGRESS && (
          <Spinner text="We're fetching your Round." />
        )}
      </div>
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
      View on Grants Explorer
    </Button>
  );
}

function redirectToGrantExplorer(chainId: string, roundId: string | undefined) {
  const url = `${process.env.REACT_APP_GRANT_EXPLORER}/#/round/${chainId}/${roundId}`;
  setTimeout(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, 1000);
}

function ApplicationOpenDateRange(props: { startTime?: Date; endTime?: Date }) {
  const { startTime, endTime } = props;

  return (
    <div className="flex mr-8 lg:mr-36">
      <CalendarIcon className="h-5 w-5 mr-2 text-grey-400" />
      <p className="text-sm mr-2 text-grey-400">Applications:</p>
      <div>
        <p className="text-sm">
          <span>{(startTime && getUTCDate(startTime)) || "..."}</span>
          <span className="mx-2">-</span>
          <span>{(endTime && getUTCDate(endTime)) || "..."}</span>
        </p>
        <p className="flex justify-center items-center text-sm text-grey-400">
          <span>({(startTime && getUTCTime(startTime)) || "..."})</span>
          <span className="mx-2">-</span>
          <span>({(endTime && getUTCTime(endTime)) || "..."})</span>
        </p>
      </div>
    </div>
  );
}

function RoundOpenDateRange(props: { startTime?: Date; endTime?: Date }) {
  const { startTime, endTime } = props;

  return (
    <div className="flex">
      <ClockIcon className="h-5 w-5 mr-2 text-grey-400" />
      <p className="text-sm mr-2 text-grey-400">Round:</p>
      <div>
        <p className="flex justify-center items-center text-sm">
          <span>{(startTime && getUTCDate(startTime)) || "..."}</span>
          <span className="mx-2">-</span>
          <span>{(endTime && getUTCDate(endTime)) || "..."}</span>
        </p>
        <p className="flex justify-center items-center text-sm text-grey-400">
          <span>({(startTime && getUTCTime(startTime)) || "..."})</span>
          <span className="mx-2">-</span>
          <span>({(endTime && getUTCTime(endTime)) || "..."})</span>
        </p>
      </div>
    </div>
  );
}
