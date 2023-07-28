import { datadogLogs } from "@datadog/browser-logs";
import {
  formatUTCDateAsISOString,
  getUTCTime,
  renderToPlainText,
  truncateDescription,
} from "common";
import { Button, Input } from "common/src/styles";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { ReactComponent as Search } from "../../assets/search-grey.svg";
import { useCart } from "../../context/CartContext";
import { useRoundById } from "../../context/RoundContext";
import { Project, Requirement, Round } from "../api/types";
import { CHAINS, isInfiniteDate, payoutTokens } from "../api/utils";
import ConfirmationModal from "../common/ConfirmationModal";
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
import { ROUND_PAYOUT_MERKLE } from "../../constants";

const builderURL = process.env.REACT_APP_BUILDER_URL;

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
  // covers infinte dates for roundEndDate
  const isAfterRoundEndDate = 
    round && 
    (isInfiniteDate(round.roundEndTime) ? false : (round && round.roundEndTime <= currentTime));
  const isBeforeRoundEndDate =
    round && 
    (!isInfiniteDate(round.roundEndTime) ? (round.roundEndTime > currentTime) : true);

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
              chainId={chainId}
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
      <Navbar
        roundUrlPath={`/round/${chainId}/${roundId}`}
        customBackground="bg-[#F0F0F0]"
      />
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
  chainId: string;
  roundId: string;
  isBeforeRoundEndDate?: boolean;
  isAfterRoundEndDate?: boolean;
}) {
  const { round, chainId, roundId } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>();

  const [showChangeNetworkModal, setShowChangeNetworkModal] = useState(false);
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();

  useEffect(() => {
    if (chain && chainId && Number(chainId) !== chain?.id) {
      setShowChangeNetworkModal(true);
    } else {
      setShowChangeNetworkModal(false);
    }
  }, [chainId, chain]);

  const onSwitchNetwork = () => {
    switchNetwork?.(Number(chainId));
  };

  function ConfirmationModalBody() {
    return (
      <>
        <p className="text-sm text-grey-400">
          To view and donate to projects on this round, you need to switch the
          network on your wallet.
        </p>
      </>
    );
  }

  const renderNetworkChangeModal = () => {
    return (
      // eslint-disable-next-line
      <ConfirmationModal
        isOpen={showChangeNetworkModal}
        setIsOpen={setShowChangeNetworkModal}
        confirmButtonAction={onSwitchNetwork}
        title="Switch Network to Continue"
        body={<ConfirmationModalBody />}
        modalStyle="wide"
      />
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(searchQuery),
        300
      );
      return () => clearTimeout(timeOutId);
    } else {
      let projects = round?.approvedProjects;

      // shuffle projects
      projects = projects?.sort(() => Math.random() - 0.5);
      setProjects(projects);
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
      (t) => t.address.toLocaleLowerCase() == round.token.toLocaleLowerCase()
    )[0].name;

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
  const isDirectRound = round?.payoutStrategy && round?.payoutStrategy.strategyName === "DIRECT";
  const getRoundType = (payoutStrategy: string) => {
    return payoutStrategy === ROUND_PAYOUT_MERKLE
      ? "Quadratic Funding"
      : "Direct Grant"
  }

  return (
    <>
      {showChangeNetworkModal && renderNetworkChangeModal()}
      <Navbar
        roundUrlPath={`/round/${chainId}/${roundId}`}
        isBeforeRoundEndDate={props.isBeforeRoundEndDate}
      />
      {props.isBeforeRoundEndDate && (
        <PassportBanner chainId={chainId} round={round} />
      )}
      {props.isAfterRoundEndDate && (
        <div>
          <RoundEndedBanner />
        </div>
      )}
      <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
        <div className="flex flex-col pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <main>
          <p data-testid="round-title" className="text-3xl my-5">
            {round.roundMetadata?.name}
          </p>
          <p data-testid="round-badge"
            className="text-sm text-gray-900 h-[20px] inline-flex flex-col justify-center bg-grey-100 px-3 mb-4"
            style={{ borderRadius: "20px" }}>
            {round.payoutStrategy.strategyName && getRoundType(round.payoutStrategy.strategyName)}
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

          <p className="text-grey-400 text-sm flex gap-2 mb-4">
            <span>Deployed on:</span>
            <div className="flex">
              <img
                className="w-4 h-4 mt-0.5 mr-1"
                src={CHAINS[Number(chainId)]?.logo}
                alt="Round Chain Logo"
              />
              <span>{CHAINS[Number(chainId)]?.name}</span>
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

          {isDirectRound && (
              <ApplyButton applicationURL={applicationURL} />
          )}
          <hr className="mt-4 mb-4" />
          <div className="flex flex-col lg:flex-row mb-2 w-full justify-between">
            <p className="text-2xl mb-4">
              {isDirectRound ? 'Approved Projects' : 'All Projects' } ({projects ? projects.length : 0})
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
}) {
  const { project, roundRoutePath } = props;
  const projectRecipient =
    project.recipient.slice(0, 5) + "..." + project.recipient.slice(-4);

  const [cart, handleAddProjectsToCart, handleRemoveProjectsFromCart] =
    useCart();

  const isAlreadyInCart = cart.some(
    (cartProject) =>
      cartProject.grantApplicationId === project.grantApplicationId
  );

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
                handleRemoveProjectsFromCart([project], props.roundId);
              }}
              addToCart={() => {
                handleAddProjectsToCart([project], props.roundId);
              }}
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
}) {
  return (
    <div>
      <CartButtonToggle
        project={props.project}
        isAlreadyInCart={props.isAlreadyInCart}
        removeFromCart={props.removeFromCart}
        addToCart={props.addToCart}
      />
    </div>
  );
}

function CartButtonToggle(props: {
  project: Project;
  isAlreadyInCart: boolean;
  addToCart: () => void;
  removeFromCart: () => void;
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
      onClick={props.addToCart}
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
    (!isInfiniteDate(round.applicationsEndTime) ? round.applicationsEndTime >= currentTime : true);
  const isAfterApplicationEndDateAndBeforeRoundStartDate =
    round &&
    round.roundStartTime >= currentTime &&
    (!isInfiniteDate(round.applicationsEndTime) ? round.applicationsEndTime <= currentTime : true);

  const matchingFundPayoutTokenName =
    round &&
    payoutTokens.filter(
      (t) => t.address.toLocaleLowerCase() == round.token.toLocaleLowerCase()
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

            <ApplyButton applicationURL={applicationURL} />
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
