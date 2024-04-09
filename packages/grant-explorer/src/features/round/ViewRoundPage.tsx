import { datadogLogs } from "@datadog/browser-logs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChainId, renderToPlainText, truncateDescription } from "common";
import { Input } from "common/src/styles";
import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { ReactComponent as Search } from "../../assets/search-grey.svg";
import { useRoundById } from "../../context/RoundContext";
import { CartProject, Project, Round } from "../api/types";
import { isDirectRound, isInfiniteDate, votingTokens } from "../api/utils";
import NotFoundPage from "../common/NotFoundPage";
import { ProjectBanner } from "../common/ProjectBanner";
import { Spinner } from "../common/Spinner";
import {
  BasicCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../common/styles";
import CartNotification from "../common/CartNotification";
import { useCartStorage } from "../../store";
import { useToken } from "wagmi";
import { getAddress } from "viem";
import { ProjectLogo } from "../common/ProjectCard";
import React from "react";
import { DefaultLayout } from "../common/DefaultLayout";
import ViewRoundPageHero from "./ViewRoundPageHero";
import ViewRoundPageTabs from "./ViewRoundPageTabs";
import BeforeRoundStart from "./BeforeRoundStart";
import { getAlloVersion } from "common/src/config";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useRoundApprovedApplications } from "../projects/hooks/useRoundApplications";
import { Application, useDataLayer } from "data-layer";

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();
  const navigate = useNavigate();

  const { round, isLoading } = useRoundById(
    Number(chainId),
    roundId?.toLowerCase() as string
  );
  const [isFirstPageLoad, setIsFirstPageLoad] = useState(false);

  const currentTime = new Date();
  const isBeforeRoundStartDate = round && round.roundStartTime >= currentTime;
  const isAfterRoundStartDate = round && round.roundStartTime <= currentTime;
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > currentTime);
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime)
      ? false
      : round && round.roundEndTime <= currentTime);

  useEffect(() => {
    if (isLoading) setIsFirstPageLoad(true);
    if (!isLoading && isFirstPageLoad && !isBeforeRoundEndDate) {
      // if the round has ended, redirect to stats page
      navigate(`/round/${chainId}/${roundId}/stats`);
    }
  }, [
    isLoading,
    isFirstPageLoad,
    chainId,
    isBeforeRoundEndDate,
    navigate,
    roundId,
  ]);
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
      <div className="sm:h-[64px] h-[130px] w-full"></div>
    </>
  );
}

const alloVersion = getAlloVersion();

function AfterRoundStart(props: {
  round: Round;
  chainId: ChainId;
  roundId: string;
}) {
  const { round, chainId, roundId } = props;

  // covers infinte dates for roundEndDate
  const currentTime = new Date();
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime)
      ? false
      : round && round.roundEndTime <= currentTime);
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > currentTime);

  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>();
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>();
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  const [showCartNotification, setShowCartNotification] = useState(false);
  const [currentProjectAddedToCart, setCurrentProjectAddedToCart] =
    useState<Project>({} as Project);

  const disableAddToCartButton =
    (alloVersion === "allo-v2" && roundId.startsWith("0x")) ||
    isAfterRoundEndDate;

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

  const nativePayoutToken = votingTokens.find(
    (t) =>
      t.chainId === Number(props.chainId) &&
      t.address === getAddress(props.round.token)
  );

  const tokenData = data ?? {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.name ?? "ETH",
  };

  return (
    <>
      <DefaultLayout>
        {showCartNotification && renderCartNotification()}
        {isBeforeRoundEndDate && <AlloVersionBanner roundId={roundId} />}
        <div>
          <ViewRoundPageHero
            round={round}
            chainId={chainId}
            roundId={roundId}
            isBeforeRoundEndDate={isBeforeRoundEndDate}
            isAfterRoundEndDate={isAfterRoundEndDate}
            tokenSymbol={tokenData?.symbol}
          />

          <div className="mb-10 flex flex-col lg:flex-row w-full justify-between gap-2">
            <ViewRoundPageTabs
              round={round}
              chainId={chainId}
              roundId={roundId}
              isBeforeRoundEndDate={isBeforeRoundEndDate}
              projectsCount={round?.approvedProjects?.length ?? 0}
            />
            <div className="relative">
              <Search className="absolute h-4 w-4 mt-3 ml-3 " />
              <Input
                className="w-full lg:w-64 h-8 rounded-full pl-10 font-mono"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <>
            <ProjectList
              projects={projects}
              isProjectsLoading={isProjectsLoading}
              roundRoutePath={`/round/${chainId}/${roundId}`}
              isBeforeRoundEndDate={!disableAddToCartButton}
              roundId={roundId}
              round={round}
              chainId={chainId}
              setCurrentProjectAddedToCart={setCurrentProjectAddedToCart}
              setShowCartNotification={setShowCartNotification}
            />
          </>
        </div>
      </DefaultLayout>
    </>
  );
}

const ProjectList = (props: {
  projects?: Project[];
  roundRoutePath: string;
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: ChainId;
  isProjectsLoading: boolean;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
  const { projects, roundRoutePath, round, chainId, roundId } = props;
  const dataLayer = useDataLayer();

  const { data: applications } = useRoundApprovedApplications(
    {
      chainId,
      roundId,
      projectIds: round.approvedProjects?.map(
        (proj) => proj.grantApplicationId
      ),
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
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: ChainId;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
  crowdfundedUSD: number;
  uniqueContributorsCount: number;
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
    <BasicCard className="relative w-full" data-testid="project-card">
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
            className="h-[130px] overflow-hidden mb-1 !text-sm"
          >
            {truncateDescription(
              renderToPlainText(project.projectMetadata.description),
              90
            )}
          </CardDescription>
        </CardContent>
      </Link>
      {!isDirectRound(round) && (
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
