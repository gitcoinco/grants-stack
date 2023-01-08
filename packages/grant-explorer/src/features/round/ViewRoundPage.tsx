import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { Spinner } from "../common/Spinner";
import { Project, Requirement, Round } from "../api/types";
import { ChainId, getUTCDate, getUTCTime, payoutTokens } from "../api/utils";
import {
  Button,
  BasicCard,
  CardContent,
  CardHeader,
  CardsContainer,
  CardTitle,
  CardDescription,
  CardFooter,
  Input,
} from "../common/styles";
import { ProjectBanner } from "../common/ProjectBanner";
import { useBallot } from "../../context/BallotContext";
import { ReactComponent as Search } from "../../assets/search-grey.svg";
import { useEffect, useState } from "react";
import Footer from "../common/Footer";
import { useRoundSummary } from "../api/api";
import RoundEndedBanner from "../common/RoundEndedBanner";
import PassportBanner from "../common/PassportBanner";

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round, isLoading } = useRoundById(chainId!, roundId!);

  const roundStats = useRoundSummary({
    chainId: chainId as ChainId,
    roundId: roundId as string,
  });

  console.log("roundSummary", roundStats);

  const currentTime = new Date();

  const isBeforeRoundStartDate = round && round.roundStartTime >= currentTime;

  const isAfterRoundStartDate = round && round.roundStartTime <= currentTime;

  const isAfterRoundEndDate = round && round.roundEndTime <= currentTime;

  return isLoading ? (
    <Spinner text="We're fetching the Round."/>
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
              isAfterRoundEndDate={isAfterRoundEndDate}
            />
          )}
        </>
      ) : (
        <NotFoundPage/>
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
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`}/>
      <div className="lg:mx-20 px-4 py-7 h-screen">
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
        <Footer/>
      </div>
    </>
  );
}

function AfterRoundStart(props: {
  round: Round;
  chainId: string;
  roundId: string;
  isAfterRoundEndDate?: boolean;
}) {
  const { round, chainId, roundId } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(searchQuery),
        300
      );
      return () => clearTimeout(timeOutId);
    } else {
      setProjects(round.approvedProjects);
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

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`}/>
      <PassportBanner chainId={chainId} roundId={roundId} />
      {props.isAfterRoundEndDate && (
        <div>
          <RoundEndedBanner/>
        </div>
      )}
      <div className="lg:mx-20 px-4 py-7 h-screen">
        <main>
          <p className="text-3xl my-5">{round.roundMetadata?.name}</p>

          <div className="flex text-grey-400 mb-3">
            <p className="mr-4 text-sm">
              <span className="mr-1">Round starts on:</span>
              <span className="mr-1">
                {getUTCDate(round.roundStartTime)}
              </span>
              <span>
                {getUTCTime(round.roundStartTime)}
              </span>
            </p>
            <p className="text-sm">
              <span className="mr-1">Round ends on:</span>

              <span className="mr-1">
                {getUTCDate(round.roundEndTime)}
              </span>

              <span>
                {getUTCTime(round.roundEndTime)}
              </span>
            </p>
          </div>

          <p className="text-1xl mb-4">
            Matching funds available: &nbsp;
            {round.roundMetadata?.matchingFunds?.matchingFundsAvailable.toLocaleString()}
            &nbsp;
            {matchingFundPayoutTokenName}
          </p>
          <p className="text-1xl mb-4 overflow-x-auto">
            {round.roundMetadata?.eligibility?.description}
          </p>
          <hr className="mt-4 mb-8"/>
          <div className="flex flex-col lg:flex-row mb-2 w-full justify-between">
            <p className="text-2xl mb-4">
              All Projects ({projects ? projects.length : 0})
            </p>
            <div className="relative">
              <Search className="absolute h-4 w-4 mt-3 ml-3"/>
              <Input
                className="w-full lg:w-64 h-8 rounded-full pl-10"
                type="text"
                placeholder="Search"
                value={searchQuery}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {projects && (
            <ProjectList
              projects={projects}
              roundRoutePath={`/round/${chainId}/${roundId}`}
            />
          )}
        </main>
        <Footer/>
      </div>
    </>
  );
}

