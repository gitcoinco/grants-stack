import { useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  getRoundStrategyTitle,
  getLocalTime,
  formatLocalDateAsISOString,
  getTokensByChainId,
  stringToBlobUrl,
  getChainById,
} from "common";
import { Input } from "common/src/styles";
import AlloV1 from "common/src/icons/AlloV1";
import AlloV2 from "common/src/icons/AlloV2";

import { ReactComponent as Search } from "../../../assets/search-grey.svg";

import { Project, Round } from "../../api/types";
import { getDaysLeft, isDirectRound, isInfiniteDate } from "../../api/utils";
import { PassportWidget } from "../../common/PassportWidget";

import RoundEndedBanner from "../../common/RoundEndedBanner";
import { Badge } from "../../common/styles";
import Breadcrumb, { BreadcrumbItem } from "../../common/Breadcrumb";

const builderURL = process.env.REACT_APP_BUILDER_URL;
import CartNotification from "../../common/CartNotification";
import { useAccount, useToken } from "wagmi";
import { getAddress } from "viem";
import { DefaultLayout } from "../../common/DefaultLayout";
import { getUnixTime } from "date-fns";
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";

import RoundStartCountdownBadge from "../RoundStartCountdownBadge";
import ApplicationsCountdownBanner from "../ApplicationsCountdownBanner";
import { ProjectList } from "./ProjectList";
import { RoundStatsTabContent } from "./RoundStatsTabContent";
import { RoundTabs } from "./RoundTabs";
import { getAlloVersion } from "common/src/config";

const alloVersion = getAlloVersion();

