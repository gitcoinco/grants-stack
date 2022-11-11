import { datadogLogs } from "@datadog/browser-logs";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { Spinner } from "../common/Spinner";
import { Project, Requirement, Round } from "../api/types";
import { payoutTokens } from "../api/utils";
import {
  Button,
  BasicCard,
  CardContent,
  CardHeader,
  CardsContainer,
  CardTitle,
} from "../common/styles";
import { ProjectBanner } from "../common/ProjectBanner";

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round, isLoading } = useRoundById(chainId!, roundId!);

  const currentTime = new Date();

  const isBeforeRoundStartDate = round && round.roundStartTime >= currentTime;

  const isAfterRoundStartDate = round && round.roundStartTime <= currentTime;

  return isLoading ? (
    <Spinner text="We're fetching the Round." />
  ) : (
    <>
      {round && chainId && roundId ?
          <>
            {isBeforeRoundStartDate &&
              <BeforeRoundStart
                round={round}
                chainId={chainId}
                roundId={roundId}
              />
            }

            {isAfterRoundStartDate &&
              <AfterRoundStart
                round={round}
                chainId={chainId}
                roundId={roundId}
              />
            }
          </>
        :
          <NotFoundPage />
      }

    </>
  );
}

function BeforeRoundStart(props: {round: Round, chainId: string, roundId: string}) {

  const { round, chainId, roundId } = props;

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      <div className="mx-20 px-4 py-7 h-screen">
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
      </div>
      <Footer />
    </>
  );
}

function AfterRoundStart(props: { round: Round, chainId: string, roundId: string }) {

  const { round, chainId, roundId } = props;

  return(
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      <div className="mx-20 px-4 py-7 h-screen">
        <main>
          <p className="mt-6">
            <span>Round Name: </span>
            <span>{round.roundMetadata?.name}</span>
          </p>
          {round.approvedProjects &&
            <ProjectList
              projects={round.approvedProjects}
              roundRoutePath={`/round/${chainId}/${roundId}`}
            />
          }
        </main>
      </div>
      <Footer />
    </>
  )
}

function ProjectCard(props: { project: Project; roundRoutePath: string }) {

  const { project, roundRoutePath } = props;
  return (
    <BasicCard data-testid="project-card">
      <Link
        to={`${roundRoutePath}/${project.grantApplicationId}`}
        data-testid="project-detail-link"
      >
        <CardHeader>
          <ProjectBanner
            projectMetadata={project.projectMetadata}
            classNameOverride= {
              "bg-black h-[120px] w-full object-cover rounded-t"
            }
          />
        </CardHeader>
        <CardContent>
          <CardTitle>{project.projectMetadata.title}</CardTitle>
        </CardContent>
      </Link>
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

function PreRoundPage(props: {
  round: Round;
  chainId: string;
  roundId: string;
  element: (req: Requirement, index: number) => JSX.Element;
}) {

  const { round, chainId, roundId, element } = props;

  const applicationURL = `https://grantshub.gitcoin.co/#/chains/${chainId}/rounds/${roundId}`;
  const currentTime = new Date();

  const isBeforeApplicationStartDate = round && round.applicationsStartTime >= currentTime;
  const isDuringApplicationPeriod = round && round.applicationsStartTime <= currentTime && round.applicationsEndTime >= currentTime;
  const isAfterApplicationEndDateAndBeforeRoundStartDate = round && round.applicationsEndTime <= currentTime && round.roundStartTime >= currentTime;

  const MatchingFundPayoutTokenName = round && payoutTokens.filter(t => t.address.toLocaleLowerCase() == round.token.toLocaleLowerCase())[0].name;

  return (
    <div className="container mx-auto flex flex-row bg-white">
      <div className="basis-1/2 mt-20 ">
        <div className="lg:inline-block md:inline-block"></div>
        <p className="mb-2 text-xl text-black font-bold">{round.roundMetadata?.name}</p>
        <p className="text-lg my-2 text-black font-normal" data-testid="application-period">
          Application Period:
          <span>
            {" "}
            &nbsp;
            {round.applicationsStartTime.toLocaleDateString()}
            &nbsp;
            <span>-</span>
            &nbsp;
            {round.applicationsEndTime.toLocaleDateString()}
          </span>
        </p>
        <p className="text-lg my-2 text-black font-normal" data-testid="round-period">
          Round Period:
          <span>
            {" "}
            &nbsp;
            {round.roundStartTime.toLocaleDateString()}
            &nbsp;
            <span>-</span>
            &nbsp;
            {round.roundEndTime.toLocaleDateString()}
          </span>
        </p>
        <p className="text-lg my-2 text-black font-normal" data-testid="matching-funds">
          Matching Funds Available: 
          <span>
            {" "}
            &nbsp;
            {round.roundMetadata?.matchingFunds?.matchingFundsAvailable}
            &nbsp;
            {MatchingFundPayoutTokenName}
          </span>
        </p>
        <p className="text-lg mt-4 mb-4 my-2 text-black font-normal">
          <span>{round.roundMetadata?.eligibility.description}</span>
        </p>
        <p className="mb-2 text-lg text-black font-bold" data-testid="round-eligibility">
          Round Eligibility
        </p>
        <ul className="list-disc list-inside text-lg text-black font-normal">
          {round.roundMetadata?.eligibility.requirements?.map(
            element
          )}
        </ul>
        <div className="container mx-auto flex">
          {isBeforeApplicationStartDate &&
            <InactiveButton
              label={`Applications Open ${round.applicationsStartTime.toLocaleDateString()}`}
              testid="applications-open-button"
             />
          }

          {isDuringApplicationPeriod &&
           <ApplyButton
            applicationURL={applicationURL}
           />
          }

          {isAfterApplicationEndDateAndBeforeRoundStartDate &&
            <InactiveButton
              label="Applications Closed"
              testid="applications-closed-button"
             />
          }
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
      onClick={() => window.open(applicationURL, '_blank')}
      className="basis-full items-center justify-center shadow-sm text-sm rounded border-1 bg-violet-100 text-violet-400 md:h-12 hover:bg-violet-200"
      data-testid="apply-button"
    >
      Apply to Grant Round
    </Button>
  )
};

const InactiveButton = (props: { label: string; testid: string }) => {

  const { label, testid} = props;

  return (
    <Button
      type="button"
      className="basis-full items-center justify-center shadow-sm text-sm rounded border-1 md:h-12"
      data-testid={testid}
      disabled={true}
    >
      {label}
    </Button>
)};
