import { datadogLogs } from "@datadog/browser-logs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  CardsContainer,
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

  useEffect(() => {
    if (isLoading) setIsFirstPageLoad(true);
    if (!isLoading && isFirstPageLoad && isAfterRoundStartDate) {
      // if the round has ended, redirect to stats page
      navigate(`/round/${chainId}/${roundId}/stats`);
    }
  }, [
    isLoading,
    isFirstPageLoad,
    chainId,
    isAfterRoundStartDate,
    navigate,
    roundId,
  ]);

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
              isBeforeRoundEndDate={isBeforeRoundEndDate}
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
  const { projects, roundRoutePath } = props;

  return (
    <>
      <CardsContainer className="gap-x-6 gap-y-12">
        {props.isProjectsLoading ? (
          <>
            {Array(6)
              .fill("")
              .map((item, index) => (
                <BasicCard
                  key={index}
                  className="relative flex-grow min-w-[296px] h-[400px] animate-pulse bg-grey-100"
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
                />
              );
            })}
          </>
        ) : (
          <p>No projects</p>
        )}
      </CardsContainer>
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
}) {
  const { project, roundRoutePath, round } = props;
  const projectRecipient =
    project.recipient.slice(0, 5) + "..." + project.recipient.slice(-4);

  const { projects, add, remove } = useCartStorage();

  const isAlreadyInCart = projects.some(
    (cartProject) =>
      cartProject.grantApplicationId === project.grantApplicationId
  );

  const cartProject = project as CartProject;
  cartProject.roundId = props.roundId;
  cartProject.chainId = Number(props.chainId);

  return (
    <BasicCard
      className="relative flex-grow min-w-[296px] max-w-[700px]"
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
              "bg-black h-[120px] w-full object-cover rounded-t"
            }
            resizeHeight={120}
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

          <CardTitle data-testid="project-title" className="text-xl">
            {project.projectMetadata.title}
          </CardTitle>
          <CardDescription className="mb-2 mt-0 " data-testid="project-owner">
            by <span className="font-mono">{projectRecipient}</span>
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
        <CardFooter className="bg-white border-t px-2">
          <CardContent className="text-xs mt-2">
            {props.isBeforeRoundEndDate && (
              <CartButton
                project={project}
                isAlreadyInCart={isAlreadyInCart}
                removeFromCart={() => {
                  remove(cartProject.grantApplicationId);
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
