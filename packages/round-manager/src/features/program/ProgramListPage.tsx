import React from "react";
import { Link } from "react-router-dom";
import { ArrowNarrowRightIcon, PlusIcon } from "@heroicons/react/solid";
import { Spinner } from "../common/Spinner";
import { datadogLogs } from "@datadog/browser-logs";
import { usePrograms } from "../../context/program/ReadProgramContext";
import { ProgressStatus } from "../api/types";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
import { ProgramCard } from "./ProgramCard";
import { chunk } from "lodash";

const maxProgramsPerRow = 4;

const startAProgramCard = (
  <Link to="/program/create">
    <ProgramCard
      title={"Start a Grant Program"}
      description={
        "Create a Grant Program to manage applications, round dates, and voting mechanisms, as well as approve or reject projects all in one place."
      }
      displayDate=""
      footerContent={
        <p className="text-violet-400">
          Create Program{" "}
          <ArrowNarrowRightIcon className="h-5 w-5 inline ml-4" />
        </p>
      }
    />
  </Link>
);

function ListPrograms() {
  datadogLogs.logger.info("====> Route: /ProgramListPage.tsx");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { version, switchToVersion } = useAlloVersion();
  const { programs, fetchProgramsStatus, listProgramsError } = usePrograms();
  const [viewAllPrograms, setViewAllPrograms] = React.useState(false);
  const isSuccess =
    fetchProgramsStatus === ProgressStatus.IS_SUCCESS && !listProgramsError;

  function hasNoPrograms() {
    return !programs || programs.length === 0;
  }

  const ProgramList = programs.map((program, key) => {
    return (
      <Link to={`/chain/${program.chain?.id}/program/${program.id}`} key={key}>
        <ProgramCard
          key={program.id}
          title={program.metadata.name}
          description={`${program.operatorWallets.length} ${program.operatorWallets.length === 1 ? "operator" : "operators"}`}
          displayDate=""
          strategyType="quadratic"
          // {
          //   round.strategyName === "allov2.DirectGrantsLiteStrategy"
          //     ? "direct"
          //     : "quadratic"
          // }
          footerContent={
            <>
              <div className="mr-auto">
                <img
                  src={program.chain?.logo}
                  alt="Chain"
                  className="rounded-full w-6 h-6 mr-2"
                />
              </div>
              <div className="-ml-28">
                {program.tags?.includes("allo-v1") && (
                  // todo: add the icon for Allo
                  // <AlloV1 color="black" className="h-20 w-20 ml-12" />
                  <span>v1</span>
                )}
              </div>
              <div
                className="text-gray-500 font-normal ml-auto"
                data-testid="program-card"
              >
                View details{" "}
                <ArrowNarrowRightIcon className="h-5 w-5 inline ml-1" />
              </div>
            </>
          }
        />
      </Link>
    );
  });

  return (
    <div className="bg-grey-50">
      {fetchProgramsStatus === ProgressStatus.IN_PROGRESS && (
        <Spinner text="We're fetching your Programs." />
      )}
      {/* todo: remove when ready */}
      {version === "allo-v1" && (
        <div className="bg-[#D3EDFE] py-4 text-center font-medium flex flex-col items-center justify-center">
          <div>
            <ExclamationCircleIcon className="h-5 w-5 inline-block mr-2" />
            You are currently on Allo v1. To switch to the most current version
            of Manager,&nbsp;
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
      {/* {version === "allo-v2" && ()} */}
      <main className="container px-8 max-h-full">
        <div className="flex flex-col mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between pt-2 md:pt-8">
            <div className="flex flex-row items-center justify-start mb-2">
              <span className="text-2xl font-medium text-gray-500 antialiased">
                Programs
              </span>
              <span
                className="ml-8 mt-1 text-xs font-mono hover:cursor-pointer"
                onClick={() => {
                  setViewAllPrograms(!viewAllPrograms);
                }}
              >
                {viewAllPrograms ? "View less" : "View all"}
              </span>
            </div>
            <div className="flex flex-row items-center justify-end mr-8 lg:mr-2">
              <Link to="/program/create">
                <span className="flex flex-row items-center justify-between p-2 bg-white hover:border-gray-200 border border-transparent rounded-lg text-xs font-mono font-medium hover:cursor-pointer">
                  <PlusIcon className="h-5 w-5 inline mr-2" />
                  <span data-testid="create-round-small-link">
                    Create program
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          {isSuccess && hasNoPrograms() && startAProgramCard}
          {chunk(
            viewAllPrograms
              ? ProgramList
              : ProgramList.slice(0, maxProgramsPerRow * 2),
            maxProgramsPerRow
          ).map((programsChunk, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex flex-row flex-wrap w-full items-center ${rowIndex < 2 ? "justify-between" : "justify-start"}`}
            >
              {programsChunk.map((program, index) => (
                <div key={index} className="w-full md:w-auto">
                  {program}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ListPrograms;
