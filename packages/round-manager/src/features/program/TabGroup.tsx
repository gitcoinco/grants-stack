"use client";

import { Fragment, useState, Key } from "react";
import { classNames, getStatusStyle, prettyDates3 } from "../common/Utils";
import { PlusIcon, PlusSmIcon } from "@heroicons/react/solid";
import Close from "../../assets/close.svg";
import DirectGrants from "../../assets/direct-grants.svg";
import QuadraticFundingSVG from "../../assets/quadratic-funding.svg";
import { getChainById, stringToBlobUrl } from "common";
import { getAlloVersion } from "common/src/config";
import { Button } from "common/src/styles";
import { Link, useParams } from "react-router-dom";
import { RoundCard } from "../round/RoundCard";
import { datadogLogs } from "@datadog/browser-logs";
import { useProgramById } from "../../context/program/ReadProgramContext";
import { ViewManageProgram } from "./ViewManageProgram";
import { useRounds } from "../../context/round/RoundContext";
import { ProgressStatus, Round } from "../api/types";
import { Transition, Dialog } from "@headlessui/react";
import { useAccount } from "wagmi";

const tabs = [
  { name: "Quadratic funding", current: true },
  { name: "Direct grants", current: false },
  { name: "Settings", current: false},
];

export const TabGroup = () => {
  datadogLogs.logger.info("====> Route: /program/:id/TabGroup.tsx");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, id: programId } = useParams() as {
    chainId?: string;
    id: string;
  };
  const { chain, address } = useAccount();
  const programChainId = chainId ? Number(chainId) : chain?.id;
  const { program: programToRender } = useProgramById(programId);
  const { data: rounds, fetchRoundStatus } = useRounds(
    programChainId as number,
    programId
  );
  const isRoundsFetched = fetchRoundStatus == ProgressStatus.IS_SUCCESS;
  const [grantType, setGrantType] = useState<
    "quadraticFunding" | "directGrant" | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabs[0].name);

  const handleTabChange = (tabName: string) => {
    setCurrentTab(tabName);
  };

  const qfRounds = rounds.filter(
    (round: Round) =>
      round?.strategyName ===
      "allov2.DonationVotingMerkleDistributionDirectTransferStrategy"
  );
  const qfRoundItems = qfRounds
    ? qfRounds.map((round: Round, index: Key | null | undefined) => {
        if (!round.chainId) return;

        const chain = getChainById(round.chainId);
        const status = getStatusStyle(round);

        return (
          <Link to={`/chain/${round.chainId}/round/${round.id}`} key={index}>
            <RoundCard
              key={`${round.id}-${index}`}
              title={round.roundMetadata.name}
              description={"Quadratic funding"}
              color={"green-100"}
              status={status}
              strategyType="quadratic"
              displayBar={{
                applicationDate: prettyDates3(round.applicationsStartTime, round.applicationsEndTime),
                roundDate: prettyDates3(
                  round.roundStartTime,
                  round.roundEndTime
                ),
                matchingFunds: "",
              }}
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
        );
      })
    : [];

  const dgRounds = rounds.filter(
    (round: Round) => round?.strategyName === "allov2.DirectGrantsLiteStrategy"
  );
  const dgRoundItems = dgRounds
    ? dgRounds.map((round: Round, index: Key | null | undefined) => {
        if (!round.chainId) return;

        const chain = getChainById(round.chainId);
        const status = getStatusStyle(round);

        return (
          <Link to={`/round/${round.id}`} key={index}>
            <RoundCard
              key={`${round.id}-${index}`}
              title={round.roundMetadata.name}
              description={"Direct grants"}
              color={"yellow-100"}
              status={status}
              strategyType="direct"
              displayBar={{
                applicationDate: "",
                roundDate: prettyDates3(
                  round.roundStartTime,
                  round.roundEndTime
                ),
                matchingFunds: "",
              }}
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
        );
      })
    : [];

  const noRoundsGroup = (
    <div className="bg-[#F3F3F5] p-8 rounded">
      <div className="px-12 ml-10 mr-10">
        <div className="flex px-12 ml-10 mr-10 justify-center flex-col text-center">
          <h2 className="text-2xl my-4 pt-8">My Rounds</h2>
          <p
            className="text-grey-400 text-sm mb-8"
            data-testid="program-details-intro"
          >
            Manage date details and acceptance criteria for your Grant Program
            Round.
          </p>
          <div className="w-full px-12">
            {getAlloVersion() === "allo-v2" && (
              <>
                <button
                  onClick={() => setGrantType("quadraticFunding")}
                  className={`flex w-full mb-4 rounded border  ${
                    grantType === "quadraticFunding"
                      ? "border-yellow-100"
                      : "border-grey-100"
                  } bg-white p-6 cursor-pointer`}
                >
                  <div className="flex pr-6 m-auto">
                    <div
                      className={`rounded-full border ${
                        grantType === "quadraticFunding"
                          ? "border-yellow-100"
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
                      Choose this type of round for individual donors to
                      determine how matching funds should be allocated.
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
                      ? "border-green-200"
                      : "border-grey-100"
                  } bg-white p-6 cursor-pointer`}
                >
                  <div className="flex pr-6 m-auto">
                    <div
                      className={`rounded-full border ${
                        grantType === "directGrant"
                          ? "border-green-200"
                          : "border-grey-100"
                      } h-[24px] w-[24px]`}
                      style={{
                        borderWidth:
                          grantType === "directGrant" ? "6px" : "2px",
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
              </>
            )}
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

  return (
    <>
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a round type
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md py-2 pl-3 pr-10 font-mono focus:border-grey-500 focus:outline-none focus:ring-grey-500 text-lg"
            value={currentTab}
            onChange={(e) => handleTabChange(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.name} value={tab.name}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="">
            <nav
              className="-mb-px flex flex-row items-center justify-between cursor-pointer"
              aria-label="Tabs"
            >
              <div className="flex flex-row items-center justify-start">
                {tabs.map((tab) => (
                  <span
                    key={tab.name}
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange(tab.name);
                    }}
                    className={classNames(
                      tab.name === currentTab
                        ? "border-grey-500 border-b-2 text-grey-500 mr-8"
                        : "text-grey-400 hover:border-b-2 hover:text-grey-700 mr-8",
                      "items-center whitespace-nowrap px-1 py-4 text-sm font-medium"
                    )}
                    aria-current={tab.name === currentTab ? "page" : undefined}
                  >
                    <span>{tab.name}</span>
                    {["Quadratic funding", "Direct grants"].includes(tab.name) &&
                      <span
                        className={`py-1 px-2 mx-2 bg-${tab.name === "Quadratic funding" ? "green" : "yellow"}-100 rounded-full text-xs font-mono`}
                      >
                        {tab.name === "Quadratic funding" ? qfRounds.length : dgRounds.length}
                      </span>
                    }
                  </span>
                ))}
              </div>
              <div className="flex flex-row items-center">
                {programToRender?.tags?.includes(getAlloVersion()) && (
                  <span
                    onClick={() => {
                      setIsModalOpen(true);
                    }}
                    className="flex flex-row justify-between items-center hover:shadow-md p-2 rounded-lg text-sm text-grey-500 font-mono ml-auto bg-yellow-100 cursor-pointer"
                    data-testid="create-round-small-link"
                  >
                    <PlusSmIcon
                      className="h-5 w-5 inline ml-1"
                      aria-hidden="true"
                    />
                    <span className="mr-2">Create round</span>
                  </span>
                )}
              </div>
            </nav>
          </div>
        </div>
        <div>
          {currentTab === "Quadratic funding" && (
            <div>
              {/* Content for Quadratic funding */}
              <div className="md:mb-8">{qfRoundItems}</div>
            </div>
          )}
          {currentTab === "Direct grants" && (
            <div>
              {/* Content for Direct grants */}
              <div className="md:mb-8">{dgRoundItems}</div>
            </div>
          )}
          { currentTab === "Settings" && (
            <ViewManageProgram program={programToRender!} userAddress={address || "0x"} />
          )}
        </div>
      </div>
      {isRoundsFetched &&
        rounds.length === 0 &&
        programToRender?.tags?.includes(getAlloVersion()) &&
        currentTab !== "Settings" &&
        noRoundsGroup
      }
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
                <Dialog.Panel className="w-[1280px] max-w-[90%] relative bg-white px-4 pt-5 pb-4 text-left transform transition-all">
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
    </>
  );
};
