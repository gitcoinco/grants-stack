import React from "react";
import { Link } from "react-router-dom";

import { ChevronUpIcon } from "@heroicons/react/solid";
import { Spinner } from "../common/Spinner";
import { datadogLogs } from "@datadog/browser-logs";
import { ProgressStatus, Round } from "../api/types";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
import { allChains } from "../../app/wagmi";
import { useRoundsByAddress } from "../../context/round/RoundContext";
import { useAccount } from "wagmi";
import { getChainById, stringToBlobUrl } from "common";
import { RoundCard } from "./RoundCard";
import Tooltip from "../common/Tooltip";
import { getStatusStyle, prettyDates3 } from "../common/Utils";
import { Key } from "react";

const maxRoundsPerSite = 5;

function ListRounds() {
  datadogLogs.logger.info("====> Route: /RoundListPage.tsx");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { address } = useAccount();
  const { version, switchToVersion } = useAlloVersion();
  const {
    data: rounds,
    fetchRoundStatus,
    error: listRoundsError,
  } = useRoundsByAddress(
    allChains.map((chain) => chain.id),
    address
  );
  const [viewAllRounds, setViewAllRounds] = React.useState(false);

  function hasNoRounds() {
    return !rounds || rounds.length === 0;
  }

  const isSuccess =
    fetchRoundStatus === ProgressStatus.IS_SUCCESS && !listRoundsError;

  const roundList = rounds.map((round: Round, key: Key | null | undefined) => {
    if (!round.chainId) return;

    const chain = getChainById(round.chainId);
    const status = getStatusStyle(round);
    const strategyType =
      round.strategyName === "allov2.DirectGrantsLiteStrategy"
        ? "direct"
        : "quadratic";

    return (
      isSuccess &&
      !hasNoRounds() && (
        <Link to={`/chain/${round.chainId}/round/${round.id}`} key={key}>
          <RoundCard
            key={round.id}
            title={round.roundMetadata.name}
            description={
              round.strategyName === "allov2.DirectGrantsLiteStrategy"
                ? "Direct grants"
                : "Quadratic funding"
            }
            status={status}
            color={
              round.strategyName === "allov2.DirectGrantsLiteStrategy"
                ? "yellow-100"
                : "green-100"
            }
            displayBar={{
              applicationDate:
                round.strategyName === "allov2.DirectGrantsLiteStrategy"
                  ? ""
                  : prettyDates3(
                      round.applicationsStartTime,
                      round.applicationsEndTime
                    ),
              roundDate: prettyDates3(round.roundStartTime, round.roundEndTime),
              matchingFunds: "",
            }}
            strategyType={strategyType}
            footerContent={
              <>
                <div className="flex flex-row items-center">
                  <img
                    src={stringToBlobUrl(chain.icon)}
                    alt="Chain"
                    className="rounded-full w-5 h-5 mr-2"
                  />
                  <span className="text-grey-500">{chain.prettyName}</span>
                </div>
              </>
            }
          />
        </Link>
      )
    );
  });

  return (
    <main className="container max-h-full">
      <div className="bg-grey-50 w-full">
        {fetchRoundStatus === ProgressStatus.IN_PROGRESS && (
          <Spinner text="We're fetching your Rounds." />
        )}
        {/* todo: remove when ready */}
        {version === "allo-v1" && (
          <div className="bg-blue-100 py-4 text-center font-medium flex flex-col items-center justify-center">
            <div>
              <ExclamationCircleIcon className="h-5 w-5 inline-block mr-2" />
              You are currently on Allo v1. To switch to the most current
              version of Manager,&nbsp;
              <button
                type="button"
                className="underline"
                onClick={(e) => {
                  e.preventDefault();
                  switchToVersion("allo-v2");
                }}
              >
                switch to Allo v2.
              </button>
              &nbsp;
            </div>
            <div>
              Click&nbsp;
              <a
                href="https://gitcoin.notion.site/Navigating-the-Transition-to-Allo-v2-A-Guide-for-Grants-Managers-63e2bdddccb94792af83fdffb1530b85?pvs=74"
                rel="noreferrer"
                className="underline"
                target="_blank"
              >
                here
              </a>
              &nbsp;to learn more about Allo v2.
            </div>
          </div>
        )}
        {isSuccess && (
          <main className="max-w-screen-2xl mx-auto px-8 max-h-full">
            <div className="flex flex-col mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex flex-row items-center justify-start pt-8">
                  <span className="text-2xl font-medium text-grey-500 antialiased mr-2">
                    Rounds
                  </span>
                  <span
                    className="md:ml-8 mt-1 text-xs font-mono hover:cursor-pointer"
                    onClick={() => {
                      setViewAllRounds(!viewAllRounds);
                    }}
                  >
                    {viewAllRounds ? "View less" : "View all"}
                  </span>
                </div>
                <Tooltip text="Coming Soon!">
                  <div className="flex flex-row items-center justify-end pt-8">
                    <span className="text-xs font-mono font-medium hover:cursor-pointer">
                      Sort by Recent
                    </span>
                    <ChevronUpIcon className="h-4 w-4 inline ml-2 hover:cursor-pointer" />
                    <span className="text-xs font-mono font-medium hover:cursor-pointer ml-6">
                      Filter by <span className="text-nectary-600">All</span>
                    </span>
                    <ChevronUpIcon className="h-4 w-4 inline ml-2 hover:cursor-pointer" />
                  </div>
                </Tooltip>
              </div>
            </div>
            <div className="w-full">
              {roundList.length === 0 && (
                <div className="text-md font-normal">
                  If you’re an operator of a round and you’re not a program
                  admin, that round will appear here.
                </div>
              )}
              {viewAllRounds ? roundList : roundList.slice(0, maxRoundsPerSite)}
            </div>
          </main>
        )}
      </div>
    </main>
  );
}

export default ListRounds;