function ProjectCard(props: { project: Project; roundRoutePath: string }) {
  const { project, roundRoutePath } = props;
  const projectRecipient = project.recipient.slice(0, 6);

  const [
    shortlist,
    finalBallot,
    handleAddProjectsToShortlist,
    handleRemoveProjectsFromShortlist,
    ,
    handleRemoveProjectsFromFinalBallot,
  ] = useBallot();
  const isAddedToShortlist = shortlist.some(
    (shortlistedProject) =>
      shortlistedProject.grantApplicationId === project.grantApplicationId
  );
  const isAddedToFinalBallot = finalBallot.some(
    (ballotProject) =>
      ballotProject.grantApplicationId === project.grantApplicationId
  );

  return (
    <BasicCard className="relative" data-testid="project-card">
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
          />
        </CardHeader>
        <CardContent>
          <CardTitle data-testid="project-title">
            {project.projectMetadata.title}
          </CardTitle>
          <CardDescription className="mb-2" data-testid="project-owner">
            by {projectRecipient}
          </CardDescription>
          <CardDescription data-testid="project-description">
            {project.projectMetadata.description}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter className="bg-white">
        <CardContent className="text-xs mt-4">
          <ShortListButton
            project={project}
            isAdded={isAddedToShortlist || isAddedToFinalBallot}
            removeFromShortlist={() => {
              handleRemoveProjectsFromShortlist([project]);
            }}
            removeFromFinalBallot={() => {
              handleRemoveProjectsFromFinalBallot([project]);
            }}
            addToShortlist={() => {
              handleAddProjectsToShortlist([project]);
            }}
          />
        </CardContent>
      </CardFooter>
    </BasicCard>
  );
}

const ProjectList = (props: {
  projects: Project[];
  roundRoutePath: string;
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
          />
        );
      })}
    </CardsContainer>
  );
};

function ShortListButton(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  isAdded: boolean;
  removeFromShortlist: () => void;
  removeFromFinalBallot: () => void;
  addToShortlist: () => void;
}) {
  return (
    <div>
      <BallotSelectionToggle
        project={props.project}
        isAdded={props.isAdded}
        removeFromShortlist={props.removeFromShortlist}
        removeFromFinalBallot={props.removeFromFinalBallot}
        addToBallot={props.addToShortlist}
      />
    </div>
  );
}

function BallotSelectionToggle(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  isAdded: boolean;
  addToBallot: () => void;
  removeFromShortlist: () => void;
  removeFromFinalBallot: () => void;
}) {
  const [shortlist, finalBallot, , , , ,] = useBallot();

  const isAddedToShortlist = shortlist.some(
    (shortlistedProject) =>
      shortlistedProject.grantApplicationId === props.project.grantApplicationId
  );
  const isAddedToFinalBallot = finalBallot.some(
    (ballotProject) =>
      ballotProject.grantApplicationId === props.project.grantApplicationId
  );
  // if the project is not added, show the add to shortlist button
  // if the project is added to the shortlist, show the remove from shortlist button
  // if the project is added to the final ballot, show the remove from final ballot button
  if (props.isAdded) {
    if (isAddedToShortlist) {
      return (
        <Button
          data-testid="remove-from-shortlist"
          onClick={props.removeFromShortlist}
          className={
            "w-full bg-transparent hover:bg-red-500 text-red-400 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded"
          }
        >
          Remove from Shortlist
        </Button>
      );
    }
    if (isAddedToFinalBallot) {
      return (
        <Button
          data-testid="remove-from-final-ballot"
          onClick={props.removeFromFinalBallot}
          className={
            "w-full bg-transparent hover:bg-red-500 text-red-400 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded"
          }
        >
          Remove from Final Ballot
        </Button>
      );
    }
  }
  return (
    <Button
      data-testid="add-to-shortlist"
      onClick={() => {
        props.addToBallot();
      }}
      className={
        "w-full bg-transparent hover:bg-violet-400 text-grey-900 font-semibold hover:text-white py-2 px-4 border border-violet-400 hover:border-transparent rounded"
      }
    >
      Add to Shortlist
    </Button>
  );
}

