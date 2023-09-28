import { Link, useParams } from "react-router-dom";
import {
  ChevronRightIcon,
  PlusIcon,
  PlusSmIcon,
  UserIcon,
} from "@heroicons/react/solid";
import { RefreshIcon } from "@heroicons/react/outline";

import { Button } from "common/src/styles";
import { useWallet } from "../common/Auth";
import Navbar from "../common/Navbar";
import Footer from "common/src/components/Footer";
import { abbreviateAddress } from "../api/utils";
import { formatUTCDateAsISOString, getUTCTime } from "common";
import { datadogLogs } from "@datadog/browser-logs";
import { useEffect, useState } from "react";
import NotFoundPage from "../common/NotFoundPage";
import AccessDenied from "../common/AccessDenied";

import { useProgramById } from "../../context/program/ReadProgramContext";
import { Spinner } from "../common/Spinner";
import { useRounds } from "../../context/round/RoundContext";
import { ProgressStatus } from "../api/types";
import { useDebugMode } from "../../hooks";

export default function ViewProgram() {
  datadogLogs.logger.info("====> Route: /program/:id");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { id: programId } = useParams();

  const { address } = useWallet();

  const { program: programToRender, fetchProgramsStatus } =
    useProgramById(programId);
  const isProgramFetched = fetchProgramsStatus == ProgressStatus.IS_SUCCESS;

  const { data: rounds, fetchRoundStatus } = useRounds(programId);
  const isRoundsFetched = fetchRoundStatus == ProgressStatus.IS_SUCCESS;

  const [programExists, setProgramExists] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const debugModeEnabled = useDebugMode();

  useEffect(() => {
    if (isProgramFetched) {
      setProgramExists(!!programToRender);

      if (debugModeEnabled) {
        setHasAccess(true);
        return;
      }

      if (programToRender) {
        programToRender.operatorWallets.includes(address?.toLowerCase())
          ? setHasAccess(true)
          : setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    }
  }, [isProgramFetched, programToRender, address, debugModeEnabled]);

  const roundItems = rounds
    ? rounds.map((round, index) => (
        <Link to={`/round/${round.id}`} key={index}>
          <div
            key={index}
            className="relative w-full border-t border-b border-grey-100 bg-white py-4 my-4 flex items-center justify-between space-x-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm pb-3 mb-1 font-medium text-gray-900">
                {round.roundMetadata.name}
              </p>

              <div className="grid sm:grid-cols-3">
                <p className="text-xs flex gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-grey-500 my-auto"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-grey-400 my-auto mr-2">
                    Applications:{" "}
                  </span>
                  <div>
                    <p
                      className="my-auto text-xs"
                      data-testid="application-time-period"
                    >
                      <span data-testid="application-start-time-period">
                        {formatUTCDateAsISOString(round.applicationsStartTime)}
                      </span>
                      <span className="mx-1">-</span>
                      <span data-testid="application-end-time-period">
                        {formatUTCDateAsISOString(round.applicationsEndTime)}
                      </span>
                    </p>
                    <p className="text-xs text-grey-400">
                      <span className="mr-2">
                        ({getUTCTime(round.applicationsStartTime)})
                      </span>
                      <span>({getUTCTime(round.applicationsEndTime)})</span>
                    </p>
                  </div>
                </p>
                <p className="text-xs flex gap-1 md:ml-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 my-auto"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-grey-400 my-auto mr-2">Round: </span>
                  <span className="my-auto" data-testid="round-time-period">
                    <p
                      className="my-auto text-xs"
                      data-testid="round-time-period"
                    >
                      <span data-testid="round-start-time-period">
                        {formatUTCDateAsISOString(round.roundStartTime)}
                      </span>
                      <span className="mx-1">-</span>
                      <span data-testid="round-end-time-period">
                        {formatUTCDateAsISOString(round.roundEndTime)}
                      </span>
                    </p>

                    <p className="text-xs text-grey-400">
                      <span className="mr-2">
                        ({getUTCTime(round.roundStartTime)})
                      </span>
                      <span>({getUTCTime(round.roundEndTime)})</span>
                    </p>
                  </span>
                </p>
              </div>
            </div>

            <ChevronRightIcon className="h-5 w-5" />
          </div>
        </Link>
      ))
    : [];

  const operatorWallets = (
    <div className="flex flex-row flex-wrap">
      {programToRender?.operatorWallets.map((operatorWallet, index) => (
        <div
          className="bg-white text-grey-400 pb-2 pr-5"
          data-testid="program-operator-wallet"
          key={index}
        >
          <UserIcon className="inline h-4 w-4 text-grey-400 mr-1" />
          <span className="text-sm text-grey-400" key={index}>
            {abbreviateAddress(operatorWallet)}
          </span>
        </div>
      )) || (
        <p className="text-grey-400 text-sm">Fetching operator wallets...</p>
      )}
    </div>
  );

  const noRoundsGroup = (
    <div className="flex justify-center">
      <div className="text-center md:px-8 w-full lg:w-1/3">
        <RefreshIcon
          className="h-12 w-12 mt-8 mx-auto bg-zinc-100 rounded-full p-3"
          aria-hidden="true"
        ></RefreshIcon>
        <h2 className="text-2xl my-4 pt-8">My Rounds</h2>
        <p
          className="text-grey-400 text-sm"
          data-testid="program-details-intro"
        >
          Manage date details and acceptance criteria for your Grant Program
          Round.
        </p>
        <Link to={`/round/create?programId=${programToRender?.id}`}>
          <Button className="my-4 px-4 mt-10">
            <PlusIcon
              className="h-4 w-4 inline-flex -translate-y-0.5"
              aria-hidden="true"
            />{" "}
            Create round
          </Button>
        </Link>
      </div>
    </div>
  );

  return fetchProgramsStatus !== ProgressStatus.IS_SUCCESS ? (
    <Spinner text="We're fetching your Program." />
  ) : (
    <>
      {!programExists && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
      {programExists && hasAccess && (
        <>
          <Navbar programCta={true} />
          <div className="container mx-auto flex flex-col w-screen">
            <header className="flex flex-col justify-center border-b pl-2 md:pl-20 py-6">
              <div className="flex flex-row items-center">
                <Link to={`/`}>
                  <p className="text-sm text-grey-400 font-semibold">
                    My Programs
                  </p>
                </Link>
                <ChevronRightIcon
                  className="h-6 w-6 mx-3 text-sm text-grey-400"
                  aria-hidden="true"
                />
                <p className="text-sm text-grey-400 font-semibold">
                  Program Details
                </p>
              </div>
              <h1 className="text-3xl sm:text-[32px] my-2">
                {programToRender?.metadata?.name || "Program Details"}
              </h1>
              {operatorWallets}
            </header>

            <main className="flex-grow">
              <div className="px-2 md:px-20 py-3 md:py-6">
                <div>
                  <div>
                    {isRoundsFetched && roundItems.length > 0 && (
                      <div className="md:mb-8">
                        <div className="flex flex-row justify-between">
                          <p className="font-bold">My Rounds</p>
                          <Link
                            to={`/round/create?programId=${programToRender?.id}`}
                            className="text-violet-400 font-thin"
                            data-testid="create-round-small-link"
                          >
                            <PlusSmIcon
                              className="h-5 w-5 inline -translate-y-0.5"
                              aria-hidden="true"
                            />{" "}
                            Create round
                          </Link>
                        </div>
                        {roundItems}
                      </div>
                    )}
                  </div>
                </div>
                {fetchRoundStatus == ProgressStatus.IN_PROGRESS && (
                  <Spinner text="We're fetching your Rounds." />
                )}
              </div>

              {isRoundsFetched && roundItems.length === 0 && noRoundsGroup}
            </main>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}
