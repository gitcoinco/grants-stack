import { Link, useParams } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  ChevronRightIcon,
  PlusIcon,
  PlusSmIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/solid";
import { RefreshIcon } from "@heroicons/react/outline";

import QuadraticFundingSVG from "../../assets/quadratic-funding.svg";
import DirectGrants from "../../assets/direct-grants.svg";
import Close from "../../assets/close.svg";

import { Button } from "common/src/styles";
import { useWallet } from "../common/Auth";
import Navbar from "../common/Navbar";
import Footer from "common/src/components/Footer";
import { abbreviateAddress } from "../api/utils";
import { datadogLogs } from "@datadog/browser-logs";
import { useEffect, useState } from "react";
import NotFoundPage from "../common/NotFoundPage";
import AccessDenied from "../common/AccessDenied";

import { useProgramById } from "../../context/program/ReadProgramContext";
import { Spinner } from "../common/Spinner";
import { useRounds } from "../../context/round/RoundContext";
import { ProgressStatus } from "../api/types";
import { useDebugMode } from "../../hooks";
import { getRoundDescriptionStatus } from "./getRoundDescriptionStatus";
import { parseRoundDates } from "../common/parseRoundDates";
import { getPayoutRoundDescription } from "../common/Utils";
import { isDirectRound } from "../round/ViewRoundPage";

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
  const [grantType, setGrantType] = useState<
    "quadraticFunding" | "directGrant" | null
  >(null);
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
    ? rounds.map((round, index) => {
        const parsedRoundInfo = parseRoundDates(round);

        return (
          <Link to={`/round/${round.id}`} key={index}>
            <div
              key={index}
              className="relative w-full border-b border-grey-100 py-4 grid items-center"
              style={{ gridTemplateColumns: "80% auto 20px" }}
            >
              <div className="flex-1 min-w-0">
                {/* Round type */}
                {getPayoutRoundDescription(
                  round.payoutStrategy.strategyName || "",
                ) && (
                  <div
                    className={`text-xs text-gray-900 h-[20px] inline-flex flex-col justify-center bg-grey-100 px-3 mb-3`}
                    style={{ borderRadius: "20px" }}
                    data-testid="round-payout-strategy-type"
                  >
                    {getPayoutRoundDescription(
                      round.payoutStrategy.strategyName || "",
                    )}
                  </div>
                )}
                {/* Round name */}
                <p className="text-sm mb-3 font-medium text-gray-900">
                  {round.roundMetadata.name}
                </p>
                {/* Round details */}
                <div className="grid sm:grid-cols-2">
                  {/* Application */}
                  {!isDirectRound(round) && (
                    <div
                      className="text-xs flex gap-1"
                      data-testid="round-application-dates"
                    >
                      <CalendarIcon className="h-5 w-5 text-grey-500" />
                      <span className="mt-[3px] text-grey-400">
                        Applications:
                      </span>
                      <div
                        className="mt-[3px] text-xs"
                        data-testid="application-time-period"
                      >
                        <span data-testid="application-start-time-period">
                          {parsedRoundInfo.application.iso.start}
                        </span>
                        &nbsp;
                        <span className="text-grey-400">
                          {parsedRoundInfo.application.utc.start}
                        </span>
                        <span className="mx-1">-</span>
                        <span data-testid="application-end-time-period">
                          {parsedRoundInfo.application.iso.end}
                        </span>
                        &nbsp;
                        <span className="text-grey-400">
                          {parsedRoundInfo.application.utc.end}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Round */}
                  <div
                    className="text-xs flex gap-1"
                    data-testid="round-round-dates"
                  >
                    <ClockIcon className="h-5 w-5 text-grey-500" />
                    <span className="mt-[3px] text-grey-400">Round:</span>
                    <div
                      className="mt-[3px] text-xs"
                      data-testid="round-time-period"
                    >
                      <span
                        className="mr-1"
                        data-testid="round-start-time-period"
                      >
                        {parsedRoundInfo.round.iso.start}
                      </span>
                      <span className="text-grey-400">
                        {parsedRoundInfo.round.utc.start}
                      </span>
                      <span className="mx-1">-</span>
                      <span
                        className="mr-1"
                        data-testid="round-end-time-period"
                      >
                        {parsedRoundInfo.round.iso.end}
                      </span>
                      <span className="text-grey-400">
                        {parsedRoundInfo.round.utc.end}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Status */}
              <div
                className={`text-xs h-[20px] inline-flex flex-col justify-center px-3 ml-auto mr-6
                  ${
                    getRoundDescriptionStatus(round) ===
                    "Applications not started"
                      ? "bg-moon-600 text-white"
                      : ""
                  }
                  ${
                    getRoundDescriptionStatus(round) ===
                    "Applications in progress"
                      ? "bg-violet-500 text-white"
                      : ""
                  }
                  ${
                    getRoundDescriptionStatus(round) === "Applications ended"
                      ? "bg-grey-100 text-gray-900"
                      : ""
                  }
                  ${
                    getRoundDescriptionStatus(round) === "Round in progress"
                      ? "bg-teal-100 text-gray-900"
                      : ""
                  }
                  ${
                    getRoundDescriptionStatus(round) === "Round ended"
                      ? "bg-pink-100 text-gray-900"
                      : ""
                  }
                `}
                style={{
                  borderRadius: "20px",
                }}
                data-testid="round-application-status-badge"
              >
                {getRoundDescriptionStatus(round)}
              </div>
              <ChevronRightIcon className="h-5 w-5 ml-auto" />
            </div>
          </Link>
        );
      })
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
    <div className="bg-[#F3F3F5] p-8 rounded">
      <div className="px-12 ml-10 mr-10">
        <div className="flex px-12 ml-10 mr-10 justify-center flex-col text-center">
          <RefreshIcon
            className="h-12 w-12 mt-8 mx-auto bg-white rounded-full p-3"
            aria-hidden="true"
          ></RefreshIcon>
          <h2 className="text-2xl my-4 pt-8">My Rounds</h2>
          <p
            className="text-grey-400 text-sm mb-8"
            data-testid="program-details-intro"
          >
            Manage date details and acceptance criteria for your Grant Program
            Round.
          </p>
          <div className="w-full px-12">
            <button
              onClick={() => setGrantType("quadraticFunding")}
              className={`flex w-full mb-4 rounded border  ${
                grantType === "quadraticFunding"
                  ? "border-violet-400 shadow-lg"
                  : "border-grey-100"
              } bg-white p-6 cursor-pointer`}
            >
              <div className="flex pr-6 m-auto">
                <div
                  className={`rounded-full border ${
                    grantType === "quadraticFunding"
                      ? "border-violet-400"
                      : "border-grey-100"
                  } h-[24px] w-[24px]`}
                  style={{
                    borderWidth:
                      grantType === "quadraticFunding" ? "6px" : "2px",
                  }}
                ></div>
              </div>
              <div className="pr-6 flex-grow text-left mt-auto mb-auto">
                <h3 className="text-xl mb-2">Quadratic Funding</h3>
                <p
                  className="text-grey-400 text-sm pr-4"
                  data-testid="program-details-intro"
                >
                  Choose this type of round for individual donors to determine
                  how matching funds should be allocated.
                </p>
              </div>
              <img
                src={QuadraticFundingSVG}
                alt="Quadratic Funding"
                className="object-cover pl-6 pr-4"
              />
            </button>
            <button
              onClick={() => setGrantType("directGrant")}
              className={`flex w-full rounded border  ${
                grantType === "directGrant"
                  ? "border-violet-400 shadow-lg"
                  : "border-grey-100"
              } bg-white p-6 cursor-pointer`}
            >
              <div className="flex pr-6 m-auto">
                <div
                  className={`rounded-full border ${
                    grantType === "directGrant"
                      ? "border-violet-400"
                      : "border-grey-100"
                  } h-[24px] w-[24px]`}
                  style={{
                    borderWidth: grantType === "directGrant" ? "6px" : "2px",
                  }}
                />
              </div>
              <div className="pr-6 flex-grow text-left mt-auto mb-auto">
                <h3 className="text-xl mb-2">Direct Grants</h3>
                <p
                  className="text-grey-400 text-sm pr-4"
                  data-testid="program-details-intro"
                >
                  Choose this type of round to directly allocate funds to
                  selected projects yourself.
                </p>
              </div>
              <img
                src={DirectGrants}
                alt="Direct Grants"
                className="object-cover pl-6 pr-4"
              />
            </button>
          </div>
          <div className="w-full px-12">
            <div className="border-t border-grey-100 h-[1px] mt-6 mb-6" />
            {grantType === "quadraticFunding" && (
              <Link to={`/round/create?programId=${programToRender?.id}`}>
                <Button className="px-4 w-full h-[48px]">
                  <PlusIcon
                    className="h-4 w-4 inline-flex -translate-y-0.5"
                    aria-hidden="true"
                  />
                  &nbsp;Create round
                </Button>
              </Link>
            )}
            {grantType === "directGrant" && (
              <Link
                to={`/round/create?programId=${programToRender?.id}&roundCategory=direct`}
              >
                <Button className="px-4 w-full h-[48px]">
                  <PlusIcon
                    className="h-4 w-4 inline-flex -translate-y-0.5"
                    aria-hidden="true"
                  />
                  &nbsp;Create round
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  return fetchProgramsStatus !== ProgressStatus.IS_SUCCESS ? (
    <Spinner text="We're fetching your Program." />
  ) : (
    <>
      {!programExists && <NotFoundPage />}
      {!hasAccess && <AccessDenied />}
      {programExists && hasAccess && (
        <>
          <Navbar programCta={true} />
          <div className="container mx-auto flex flex-col">
            <header className="flex flex-col justify-center border-b border-grey-100 pl-2 py-6">
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

            <main className="flex-grow flex flex-col">
              {fetchRoundStatus == ProgressStatus.IN_PROGRESS && (
                <Spinner text="We're fetching your Rounds." />
              )}
              {isRoundsFetched && roundItems.length > 0 && (
                <div className="px-2 py-3 md:py-6">
                  <div className="md:mb-8">
                    <div className="flex flex-row justify-between">
                      <p className="font-bold">My Rounds</p>
                      <span
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
                        className="text-violet-400 font-thin ml-auto mr-4 cursor-pointer"
                        data-testid="create-round-small-link"
                      >
                        <PlusSmIcon
                          className="h-5 w-5 inline -translate-y-0.5"
                          aria-hidden="true"
                        />
                        &nbsp;Create round
                      </span>
                    </div>
                    {roundItems}
                  </div>
                </div>
              )}
              {isRoundsFetched && roundItems.length === 0 && noRoundsGroup}
              <Transition.Root show={isModalOpen} as={Fragment}>
                <Dialog
                  as="div"
                  onClose={() => setIsModalOpen(false)}
                  className="relative z-10"
                >
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="fixed inset-0 bg-grey-400 bg-opacity-75 transition-opacity" />
                  </Transition.Child>
                  <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      >
                        <Dialog.Panel className="w-[1280px] max-w-[90%] relative bg-white px-4 pt-5 pb-4 text-left shadow-xl transform transition-all">
                          <button
                            className="w-[40px] h-[40px] cursor-pointer absolute right-[-20px] top-[-20px]"
                            onClick={() => setIsModalOpen(false)}
                          >
                            <img src={Close} alt="Close" />
                          </button>
                          <div className="flex-grow flex flex-col justify-center">
                            {noRoundsGroup}
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition.Root>
            </main>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}
