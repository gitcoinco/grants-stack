import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRoundStrategyTitle } from "common";

import {
  ChainId,
  formatUTCDateAsISOString,
  getUTCTime,
  getLocalTime,
  renderToPlainText,
  truncateDescription,
} from "common";
import { Button, Input } from "common/src/styles";
import AlloV1 from "common/src/icons/AlloV1";
import AlloV2 from "common/src/icons/AlloV2";

import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { ReactComponent as Search } from "../../assets/search-grey.svg";

import { useRoundById } from "../../context/RoundContext";
import { CartProject, Project, Requirement, Round } from "../api/types";
import {
  CHAINS,
  isDirectRound,
  isInfiniteDate,
  votingTokens,
} from "../api/utils";
import { PassportWidget } from "../common/PassportWidget";

import Footer from "common/src/components/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { ProjectBanner } from "../common/ProjectBanner";
import RoundEndedBanner from "../common/RoundEndedBanner";
import { Spinner } from "../common/Spinner";
import {
  BasicCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardsContainer,
} from "../common/styles";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";

const builderURL = process.env.REACT_APP_BUILDER_URL;
import CartNotification from "../common/CartNotification";
import { useCartStorage } from "../../store";
import { useAccount, useToken } from "wagmi";
import { getAddress } from "viem";
import { getAlloVersion } from "common/src/config";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const { round, isLoading } = useRoundById(
    Number(chainId),
    roundId?.toLowerCase() as string
  );

  const currentTime = new Date();
  const isBeforeRoundStartDate = round && round.roundStartTime >= currentTime;
  const isAfterRoundStartDate = round && round.roundStartTime <= currentTime;
  // covers infinte dates for roundEndDate
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime)
      ? false
      : round && round.roundEndTime <= currentTime);
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > currentTime);

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

  return isLoading ? (
    <Spinner text="We're fetching the Round." />
  ) : (
    <>
      {round && chainId && roundId ? (
        <>
          {isBeforeRoundStartDate && (
            <BeforeRoundStart
              round={round}
              chainId={chainId}
              roundId={roundId}
            />
          )}

          {isAfterRoundStartDate && (
            <AfterRoundStart
              round={round}
              chainId={Number(chainId)}
              roundId={roundId}
              isBeforeRoundEndDate={isBeforeRoundEndDate}
              isAfterRoundEndDate={isAfterRoundEndDate}
            />
          )}
        </>
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

function BeforeRoundStart(props: {
  round: Round;
  chainId: string;
  roundId: string;
}) {
  const { round, chainId, roundId } = props;

  return (
    <>
      <Navbar customBackground="bg-[#F0F0F0]" />
      <div className="relative top-16 px-4 pt-7 h-screen bg-gradient-to-b from-[#F0F0F0] to-[#FFFFFF] h-full">
        <main>
          <PreRoundPage
            round={round}
            chainId={chainId}
            roundId={roundId}
            element={(req: Requirement, index) => (
              <li key={index}>{req.requirement}</li>
            )}
          />
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
}

const alloVersion = getAlloVersion();

function AfterRoundStart(props: {
  round: Round;
  chainId: ChainId;
  roundId: string;
  isBeforeRoundEndDate?: boolean;
  isAfterRoundEndDate?: boolean;
}) {
  const { round, chainId, roundId } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>();
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>();
  const { address: walletAddress } = useAccount();
  const isSybilDefenseEnabled =
    round.roundMetadata?.quadraticFundingConfig?.sybilDefense === true;

  const [showCartNotification, setShowCartNotification] = useState(false);
  const [currentProjectAddedToCart, setCurrentProjectAddedToCart] =
    useState<Project>({} as Project);

  const disableAddToCartButton =
    (alloVersion === "allo-v2" && roundId.startsWith("0x")) ||
    props.isAfterRoundEndDate;

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
  };

  const { data } = useToken({
    address: getAddress(props.round.token),
    chainId: Number(props.chainId),
  });

  const nativePayoutToken = votingTokens.find(
    (t) =>
      t.chainId === Number(props.chainId) &&
      t.address === getAddress(props.round.token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
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

  return (
    <>
      {showCartNotification && renderCartNotification()}
      <Navbar />
      {props.isBeforeRoundEndDate && <AlloVersionBanner roundId={roundId} />}
      {props.isAfterRoundEndDate && (
        <div className="relative top-16">
          <RoundEndedBanner />
        </div>
      )}
      <div className="relative top-20 lg:mx-20 px-4 py-7 h-screen">
        <div className="flex flex-row justify-between mb-2">
          <div className="flex flex-col pt-2" data-testid="bread-crumbs">
            <Breadcrumb items={breadCrumbs} />
          </div>
          {walletAddress && isSybilDefenseEnabled && (
            <div data-testid="passport-widget">
              <PassportWidget round={round} alignment="right" />
            </div>
          )}
        </div>
        <main>
          <div className="flex flex-col md:items-center md:justify-between md:gap-8 md:flex-row md:mb-0 mb-4">
            <div>
              <div className="pb-4">
                {isAlloV1 && <AlloV1 color="black" />}
                {!isAlloV1 && <AlloV2 color="black" />}
              </div>
              <p data-testid="round-title" className="text-3xl mb-5">
                {round.roundMetadata?.name}
              </p>
              <p
                data-testid="round-badge"
                className="text-sm text-gray-900 h-[20px] inline-flex flex-col justify-center bg-grey-100 px-3 mb-4 rounded-[20px]"
              >
                {round.payoutStrategy?.strategyName &&
                  getRoundStrategyTitle(round.payoutStrategy?.strategyName)}
              </p>
              <div className="flex text-grey-400 mb-1">
                <p className="mr-4 text-sm">
                  <span className="mr-1">Round starts on:</span>
                  <span className="mr-1">
                    {formatUTCDateAsISOString(round.roundStartTime)}
                  </span>
                  <span>{getUTCTime(round.roundStartTime)}</span>
                </p>
                <p className="text-sm">
                  <span className="mr-1">Round ends on:</span>

                  {!isInfiniteDate(round.roundEndTime) && (
                    <>
                      <span className="mr-1">
                        {formatUTCDateAsISOString(round.roundEndTime)}
                      </span>

                      <span>{getUTCTime(round.roundEndTime)}</span>
                    </>
                  )}
                  {isInfiniteDate(round.roundEndTime) && (
                    <>
                      <span>No End Date</span>
                    </>
                  )}
                </p>
              </div>

              <div className="text-grey-400 text-sm flex gap-2 mb-4">
                <span>Deployed on:</span>
                <div className="flex">
                  <img
                    className="w-4 h-4 mt-0.5 mr-1"
                    src={CHAINS[chainId]?.logo}
                    alt="Round Chain Logo"
                  />
                  <span>{CHAINS[chainId]?.name}</span>
                </div>
              </div>

              {!isDirectRound(round) && (
                <p className="text-1xl mb-4">
                  Matching funds available: &nbsp;
                  {round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toLocaleString()}
                  &nbsp;
                  {tokenData?.symbol ?? "..."}
                </p>
              )}
            </div>
            {!isDirectRound(round) && (
              <ReportCard chainId={chainId} roundId={roundId} />
            )}
          </div>

          <p className="text-1xl mb-4 overflow-x-auto">
            {round.roundMetadata?.eligibility?.description}
          </p>

          {isDirectRound(round) && isBeforeApplicationEndDate && (
            <ApplyButton applicationURL={applicationURL} />
          )}
          <hr className="mt-4 mb-4" />
          <div className="flex flex-col lg:flex-row mb-2 w-full justify-between">
            <p className="text-2xl mb-4">
              {isDirectRound(round) ? "Approved Projects" : "All Projects"} (
              {projects ? projects.length : 0})
            </p>
            <div className="relative">
              <Search className="absolute h-4 w-4 mt-3 ml-3" />
              <Input
                className="w-full lg:w-64 h-8 rounded-full pl-10"
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {projects && (
            <ProjectList
              projects={projects}
              roundRoutePath={`/round/${chainId}/${roundId}`}
              isBeforeRoundEndDate={!disableAddToCartButton}
              roundId={roundId}
              round={round}
              chainId={chainId}
              setCurrentProjectAddedToCart={setCurrentProjectAddedToCart}
              setShowCartNotification={setShowCartNotification}
            />
          )}
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
}

const ProjectList = (props: {
  projects: Project[];
  roundRoutePath: string;
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: ChainId;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
  const { projects, roundRoutePath } = props;

  return (
    <CardsContainer>
      {projects.map((project, index) => {
        return (
          <ProjectCard
            key={index}
            project={project}
            roundRoutePath={roundRoutePath}
            isBeforeRoundEndDate={props.isBeforeRoundEndDate}
            roundId={props.roundId}
            round={props.round}
            chainId={props.chainId}
            setCurrentProjectAddedToCart={props.setCurrentProjectAddedToCart}
            setShowCartNotification={props.setShowCartNotification}
          />
        );
      })}
    </CardsContainer>
  );
};

function ProjectCard(props: {
  project: Project;
  roundRoutePath: string;
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: ChainId;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { project, roundRoutePath, round } = props;
  const projectRecipient =
    project.recipient.slice(0, 5) + "..." + project.recipient.slice(-4);

  const { projects, add, remove } = useCartStorage();

  const isAlreadyInCart = projects.some(
    (cartProject) =>
      cartProject.grantApplicationId === project.grantApplicationId &&
      cartProject.roundId === props.roundId
  );

  const cartProject = project as CartProject;
  cartProject.roundId = props.roundId;
  cartProject.chainId = Number(props.chainId);

  return (
    <BasicCard className="relative md:w-[296px]" data-testid="project-card">
      <Link
        to={`${roundRoutePath}/${project.grantApplicationId}`}
        data-testid="project-detail-link"
      >
        <CardHeader>
          <ProjectBanner
            bannerImgCid={project.projectMetadata.bannerImg ?? null}
            classNameOverride={
              "bg-black h-[120px] w-full object-cover rounded-t"
            }
            resizeHeight={120}
          />
        </CardHeader>
        <CardContent className="px-2">
          <CardTitle data-testid="project-title">
            {project.projectMetadata.title}
          </CardTitle>
          <CardDescription className="mb-2 mt-0" data-testid="project-owner">
            by {projectRecipient}
          </CardDescription>
          <CardDescription
            data-testid="project-description"
            className="h-[150px] overflow-hidden mb-1"
          >
            {truncateDescription(
              renderToPlainText(project.projectMetadata.description),
              90
            )}
          </CardDescription>
        </CardContent>
      </Link>
      {!isDirectRound(round) && (
        <CardFooter className="bg-white border-t">
          <CardContent className="text-xs mt-2">
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
        className="float-right cursor-pointer"
        data-testid="remove-from-cart"
        onClick={props.removeFromCart}
      >
        <CheckedCircleIcon className="w-10" />
      </div>
    );
  }
  return (
    <div
      className="float-right current-pointer"
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

function PreRoundPage(props: {
  round: Round;
  chainId: string;
  roundId: string;
  element: (req: Requirement, index: number) => JSX.Element;
}) {
  const { round, chainId, roundId, element } = props;

  const applicationURL = `${builderURL}/#/chains/${chainId}/rounds/${roundId}`;

  const currentTime = new Date();
  const isBeforeApplicationStartDate =
    round && round.applicationsStartTime >= currentTime;
  // covers infinite dates for applicationsEndTime
  const isDuringApplicationPeriod =
    round &&
    round.applicationsStartTime <= currentTime &&
    (isInfiniteDate(round.applicationsEndTime) ||
      round.applicationsEndTime >= currentTime);

  const isAfterApplicationEndDateAndBeforeRoundStartDate =
    round &&
    round.roundStartTime >= currentTime &&
    (isInfiniteDate(round.applicationsEndTime) ||
      round.applicationsEndTime <= currentTime);

  const { data } = useToken({
    address: getAddress(props.round.token),
    chainId: Number(chainId),
  });

  const nativePayoutToken = votingTokens.find(
    (t) =>
      t.chainId === Number(chainId) &&
      t.address === getAddress(props.round.token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
  };

  return (
    <div className="mt-20 flex justify-center">
      <div className="max-w-screen-lg md:w-full">
        <div className="text-center">
          <div className="lg:inline-block md:inline-block"></div>
          <p className="mb-4 text-2xl text-black font-bold">
            {round.roundMetadata?.name}
          </p>
          <p
            className="text-lg my-2 font-normal text-grey-400"
            data-testid="application-period"
          >
            Application Period:
            <span className="mx-1">
              <span className="mr-1">
                {formatUTCDateAsISOString(round.applicationsStartTime)}
              </span>

              <span>( {getUTCTime(round.applicationsStartTime)} )</span>

              <span className="mx-1">-</span>

              {!isInfiniteDate(round.applicationsEndTime) && (
                <>
                  <span className="mr-1">
                    {formatUTCDateAsISOString(round.applicationsEndTime)}
                  </span>

                  <span>{getUTCTime(round.applicationsEndTime)}</span>
                </>
              )}
              {isInfiniteDate(round.applicationsEndTime) && (
                <>
                  <span>No End Date</span>
                </>
              )}
            </span>
          </p>
          <p
            className="text-lg my-2 font-normal text-grey-400"
            data-testid="round-period"
          >
            Round Period:
            <span>
              <span className="mx-1">
                {formatUTCDateAsISOString(round.roundStartTime)}
              </span>

              <span>( {getUTCTime(round.roundStartTime)} )</span>

              <span className="mx-1">-</span>

              {!isInfiniteDate(round.roundEndTime) && (
                <>
                  <span className="mr-1">
                    {formatUTCDateAsISOString(round.roundEndTime)}
                  </span>

                  <span>{getUTCTime(round.roundEndTime)}</span>
                </>
              )}
              {isInfiniteDate(round.roundEndTime) && (
                <>
                  <span>No End Date</span>
                </>
              )}
            </span>
          </p>
          {!isDirectRound(round) && (
            <div>
              <p
                className="text-lg my-2 text-grey-400 font-normal"
                data-testid="matching-funds"
              >
                Matching Funds Available:
                <span>
                  {" "}
                  &nbsp;
                  {round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toLocaleString()}
                  &nbsp;
                  {tokenData?.symbol ?? "..."}
                </span>
              </p>
              <p
                className="text-lg my-2 text-grey-400 font-normal"
                data-testid="matching-cap"
              >
                Matching Cap:
                {round.roundMetadata?.quadraticFundingConfig
                  ?.matchingCapAmount ? (
                  <span>
                    {" "}
                    &nbsp;
                    {
                      round.roundMetadata?.quadraticFundingConfig
                        ?.matchingCapAmount
                    }
                    &nbsp;
                    {"%"}
                  </span>
                ) : (
                  <span>None</span>
                )}
              </p>
            </div>
          )}
          <p className="text-lg my-5 text-grey-400 font-normal border-t py-5 border-b">
            <span>{round.roundMetadata?.eligibility.description}</span>
          </p>
          <p
            className="mb-4 text-2xl text-black font-bold"
            data-testid="round-eligibility"
          >
            Round Eligibility
          </p>
          <div className="container justify-center max-w-fit mx-auto">
            <ul className="list-disc list-inside text-lg text-grey-400 text-left font-normal">
              {round.roundMetadata?.eligibility.requirements?.map(element)}
            </ul>
          </div>
          <div className="container mx-auto flex mt-4 mb-8 lg:w-96">
            {isBeforeApplicationStartDate && (
              <InactiveButton
                label="Apply to Grant Round"
                testid="applications-open-button"
              />
            )}

            {isDuringApplicationPeriod && (
              <ApplyButton applicationURL={applicationURL} />
            )}

            {isAfterApplicationEndDateAndBeforeRoundStartDate && (
              <InactiveButton
                label="Application period ended"
                testid="applications-closed-button"
              />
            )}
          </div>
        </div>
        <div className="basis-1/2 right-0"></div>
      </div>
    </div>
  );
}

const ApplyButton = (props: { applicationURL: string }) => {
  const { applicationURL } = props;

  return (
    <Button
      type="button"
      onClick={() => window.open(applicationURL, "_blank")}
      className="mt-2 basis-full items-center justify-center shadow-sm text-sm rounded md:h-12"
      data-testid="apply-button"
    >
      Apply to Grant Round
    </Button>
  );
};

const InactiveButton = (props: { label: string; testid: string }) => {
  const { label, testid } = props;

  return (
    <Button
      type="button"
      className="basis-full items-center justify-center shadow-sm text-sm bg-grey-300 rounded border-1 md:h-12"
      data-testid={testid}
      disabled={true}
    >
      {label}
    </Button>
  );
};

const ReportCard = ({
  chainId,
  roundId,
}: {
  chainId: ChainId;
  roundId: string;
}) => {
  const reportCardURL = `https://reportcards.gitcoin.co/${chainId}/${roundId}`;

  return (
    <a href={reportCardURL} target="_blank" className="group w-fit">
      <div className="rounded-lg border border-grey-500 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-grey-100 group-hover:bg-grey-200 w-8 h-8 transition-all" />
          <div>
            <div className="bg-grey-100 w-9 sm:w-12 h-0.5 mb-1  group-hover:bg-grey-200 transition-all" />
            <div className="bg-grey-100 w-9 sm:w-12 h-0.5  group-hover:bg-grey-200 transition-all" />
          </div>
        </div>
        <span className="sm:text-base text-sm sm:max-w-[6rem] max-w-[5rem]">
          Check out this round’s report card!
        </span>
      </div>
    </a>
  );
};
