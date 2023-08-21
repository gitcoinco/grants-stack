import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  ChainId,
  formatUTCDateAsISOString,
  getUTCTime,
  renderToPlainText,
  truncateDescription,
} from "common";
import { Button, Input } from "common/src/styles";

import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { ReactComponent as Search } from "../../assets/search-grey.svg";

import { useRoundById } from "../../context/RoundContext";
import { CartProject, Project, Requirement, Round } from "../api/types";
import { CHAINS, payoutTokens } from "../api/utils";

import Footer from "common/src/components/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import PassportBanner from "../common/PassportBanner";
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
import CartNotification from "../common/CartNotification";
import { useCartStorage } from "../../store";

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const { round, isLoading } = useRoundById(
    chainId as string,
    roundId as string
  );

  const currentTime = new Date();

  const isBeforeRoundStartDate = round && round.roundStartTime >= currentTime;
  const isAfterRoundStartDate = round && round.roundStartTime <= currentTime;
  const isAfterRoundEndDate = round && round.roundEndTime <= currentTime;
  const isBeforeRoundEndDate = round && round.roundEndTime > currentTime;

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

  const matchingFundPayoutTokenName =
    round &&
    payoutTokens.filter(
      (t) =>
        t.address.toLowerCase() === round.token.toLowerCase() &&
        t.chainId === chainId
    )[0]?.name;

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

  return (
    <>
      {showCartNotification && renderCartNotification()}
      <Navbar />
      {props.isBeforeRoundEndDate && (
        <PassportBanner chainId={chainId} round={round} />
      )}
      {props.isAfterRoundEndDate && (
        <div>
          <RoundEndedBanner />
        </div>
      )}
      <div className="relative top-28 lg:mx-20 px-4 py-7 h-screen">
        <div className="flex flex-col pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <main>
          <p data-testid="round-title" className="text-3xl mb-5">
            {round.roundMetadata?.name}
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

              <span className="mr-1">
                {formatUTCDateAsISOString(round.roundEndTime)}
              </span>

              <span>{getUTCTime(round.roundEndTime)}</span>
            </p>
          </div>

          <p className="text-grey-400 text-sm flex gap-2 mb-4">
            <span>Deployed on:</span>
            <div className="flex">
              <img
                className="w-4 h-4 mt-0.5 mr-1"
                src={CHAINS[chainId].logo}
                alt="Round Chain Logo"
              />
              <span>{CHAINS[chainId].name}</span>
            </div>
          </p>

          <p className="text-1xl mb-4">
            Matching funds available: &nbsp;
            {round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toLocaleString()}
            &nbsp;
            {matchingFundPayoutTokenName}
          </p>
          <p className="text-1xl mb-4 overflow-x-auto">
            {round.roundMetadata?.eligibility?.description}
          </p>
          <hr className="mt-4 mb-4" />
          <div className="flex flex-col lg:flex-row mb-2 w-full justify-between">
            <p className="text-2xl mb-4">
              All Projects ({projects ? projects.length : 0})
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
              isBeforeRoundEndDate={props.isBeforeRoundEndDate}
              roundId={roundId}
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
  chainId: ChainId;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { project, roundRoutePath } = props;
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
    <BasicCard className="relative md:w-[296px]" data-testid="project-card">
      <Link
        to={`${roundRoutePath}/${project.grantApplicationId}`}
        data-testid="project-detail-link"
      >
        <CardHeader>
          <ProjectBanner
            projectMetadata={project.projectMetadata}
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
              180
            )}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter className="bg-white border-t">
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
              setCurrentProjectAddedToCart={props.setCurrentProjectAddedToCart}
              setShowCartNotification={props.setShowCartNotification}
            />
          )}
        </CardContent>
      </CardFooter>
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

function CartButtonToggle(props: {
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
        className="float-right"
        data-testid="remove-from-cart"
        onClick={props.removeFromCart}
      >
        <CheckedCircleIcon className="w-10" />
      </div>
    );
  }
  return (
    <div
      className="float-right"
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

  const applicationURL = `https://builder.gitcoin.co/#/chains/${chainId}/rounds/${roundId}`;
  const currentTime = new Date();

  const isBeforeApplicationStartDate =
    round && round.applicationsStartTime >= currentTime;
  const isDuringApplicationPeriod =
    round &&
    round.applicationsStartTime <= currentTime &&
    round.applicationsEndTime >= currentTime;
  const isAfterApplicationEndDateAndBeforeRoundStartDate =
    round &&
    round.applicationsEndTime <= currentTime &&
    round.roundStartTime >= currentTime;

  const matchingFundPayoutTokenName =
    round &&
    payoutTokens.filter(
      (t) =>
        t.address.toLowerCase() === round.token.toLowerCase() &&
        t.chainId.toString() === chainId
    )[0]?.name;

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

              <span className="mr-1">
                {formatUTCDateAsISOString(round.applicationsEndTime)}
              </span>

              <span>( {getUTCTime(round.applicationsEndTime)} )</span>
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

              <span className="mr-1">
                {formatUTCDateAsISOString(round.roundEndTime)}
              </span>

              <span>( {getUTCTime(round.roundEndTime)} )</span>
            </span>
          </p>
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
              {matchingFundPayoutTokenName}
            </span>
          </p>
          <p
            className="text-lg my-2 text-grey-400 font-normal"
            data-testid="matching-cap"
          >
            Matching Cap:
            <span>
              {" "}
              &nbsp;
              {round.roundMetadata?.quadraticFundingConfig?.matchingCapAmount}
              &nbsp;
              {"%"}
            </span>
          </p>
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