function PreRoundPage(props: {
  round: Round;
  chainId: string;
  roundId: string;
  element: (req: Requirement, index: number) => JSX.Element;
}) {
  const { round, chainId, roundId, element } = props;

  const applicationURL = `https://grantshub.gitcoin.co/#/chains/${chainId}/rounds/${roundId}`;
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
      (t) => t.address.toLocaleLowerCase() == round.token.toLocaleLowerCase()
    )[0].name;

  return (
    <div className="container mx-auto flex flex-row bg-white">
      <div className="basis-1/2 mt-20 ">
        <div className="lg:inline-block md:inline-block"></div>
        <p className="mb-2 text-xl text-black font-bold">
          {round.roundMetadata?.name}
        </p>
        <p
          className="text-lg my-2 text-black font-normal"
          data-testid="application-period"
        >
          Application Period:
          <span className="mx-1">
            <span className="mr-1">
              {getUTCDate(round.applicationsStartTime)}
            </span>

            <span className="text-grey-400">
              ( {getUTCTime(round.applicationsStartTime)} )
            </span>

            <span className="mx-1">-</span>

            <span className="mr-1">
              {getUTCDate(round.applicationsEndTime)}
            </span>

            <span className="text-grey-400">
              ( {getUTCTime(round.applicationsEndTime)} )
            </span>
          </span>
        </p>
        <p
          className="text-lg my-2 text-black font-normal"
          data-testid="round-period"
        >
          Round Period:
          <span>

            <span className="mx-1">
              {getUTCDate(round.roundStartTime)}
            </span>

            <span className="text-grey-400">
              ( {getUTCTime(round.roundStartTime)} )
            </span>

            <span className="mx-1">-</span>

            <span className="mr-1">
              {getUTCDate(round.roundEndTime)}
            </span>

            <span className="text-grey-400">
              ( {getUTCTime(round.roundEndTime)} )
            </span>
          </span>
        </p>
        <p
          className="text-lg my-2 text-black font-normal"
          data-testid="matching-funds"
        >
          Matching Funds Available:
          <span>
            {" "}
            &nbsp;
            {round.roundMetadata?.matchingFunds?.matchingFundsAvailable}
            &nbsp;
            {matchingFundPayoutTokenName}
          </span>
        </p>
        <p className="text-lg mt-4 mb-4 my-2 text-black font-normal">
          <span>{round.roundMetadata?.eligibility.description}</span>
        </p>
        <p
          className="mb-2 text-lg text-black font-bold"
          data-testid="round-eligibility"
        >
          Round Eligibility
        </p>
        <ul className="list-disc list-inside text-lg text-black font-normal">
          {round.roundMetadata?.eligibility.requirements?.map(element)}
        </ul>

        <div className="container mx-auto flex">
          {isBeforeApplicationStartDate && (
            <InactiveButton
              label={
                `Applications Open ${getUTCDate(round.applicationsStartTime)}
              `}
              testid="applications-open-button"
            />
          )}

          {isDuringApplicationPeriod && (
            <ApplyButton applicationURL={applicationURL}/>
          )}

          {isAfterApplicationEndDateAndBeforeRoundStartDate && (
            <InactiveButton
              label="Applications Closed"
              testid="applications-closed-button"
            />
          )}
        </div>
      </div>
      <div className="basis-1/2 right-0"></div>
    </div>
  );
}

const ApplyButton = (props: { applicationURL: string }) => {
  const { applicationURL } = props;

  return (
    <Button
      type="button"
      onClick={() => window.open(applicationURL, "_blank")}
      className="basis-full items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 md:h-12 hover:bg-violet-200"
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
      className="basis-full items-center justify-center shadow-sm text-sm rounded border-1 md:h-12"
      data-testid={testid}
      disabled={true}
    >
      {label}
    </Button>
  );
};
