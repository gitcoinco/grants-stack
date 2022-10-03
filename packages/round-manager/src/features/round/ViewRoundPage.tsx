import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useWallet } from "../common/Auth";
import Navbar from "../common/Navbar";
import {
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
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
import { ApplicationStatus } from "../api/types";

export default function ViewRoundPage() {
  datadogLogs.logger.info("====> Route: /round/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { id } = useParams();
  const { address, chain } = useWallet();

  const { round, isLoading: isRoundsLoading, error } = useRoundById(id);
  const isRoundsFetched = !isRoundsLoading && !error;

  const { applications } = useApplicationByRoundId(id!);

  const pendingApplications =
    applications?.filter(
      (a) => a.status === ApplicationStatus.PENDING.toString()
    ) || [];
  const approvedApplications =
    applications?.filter(
      (a) => a.status === ApplicationStatus.APPROVED.toString()
    ) || [];
  const rejectedApplications =
    applications?.filter(
      (a) => a.status === ApplicationStatus.REJECTED.toString()
    ) || [];

  const formatDate = (date: Date | undefined) => date?.toLocaleDateString();

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

  const [roundExists, setRoundExists] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

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
              <div className="text-grey-400 font-bold text-sm flex flex-row items-center gap-3">
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
              <h1 className="text-3xl sm:text-[32px] my-2">
                {round?.roundMetadata?.name || "Round Details"}
              </h1>
              <div className="flex flex-row flex-wrap">
                <div className="flex mr-8 lg:mr-36">
                  <CalendarIcon className="h-5 w-5 mr-2 text-grey-400" />
                  <p className="text-sm mr-1 text-grey-400">Applications:</p>
                  <p className="text-sm">
                    {formatDate(round?.applicationsStartTime) || "..."}
                    <span className="mx-1">-</span>
                    {formatDate(round?.applicationsEndTime) || "..."}
                  </p>
                </div>

                <div className="flex">
                  <ClockIcon className="h-5 w-5 mr-2 text-grey-400" />
                  <p className="text-sm mr-1 text-grey-400">Round:</p>
                  <p className="text-sm">
                    {formatDate(round?.roundStartTime) || "..."}
                    <span className="mx-1">-</span>
                    {formatDate(round?.roundEndTime) || "..."}
                  </p>
                </div>

                <div className="flex justify-end grow relative">
                  <div className="text-right absolute bottom-0">
                    <p className="text-xs mb-1">
                      Copy link to round application
                    </p>
                    <CopyToClipboardButton
                      textToCopy={`https://granthub.gitcoin.co/#/chains/${chain.id}/rounds/${id}`}
                      styles="text-xs p-2"
                      iconStyle="h-4 w-4 mr-1"
                    />
                  </div>
                </div>
              </div>
            </header>

            <main className="px-3 md:px-20 pt-6">
              {isRoundsFetched && (
                <div>
                  <p className="text-bold text-md font-semibold mb-2">
                    Grant Applications
                  </p>
                  <div>
                    <Tab.Group>
                      <Tab.List className="border-b mb-6 flex items-center justify-between">
                        <div className="space-x-8">
                          <Tab
                            className={({ selected }) => tabStyles(selected)}
                          >
                            {({ selected }) => (
                              <div
                                className={selected ? "text-violet-500" : ""}
                              >
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
                          <Tab
                            className={({ selected }) => tabStyles(selected)}
                          >
                            {({ selected }) => (
                              <div
                                className={selected ? "text-violet-500" : ""}
                              >
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
                            className={({ selected }) => tabStyles(selected)}
                          >
                            {({ selected }) => (
                              <div
                                className={selected ? "text-violet-500" : ""}
                              >
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
                {isRoundsLoading && (
                  <Spinner text="We're fetching your Round." />
                )}
              </div>
            </main>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}
