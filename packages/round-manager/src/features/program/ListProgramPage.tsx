import React from "react";
import { Link } from "react-router-dom";

import {
  ArrowNarrowRightIcon,
  PlusIcon,
  RefreshIcon,
} from "@heroicons/react/solid";
import { Spinner } from "../common/Spinner";
import Navbar from "../common/Navbar";
import {
  BasicCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardFooterContent,
  CardsContainer,
  CardTitle,
} from "../common/styles";
import { ReactComponent as Banner } from "../../assets/programs/city-voxel.svg";
import Footer from "common/src/components/Footer";
import { datadogLogs } from "@datadog/browser-logs";
import { usePrograms } from "../../context/program/ReadProgramContext";
import { ProgressStatus } from "../api/types";
import AlloV1 from "common/src/icons/AlloV1";
import AlloV2 from "common/src/icons/AlloV2";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";
import { ExclamationCircleIcon } from "@heroicons/react/solid";

interface ProgramCardProps {
  floatingIcon: JSX.Element;
  title: string;
  description: string;
  footerContent: JSX.Element;
}

const ProgramCard: React.FC<ProgramCardProps> = (props: ProgramCardProps) => (
  <BasicCard className="border-none mb-12 md:w-[410px] relative shadow-xl xl:-translate-y-44 lg:-translate-y-20 md:-translate-y-12 -translate-y-2">
    {props.floatingIcon}
    <CardContent className="pt-0">
      <CardTitle className="font-bold">{props.title}</CardTitle>
      <CardDescription className="line-clamp-none">
        {props.description}
      </CardDescription>
    </CardContent>
    <CardFooter>
      <CardFooterContent className="p-6">
        {props.footerContent}
      </CardFooterContent>
    </CardFooter>
  </BasicCard>
);

const startAProgramCard = (
  <Link to="/program/create">
    <ProgramCard
      floatingIcon={
        <div className="relative flex justify-center items-center h-16 w-16 translate-x-6 -translate-y-8 bg-violet-400 text-white rounded drop-shadow-xl">
          <PlusIcon className="h-6 w-6" aria-hidden="true" />
        </div>
      }
      title={"Start a Grant Program"}
      description={
        "Create a Grant Program to manage applications, round dates, and voting mechanisms, as well as approve or reject projects all in one place."
      }
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
  datadogLogs.logger.info("====> Route: /");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { version, switchToVersion } = useAlloVersion();
  const { programs, fetchProgramsStatus, listProgramsError } = usePrograms();

  function hasNoPrograms() {
    return !programs || programs.length === 0;
  }

  const isSuccess =
    fetchProgramsStatus === ProgressStatus.IS_SUCCESS && !listProgramsError;

  const programList = programs.map((program, key) => (
    <Link to={`/program/${program.id}`} key={key}>
      <ProgramCard
        key={program.id}
        floatingIcon={
          <div className="relative flex justify-center items-center h-16 w-16 translate-x-6 -translate-y-8 bg-teal-500 text-white rounded drop-shadow-xl">
            <RefreshIcon className="h-6 w-6 text-grey-500" aria-hidden="true" />
          </div>
        }
        title={program.metadata.name}
        description={`${program.operatorWallets.length} Round Operators`}
        footerContent={
          <>
            <div className="mr-auto">
              {program.tags?.includes("allo-v1") && <AlloV1 color="black" />}
              {program.tags?.includes("allo-v2") && <AlloV2 color="black" />}
            </div>
            <div className="text-violet-400 ml-auto" data-testid="program-card">
              View details{" "}
              <ArrowNarrowRightIcon className="h-5 w-5 inline ml-4" />
            </div>
          </>
        }
      />
    </Link>
  ));

  return (
    <div className="bg-grey-150">
      <Navbar programCta={isSuccess} />
      {version === "allo-v1" && (
        <div className="bg-[#D3EDFE] p-4 text-center font-medium flex flex-col items-center justify-center">
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
      <header className="mb-2.5 bg-grey-500 overflow-hidden">
        <div className="grid grid-cols-2 grid-flow-col">
          <div className="row-span-4 md:pt-14 md:pl-20 lg:pt-32 lg:pl-24">
            <h1 className="text-4xl lg:text-6xl text-white font-thin antialiased">
              My Programs
            </h1>
            <p className="text-xl text-grey-400 mt-4">
              <span className="block">
                Create a grant program and manage rounds with
              </span>
              <span>independent criteria.</span>
            </p>
          </div>
          <div className="row-span-8 hidden md:block">
            <Banner className="float-right" />
          </div>
        </div>
      </header>
      <main className="container mx-5 p-2 md:px-20">
        <CardsContainer>
          {isSuccess && hasNoPrograms() && startAProgramCard}
          {programList}
        </CardsContainer>
      </main>
      {fetchProgramsStatus === ProgressStatus.IN_PROGRESS && (
        <Spinner text="We're fetching your Programs." />
      )}
      <Footer />
    </div>
  );
}

export default ListPrograms;
