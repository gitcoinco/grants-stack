import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import {
  ComponentPropsWithRef,
  FunctionComponent,
  createElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarIcon,
  getRoundStrategyTitle,
  getLocalTime,
  formatLocalDateAsISOString,
  renderToPlainText,
  useTokenPrice,
  TToken,
  getTokensByChainId,
  stringToBlobUrl,
  getChainById,
} from "common";
import { Input } from "common/src/styles";
import AlloV1 from "common/src/icons/AlloV1";
import AlloV2 from "common/src/icons/AlloV2";

import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { ReactComponent as Search } from "../../assets/search-grey.svg";
import { ReactComponent as WarpcastIcon } from "../../assets/warpcast-logo.svg";
import { ReactComponent as TwitterBlueIcon } from "../../assets/x-logo.svg";

import { useRoundById } from "../../context/RoundContext";
import { CartProject, Project, Round } from "../api/types";
import { getDaysLeft, isDirectRound, isInfiniteDate } from "../api/utils";
import { PassportWidget } from "../common/PassportWidget";

import NotFoundPage from "../common/NotFoundPage";
import { ProjectBanner, ProjectLogo } from "../common/ProjectBanner";
import RoundEndedBanner from "../common/RoundEndedBanner";
import { Spinner } from "../common/Spinner";
import {
  Badge,
  BasicCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../common/styles";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";

const builderURL = process.env.REACT_APP_BUILDER_URL;
import CartNotification from "../common/CartNotification";
import { useCartStorage } from "../../store";
import { useAccount, useToken } from "wagmi";
import { getAddress } from "viem";
import { getAlloVersion } from "common/src/config";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { DefaultLayout } from "../common/DefaultLayout";
import { getUnixTime } from "date-fns";
import { Application, useDataLayer } from "data-layer";
import { useRoundApprovedApplications } from "../projects/hooks/useRoundApplications";
import {
  LinkIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";
import { Box, Tab, Tabs } from "@chakra-ui/react";
import GenericModal from "../common/GenericModal";
import RoundStartCountdownBadge from "./RoundStartCountdownBadge";
import ApplicationsCountdownBanner from "./ApplicationsCountdownBanner";

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const { round, isLoading } = useRoundById(
    Number(chainId),
    roundId?.toLowerCase() as string
  );

  const currentTime = new Date();
  const isBeforeRoundStartDate =
    round &&
    (isDirectRound(round)
      ? round.applicationsStartTime
      : round.roundStartTime) >= currentTime;
  const isAfterRoundStartDate =
    round &&
    (isDirectRound(round)
      ? round.applicationsStartTime
      : round.roundStartTime) <= currentTime;
  // covers infinte dates for roundEndDate
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(
      isDirectRound(round) ? round.applicationsEndTime : round.roundEndTime
    )
      ? false
      : round &&
        (isDirectRound(round)
          ? round.applicationsEndTime
          : round.roundEndTime) <= currentTime);
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(
      isDirectRound(round) ? round.applicationsEndTime : round.roundEndTime
    ) ||
      (isDirectRound(round) ? round.applicationsEndTime : round.roundEndTime) >
        currentTime);

  const alloVersion = getAlloVersion();

  useEffect(() => {
    if (
      isAfterRoundEndDate !== undefined &&
      roundId?.startsWith("0x") &&
      alloVersion === "allo-v2" &&
      !isAfterRoundEndDate
    ) {
      window.location.href = `https://explorer-v1.gitcoin.co${window.location.pathname}${window.location.hash}`;
    }
  }, [roundId, alloVersion, isAfterRoundEndDate]);

  console.log("round", round, "chainId", chainId, "roundId", roundId);

  return isLoading ? (
    <Spinner text="We're fetching the Round." />
  ) : (
    <>
      {round && chainId && roundId ? (
        <RoundPage
          round={round}
          chainId={Number(chainId)}
          roundId={roundId}
          isBeforeRoundStartDate={isBeforeRoundStartDate}
          isAfterRoundStartDate={isAfterRoundStartDate}
          isBeforeRoundEndDate={isBeforeRoundEndDate}
          isAfterRoundEndDate={isAfterRoundEndDate}
        />
      ) : (
        <NotFoundPage />
      )}
    </>
  );
}