export function RoundPage(props: {
  round: Round;
  chainId: number;
  roundId: string;
  isBeforeRoundStartDate?: boolean;
  isAfterRoundStartDate?: boolean;
  isBeforeRoundEndDate?: boolean;
  isAfterRoundEndDate?: boolean;
}) {
  const { round, chainId, roundId } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>();
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>();
  const { address: walletAddress } = useAccount();
  const isSybilDefenseEnabled =
    round?.roundMetadata?.quadraticFundingConfig?.sybilDefense === true ||
    round?.roundMetadata?.quadraticFundingConfig?.sybilDefense !== "none";

  const [showCartNotification, setShowCartNotification] = useState(false);
  const [currentProjectAddedToCart, setCurrentProjectAddedToCart] =
    useState<Project>({} as Project);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  const disableAddToCartButton =
    (alloVersion === "allo-v2" && roundId.startsWith("0x")) ||
    props.isAfterRoundEndDate;

  const showProjectCardFooter =
    !isDirectRound(round) && props.isAfterRoundStartDate;

  useEffect(() => {
    if (showCartNotification) {
      setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
    }
  }, [showCartNotification]);

  const renderCartNotification = () => {
    return (
      <CartNotification
        showCartNotification={showCartNotification}
        setShowCartNotification={setShowCartNotification}
        currentProjectAddedToCart={currentProjectAddedToCart}
      />
    );
  };

  useEffect(() => {
    let projects = round?.approvedProjects;

    // shuffle projects
    projects = projects?.sort(() => Math.random() - 0.5);
    setRandomizedProjects(projects);
    setProjects(projects);
    setIsProjectsLoading(false);
  }, [round]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(searchQuery),
        300
      );
      return () => clearTimeout(timeOutId);
    } else {
      setProjects(randomizedProjects);
      setIsProjectsLoading(false);
    }
  });

  const filterProjectsByTitle = (query: string) => {
    // filter by exact title matches first
    // e.g if searchString is "ether" then "ether grant" comes before "ethereum grant"
    const projects = round?.approvedProjects;

    const exactMatches = projects?.filter(
      (project) =>
        project.projectMetadata.title.toLocaleLowerCase() ===
        query.toLocaleLowerCase()
    );
    const nonExactMatches = projects?.filter(
      (project) =>
        project.projectMetadata.title
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) &&
        project.projectMetadata.title.toLocaleLowerCase() !==
          query.toLocaleLowerCase()
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setProjects([...exactMatches!, ...nonExactMatches!]);
    setIsProjectsLoading(false);
  };

  const { data } = useToken({
    address: getAddress(props.round.token),
    chainId: Number(props.chainId),
  });

  const nativePayoutToken = getTokensByChainId(props.chainId).find(
    (t) => t.address === getAddress(props.round.token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.code ?? "ETH",
  };

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: round.roundMetadata?.name,
      path: `/round/${chainId}/${roundId}`,
    },
  ] as BreadcrumbItem[];

  const applicationURL = `${builderURL}/#/chains/${chainId}/rounds/${roundId}`;
  const currentTime = new Date();
  const isBeforeApplicationEndDate =
    round &&
    (isInfiniteDate(round.applicationsEndTime) ||
      round.applicationsEndTime >= currentTime);

  const isAlloV1 = roundId.startsWith("0x");

  const getRoundEndsText = () => {
    if (!round.roundEndTime) return;

    const roundEndsIn =
      round.roundEndTime === undefined
        ? undefined
        : getDaysLeft(getUnixTime(round.roundEndTime).toString());

    if (roundEndsIn === undefined || roundEndsIn < 0) return;

    if (roundEndsIn === 0) return "Ends today";

    return `${roundEndsIn} ${roundEndsIn === 1 ? "day" : "days"} left`;
  };

  const roundEndsText = getRoundEndsText();

  const handleTabChange = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  const projectDetailsTabs = useMemo(() => {
    const projectsTab = {
      name: isDirectRound(round)
        ? "Approved Projects"
        : `All Projects (${projects?.length ?? 0})`,
      content: (
        <>
          <ProjectList
            projects={projects}
            roundRoutePath={`/round/${chainId}/${roundId}`}
            showProjectCardFooter={showProjectCardFooter}
            isBeforeRoundEndDate={!disableAddToCartButton}
            roundId={roundId}
            isProjectsLoading={isProjectsLoading}
            round={round}
            chainId={chainId}
            setCurrentProjectAddedToCart={setCurrentProjectAddedToCart}
            setShowCartNotification={setShowCartNotification}
          />
        </>
      ),
    };
    const statsTab = {
      name: props.isBeforeRoundEndDate ? "Stats" : "Results",
      icon: PresentationChartBarIcon,
      content: (
        <>
          <RoundStatsTabContent
            roundId={roundId}
            round={round}
            chainId={chainId}
            token={nativePayoutToken}
            tokenSymbol={tokenData.symbol}
          />
        </>
      ),
    };

    return [projectsTab, statsTab];
  }, [
    projects,
    round,
    props.isBeforeRoundEndDate,
    chainId,
    disableAddToCartButton,
    isProjectsLoading,
    nativePayoutToken,
    roundId,
    tokenData.symbol,
    showProjectCardFooter,
  ]);

  const roundStart = isDirectRound(round)
    ? round.applicationsStartTime
    : round.roundStartTime;
  const roundEnd = isDirectRound(round)
    ? round.applicationsEndTime
    : round.roundEndTime;

  const chain = getChainById(chainId);

  return (
    <>
      <DefaultLayout>
        {showCartNotification && renderCartNotification()}
        {props.isAfterRoundEndDate && (
          <div className="relative top-6">
            <RoundEndedBanner />
          </div>
        )}
        <div className="flex flex-row justify-between mb-2 mt-8">
          <div
            className="flex flex-col pt-2 justify-center"
            data-testid="bread-crumbs"
          >
            <Breadcrumb items={breadCrumbs} />
          </div>
          {walletAddress && isSybilDefenseEnabled && (
            <div data-testid="passport-widget">
              <PassportWidget round={round} alignment="right" />
            </div>
          )}
        </div>

        <section>
          <div className="flex flex-col md:items-center md:justify-between md:gap-8 md:flex-row md:mb-0 mb-4">
            <div>
              <div className="pb-4">
                {isAlloV1 && <AlloV1 color="black" />}
                {!isAlloV1 && <AlloV2 color="black" />}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <h1
                  data-testid="round-title"
                  className="text-2xl sm:text-3xl font-modern-era-medium text-grey-500"
                >
                  {round.roundMetadata?.name}
                </h1>
                {props.isBeforeRoundStartDate ? (
                  <RoundStartCountdownBadge targetDate={roundStart} />
                ) : !props.isAfterRoundEndDate ? (
                  <Badge
                    color="blue"
                    rounded="full"
                    className="flex-shrink-0 px-2.5 font-modern-era-bold"
                  >
                    {roundEndsText}
                  </Badge>
                ) : (
                  <Badge
                    color="orange"
                    rounded="full"
                    className="flex-shrink-0 px-2.5"
                  >
                    Round ended
                  </Badge>
                )}
              </div>

              <Badge
                color="grey"
                rounded="full"
                data-testid="round-badge"
                className=" text-gray-900 inline-flex px-2.5 mb-4"
              >
                <span>
                  {round.payoutStrategy?.strategyName &&
                    getRoundStrategyTitle(round.payoutStrategy?.strategyName)}
                </span>
              </Badge>

              <div className="text-grey-400 flex gap-2 mb-2">
                <span>on</span>
                <div className="flex items-center">
                  <img
                    className="w-4 h-4 mt-0.5 mr-1"
                    src={stringToBlobUrl(chain.icon)}
                    alt="Round Chain Logo"
                  />
                  <span>{chain.prettyName}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-grey-500 mb-4">
                {isBeforeApplicationEndDate && (
                  <p
                    data-testId={"application-period"}
                    className="mr-4 flex items-center"
                  >
                    <span className="mr-2">Apply</span>
                    <CalendarIcon className="w-4 h-4 !text-grey-400 inline-block mr-2" />
                    <span>
                      <span className="px-2 rounded bg-grey-50">
                        <span className="mr-1">
                          {formatLocalDateAsISOString(
                            round.applicationsStartTime
                          )}
                        </span>
                        <span>{getLocalTime(round.applicationsStartTime)}</span>
                      </span>
                      <span className="px-1.5">-</span>
                      <span className="px-2 rounded bg-grey-50">
                        {!isInfiniteDate(roundEnd) ? (
                          <>
                            <span className="mr-1">
                              {formatLocalDateAsISOString(
                                round.applicationsEndTime
                              )}
                            </span>

                            <span>{getLocalTime(roundEnd)}</span>
                          </>
                        ) : (
                          <span>No End Date</span>
                        )}
                      </span>
                    </span>
                  </p>
                )}
                {!isDirectRound(round) && (
                  <p
                    data-testId={"round-period"}
                    className="mr-4 flex items-center"
                  >
                    <span className="mr-2">Donate</span>
                    <CalendarIcon className="w-4 h-4 !text-grey-400 inline-block mr-2" />
                    <span>
                      <span className="px-2 rounded bg-grey-50">
                        <span className="mr-1">
                          {formatLocalDateAsISOString(roundStart)}
                        </span>
                        <span>{getLocalTime(roundStart)}</span>
                      </span>
                      <span className="px-1.5">-</span>
                      <span className="px-2 rounded bg-grey-50">
                        {!isInfiniteDate(roundEnd) ? (
                          <>
                            <span className="mr-1">
                              {formatLocalDateAsISOString(roundEnd)}
                            </span>

                            <span>{getLocalTime(roundEnd)}</span>
                          </>
                        ) : (
                          <span>No End Date</span>
                        )}
                      </span>
                    </span>
                  </p>
                )}
              </div>
            </div>

            {!isDirectRound(round) && (
              <div
                data-testId={"matching-funds"}
                className="bg-grey-50 p-8 rounded-2xl"
              >
                <p className="text-3xl mb-2 font-mono tracking-tighter">
                  {round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toLocaleString()}
                  &nbsp;
                  {tokenData?.symbol ?? "..."}
                </p>
                <p>Matching Pool</p>
              </div>
            )}
          </div>

          <p className="mb-4 overflow-x-auto">
            {round.roundMetadata?.eligibility?.description}
          </p>
        </section>
        <hr className="mt-4 mb-8" />

        <div className="flex flex-col items-center gap-8">
          {isBeforeApplicationEndDate && (
            <ApplicationsCountdownBanner
              startDate={round.applicationsStartTime}
              endDate={round.applicationsEndTime}
              applicationURL={applicationURL}
            />
          )}

          <div className="mb-2 flex flex-col lg:flex-row w-full justify-between gap-2">
            <RoundTabs
              tabs={projectDetailsTabs}
              selected={selectedTab}
              onChange={handleTabChange}
            />
            {selectedTab === 0 && (
              <div className="relative">
                <Search className="absolute h-4 w-4 mt-3 ml-3 " />
                <Input
                  className="w-full lg:w-64 h-8 rounded-full pl-10 font-mono"
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                />
              </div>
            )}
          </div>

          <div>{projectDetailsTabs[selectedTab].content}</div>
        </div>
      </DefaultLayout>
    </>
  );
}