export function AlloVersionBanner({ roundId }: { roundId: string }) {
  const isAlloV1 = roundId.startsWith("0x");

  return (
    <>
      <div className="fixed z-20 left-0 top-[64px] w-full bg-[#FFEFBE] p-4 text-center font-medium flex items-center justify-center">
        <ExclamationCircleIcon className="h-5 w-5 mr-2" />
        <span>
          This round has been deployed on Allo {isAlloV1 ? "v1" : "v2"}. Any
          projects that you add to your cart will have to be donated to
          separately from projects on rounds deployed on Allo{" "}
          {isAlloV1 ? "v2" : "v1"}. Learn more{" "}
          <a href="#" target="_blank" rel="noreferrer" className="underline">
            here
          </a>
          .
        </span>
      </div>
      <div className="h-[64px] w-full"></div>
    </>
  );
}

const alloVersion = getAlloVersion();

function RoundPage(props: {
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

  console.log("round", round, "chainId", chainId, "roundId", roundId);

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

type Tab = {
  name: string;
  icon?: FunctionComponent<ComponentPropsWithRef<"svg">>;
  content: JSX.Element;
};

function RoundTabs(props: {
  tabs: Tab[];
  onChange?: (tabIndex: number) => void;
  selected: number;
}) {
  return (
    <Box className="font-modern-era-medium" bottom={0.5}>
      {props.tabs.length > 0 && (
        <Tabs
          display="flex"
          gap={8}
          defaultIndex={props.selected}
          onChange={props.onChange}
        >
          {props.tabs.map((tab, index) => (
            <Tab
              color={"blackAlpha.600"}
              fontSize={"lg"}
              key={index}
              className="flex items-center gap-2"
              _selected={{ color: "black", borderBottom: "3px solid black" }}
            >
              {tab.icon && (
                <div>
                  {createElement(tab.icon, {
                    className: "w-4 h-4",
                  })}
                </div>
              )}
              {tab.name}
            </Tab>
          ))}
        </Tabs>
      )}
    </Box>
  );
}

const ProjectList = (props: {
  projects?: Project[];
  roundRoutePath: string;
  showProjectCardFooter?: boolean;
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: number;
  isProjectsLoading: boolean;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
  const { projects, roundRoutePath, chainId, roundId } = props;
  const dataLayer = useDataLayer();

  const { data: applications } = useRoundApprovedApplications(
    {
      chainId,
      roundId,
    },
    dataLayer
  );

  const applicationsMapByGrantApplicationId:
    | Map<string, Application>
    | undefined = useMemo(() => {
    if (!applications) return;
    const map: Map<string, Application> = new Map();
    applications.forEach((application) =>
      map.set(application.projectId, application)
    );
    return map;
  }, [applications]);

  return (
    <>
      <div className="grid gap-x-6 gap-y-12 gap-5 justify-around md:justify-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
        {props.isProjectsLoading ? (
          <>
            {Array(6)
              .fill("")
              .map((item, index) => (
                <BasicCard
                  key={index}
                  className="relative animate-pulse bg-grey-100"
                />
              ))}
          </>
        ) : projects?.length ? (
          <>
            {projects.map((project) => {
              return (
                <ProjectCard
                  key={project.projectRegistryId}
                  project={project}
                  roundRoutePath={roundRoutePath}
                  showProjectCardFooter={props.showProjectCardFooter}
                  isBeforeRoundEndDate={props.isBeforeRoundEndDate}
                  roundId={props.roundId}
                  round={props.round}
                  chainId={props.chainId}
                  setCurrentProjectAddedToCart={
                    props.setCurrentProjectAddedToCart
                  }
                  setShowCartNotification={props.setShowCartNotification}
                  crowdfundedUSD={
                    applicationsMapByGrantApplicationId?.get(
                      project.projectRegistryId
                    )?.totalAmountDonatedInUsd ?? 0
                  }
                  uniqueContributorsCount={
                    applicationsMapByGrantApplicationId?.get(
                      project.projectRegistryId
                    )?.uniqueDonorsCount ?? 0
                  }
                />
              );
            })}
          </>
        ) : (
          <p>No projects</p>
        )}
      </div>
    </>
  );
};

function ProjectCard(props: {
  project: Project;
  roundRoutePath: string;
  showProjectCardFooter?: boolean;
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: number;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
  crowdfundedUSD: number;
  uniqueContributorsCount: number;
}) {
  const { project, roundRoutePath } = props;
  const projectRecipient =
    project.recipient.slice(0, 5) + "..." + project.recipient.slice(-4);

  const { projects, add, remove } = useCartStorage();

  const isAlreadyInCart = projects.some(
    (cartProject) =>
      cartProject.chainId === Number(props.chainId) &&
      cartProject.grantApplicationId === project.grantApplicationId &&
      cartProject.roundId === props.roundId
  );

  const cartProject = project as CartProject;
  cartProject.roundId = props.roundId;
  cartProject.chainId = Number(props.chainId);

  return (
    <BasicCard
      className={`relative w-full ${props.showProjectCardFooter ? "h-[370px]" : "h-[310px]"}`}
      data-testid="project-card"
    >
      <Link
        to={`${roundRoutePath}/${project.grantApplicationId}`}
        data-testid="project-detail-link"
      >
        <CardHeader>
          <ProjectBanner
            bannerImgCid={project.projectMetadata.bannerImg ?? null}
            classNameOverride={
              "bg-black h-[108px] w-full object-cover rounded-t"
            }
            resizeHeight={108}
          />
        </CardHeader>

        <CardContent className="px-2 relative">
          {project.projectMetadata.logoImg && (
            <ProjectLogo
              imageCid={project.projectMetadata.logoImg}
              size={48}
              className="ml-2 border-solid border-2 border-white absolute  -top-[24px] "
            />
          )}
          <div>
            <CardTitle data-testid="project-title" className="text-xl">
              {project.projectMetadata.title}
            </CardTitle>
            <CardDescription
              className="mb-2 mt-0 !text-sm"
              data-testid="project-owner"
            >
              by <span className="font-mono">{projectRecipient}</span>
            </CardDescription>
          </div>
          <CardDescription
            data-testid="project-description"
            className={`mb-1 !text-sm`}
          >
            {renderToPlainText(project.projectMetadata.description)}
          </CardDescription>
        </CardContent>
      </Link>
      {props.showProjectCardFooter && (
        <CardFooter className="bg-white">
          <CardContent className="px-2 text-xs ">
            <div className="border-t pt-1 flex items-center justify-between ">
              <div>
                <p>
                  $
                  {props.crowdfundedUSD?.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-[11px] font-mono">
                  total raised by {props.uniqueContributorsCount} contributors
                </p>
              </div>
              {props.isBeforeRoundEndDate && (
                <CartButton
                  project={project}
                  isAlreadyInCart={isAlreadyInCart}
                  removeFromCart={() => {
                    remove(cartProject);
                  }}
                  addToCart={() => {
                    add(cartProject);
                  }}
                  setCurrentProjectAddedToCart={
                    props.setCurrentProjectAddedToCart
                  }
                  setShowCartNotification={props.setShowCartNotification}
                />
              )}
            </div>
          </CardContent>
        </CardFooter>
      )}
    </BasicCard>
  );
}

function CartButton(props: {
  project: Project;
  isAlreadyInCart: boolean;
  removeFromCart: () => void;
  addToCart: () => void;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div>
      <CartButtonToggle
        project={props.project}
        isAlreadyInCart={props.isAlreadyInCart}
        removeFromCart={props.removeFromCart}
        addToCart={props.addToCart}
        setCurrentProjectAddedToCart={props.setCurrentProjectAddedToCart}
        setShowCartNotification={props.setShowCartNotification}
      />
    </div>
  );
}

export function CartButtonToggle(props: {
  project: Project;
  isAlreadyInCart: boolean;
  addToCart: () => void;
  removeFromCart: () => void;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // if the project is not added, show the add to cart button
  // if the project is added to the cart, show the remove from cart button
  if (props.isAlreadyInCart) {
    return (
      <div
        className="cursor-pointer"
        data-testid="remove-from-cart"
        onClick={props.removeFromCart}
      >
        <CheckedCircleIcon className="w-10" />
      </div>
    );
  }
  return (
    <div
      className="cursor-pointer"
      data-testid="add-to-cart"
      // oonclick adds the project to the cart, sets the current project added to cart and shows the cart notification
      onClick={() => {
        props.addToCart();
        props.setCurrentProjectAddedToCart(props.project);
        props.setShowCartNotification(true);
      }}
    >
      <CartCircleIcon className="w-10" />
    </div>
  );
}

const RoundStatsTabContent = ({
  roundId,
  chainId,
  round,
  token,
  tokenSymbol,
}: {
  roundId: string;
  round: Round;
  chainId: number;
  token?: TToken;
  tokenSymbol?: string;
}): JSX.Element => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const dataLayer = useDataLayer();
  const { data: applications, isLoading: isGetApplicationsLoading } =
    useRoundApprovedApplications(
      {
        chainId,
        roundId,
      },
      dataLayer
    );

  const totalUSDCrowdfunded = useMemo(() => {
    return (
      applications
        ?.map((application) => application.totalAmountDonatedInUsd)
        .reduce((acc, amount) => acc + amount, 0) ?? 0
    );
  }, [applications]);

  const totalDonations = useMemo(() => {
    return (
      applications
        ?.map((application) => Number(application.totalDonationsCount ?? 0))
        .reduce((acc, amount) => acc + amount, 0) ?? 0
    );
  }, [applications]);

  const ShareModal = () => {
    const ShareModalBody = () => (
      <div className="items-center gap-y-2 gap-x-4 mt-10 w-full grid sm:grid-cols-2">
        <ShareButton
          round={round}
          tokenSymbol={tokenSymbol}
          totalUSDCrowdfunded={totalUSDCrowdfunded}
          totalDonations={totalDonations}
          type="TWITTER"
        />
        <ShareButton
          round={round}
          tokenSymbol={tokenSymbol}
          totalUSDCrowdfunded={totalUSDCrowdfunded}
          totalDonations={totalDonations}
          type="FARCASTER"
        />
      </div>
    );

    return (
      <GenericModal
        title="Share this round’s stats on social media!"
        titleSize={"lg"}
        body={<ShareModalBody />}
        isOpen={isShareModalOpen}
        setIsOpen={setIsShareModalOpen}
      />
    );
  };

  return (
    <>
      <section className="flex flex-col gap-10 sm:gap-16">
        <div className="w-full">
          <div className="flex justify-end items-center gap-2">
            <ShareStatsButton handleClick={() => setIsShareModalOpen(true)} />
          </div>
          <div className="max-w-[60rem] w-full m-auto mt-12">
            <Stats
              token={token}
              tokenSymbol={tokenSymbol}
              round={round}
              totalCrowdfunded={totalUSDCrowdfunded}
              totalDonations={totalDonations}
              totalDonors={round.uniqueDonorsCount ?? 0}
              totalProjects={applications?.length ?? 0}
              chainId={chainId}
              statsLoading={isGetApplicationsLoading}
            />
          </div>
        </div>

        <div className="max-w-[53rem] m-auto w-full bg-green-50 rounded-2xl py-8 px-2 flex justify-center items-center gap-8 flex-wrap">
          <p className="text-xl sm:text-2xl font-medium">
            Want to check out more stats?
          </p>
          <a
            href={`https://reportcards.gitcoin.co/${chainId}/${roundId}`}
            target="_blank"
            className="rounded-lg px-4 py-2.5 font-mono bg-green-200 hover:bg-green-300 text-white transition-all flex items-center justify-center gap-2"
            data-testid="share-results-footer"
          >
            <PresentationChartBarIcon className="w-4 h-4" />
            <span>Round report card</span>
          </a>
        </div>

        <ShareModal />
      </section>
    </>
  );
};

const formatAmount = (amount: string | number, noDigits?: boolean) => {
  return Number(amount).toLocaleString("en-US", {
    maximumFractionDigits: noDigits ? 0 : 2,
    minimumFractionDigits: noDigits ? 0 : 2,
  });
};

const Stats = ({
  round,
  totalCrowdfunded,
  totalProjects,
  token,
  tokenSymbol,
  totalDonations,
  totalDonors,
  statsLoading,
}: {
  round: Round;
  totalCrowdfunded: number;
  totalProjects: number;
  chainId: number;
  token?: TToken;
  tokenSymbol?: string;
  totalDonations: number;
  totalDonors: number;
  statsLoading: boolean;
}): JSX.Element => {
  const tokenAmount =
    round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable ?? 0;

  const { data: poolTokenPrice } = useTokenPrice(token?.redstoneTokenId);

  const matchingPoolUSD = poolTokenPrice
    ? Number(poolTokenPrice) * tokenAmount
    : undefined;
  const matchingCapPercent =
    round.roundMetadata?.quadraticFundingConfig?.matchingCapAmount ?? 0;
  const matchingCapTokenValue = (tokenAmount * matchingCapPercent) / 100;

  return (
    <div className="max-w-5xl m-auto w-full">
      <div className={`xl:grid-cols-3 grid grid-cols-2 gap-2 sm:gap-4`}>
        <StatCard
          statValue={`${formatAmount(tokenAmount, true)} ${tokenSymbol}`}
          secondaryStatValue={`${
            matchingPoolUSD ? `($${formatAmount(matchingPoolUSD ?? 0)})` : ""
          }`}
          statName="Matching Pool"
          isValueLoading={statsLoading}
        />
        <StatCard
          statValue={`$${formatAmount(totalCrowdfunded.toFixed(2))}`}
          statName="Total USD Crowdfunded"
          isValueLoading={statsLoading}
        />
        {!!matchingCapPercent && (
          <StatCard
            statValue={`${matchingCapPercent.toFixed()}% `}
            secondaryStatValue={`(${formatAmount(
              matchingCapTokenValue,
              true
            )} ${tokenSymbol})`}
            statName="Matching Cap"
            isValueLoading={statsLoading}
          />
        )}

        <StatCard
          statValue={formatAmount(totalProjects, true)}
          statName="Total Projects"
          isValueLoading={statsLoading}
        />

        <StatCard
          statValue={formatAmount(totalDonations, true)}
          statName="Total Donations"
          isValueLoading={statsLoading}
        />
        <StatCard
          statValue={formatAmount(totalDonors, true)}
          statName="Total Donors"
          isValueLoading={statsLoading}
        />
      </div>
    </div>
  );
};

const StatCard = ({
  statValue,
  secondaryStatValue,
  statName,
  isValueLoading,
}: {
  statValue: string;
  secondaryStatValue?: string;
  statName: string;
  isValueLoading?: boolean;
}): JSX.Element => {
  return (
    <div className="bg-grey-50 p-4 sm:p-6 rounded-2xl flex flex-col justify-between w-full">
      {isValueLoading ? (
        <div className="w-[80%] rounded text-5 sm:h-9 mb-4 bg-grey-200 animate-pulse" />
      ) : (
        <div className="pb-4">
          <p className="text-xl sm:text-3xl font-mono prose tracking-tighter">
            {statValue}
          </p>
          {!!secondaryStatValue?.length && (
            <p className="text-sm font-mono font-medium prose tracking-tighter">
              {secondaryStatValue}
            </p>
          )}
        </div>
      )}

      <p className="text-sm text-grey-400 font-bold max-w-[20ch]">{statName}</p>
    </div>
  );
};

const ShareButton = ({
  round,
  tokenSymbol,
  totalUSDCrowdfunded,
  totalDonations,
  type,
}: {
  round: Round;
  tokenSymbol?: string;
  totalUSDCrowdfunded: number;
  totalDonations: number;

  type: "TWITTER" | "FARCASTER";
}) => {
  const roundName = round.roundMetadata?.name;
  const tokenAmount =
    round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable ?? 0;

  const shareText = `🌐 ${formatAmount(
    tokenAmount,
    true
  )} ${tokenSymbol} matching pool
📈 $${formatAmount(totalUSDCrowdfunded.toFixed(2))} funded so far
🤝 ${formatAmount(totalDonations, true)} donations
👀 Check out ${roundName}’s stats!
${window.location.href}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;

  const farcasterShareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
    shareText
  )}`;

  return (
    <>
      {type === "TWITTER" ? (
        <button
          type="button"
          onClick={() => window.open(twitterShareUrl, "_blank")}
          className="w-full flex items-center justify-center gap-2 font-mono hover:opacity-70 transition-all shadow-sm border px-4 py-2 rounded-lg border-black hover:shadow-md"
        >
          <TwitterBlueIcon className="h-6" />
          <span className="flex-shrink-0 text-sm">Share on X</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.open(farcasterShareUrl, "_blank")}
          className="w-full flex items-center justify-center gap-2 font-mono hover:opacity-70 transition-all shadow-sm border px-4 py-2 rounded-lg border-black hover:shadow-md"
        >
          <span>
            <WarpcastIcon className="h-6" />
          </span>
          <span className="flex-shrink-0 text-sm">Share on Warpcast</span>
        </button>
      )}
    </>
  );
};

const ShareStatsButton = ({
  handleClick,
}: {
  handleClick: () => void;
}): JSX.Element => {
  return (
    <button
      onClick={handleClick}
      className="rounded-lg px-4 py-2.5 font-mono sm:text-lg bg-green-200 hover:bg-green-300 text-white transition-all flex items-center justify-center gap-2"
      data-testid="share-results-footer"
    >
      <LinkIcon className="w-4 h-4" />
      Share
    </button>
  );
};
