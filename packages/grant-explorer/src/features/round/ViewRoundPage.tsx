import { datadogLogs } from "@datadog/browser-logs";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { Spinner } from "../common/Spinner";
import { Project, Requirement, Round } from "../api/types";
import {
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

  const { round, isLoading } = useRoundById(chainId!, roundId!);

  const [roundExists, setRoundExists] = useState(true);

  const [applicationsOpen, setApplicationsOpen] = useState(false);

  const [roundOpen, setRoundOpen] = useState(false);

  useEffect(() => {
    const currentTime = new Date();
    setRoundExists(!!round);
    if (round) {
      if (
        round.applicationsStartTime <= currentTime &&
        round.applicationsEndTime >= currentTime
      ) {
        setApplicationsOpen(true);
      }
      if (
        round.roundStartTime <= currentTime &&
        round.roundEndTime >= currentTime
      ) {
        setRoundOpen(true);
      }
    }
  }, [round]);

  return isLoading ? (
    <Spinner text="We're fetching the Round." />
  ) : (
    <>
      {!roundExists && <NotFoundPage />}
      {roundExists && applicationsOpen && !roundOpen && (
        <>
          <div className="mx-20 px-4 py-7 h-screen">
            <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
            <main>
              <PreRoundPage
                round={round}
                element={(req: Requirement, index) => (
                  <li key={index}>{req.requirement}</li>
                )}
              />
            </main>
          </div>
          <Footer />
        </>
      )}
      {roundExists && !applicationsOpen && (
        <>
          <div className="mx-20 px-4 py-7 h-screen">
            <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
            <main>
              <p className="mt-6">
                <span>Round Name: </span>
                <span>{round?.roundMetadata!.name}</span>
              </p>
              {round?.approvedProjects ? (
                <ProjectList
                  projects={round.approvedProjects}
                  roundRoutePath={`/round/${chainId}/${roundId}`}
                />
              ) : (
                <></>
              )}
            </main>
          </div>
          <Footer />
        </>
      )}
    </>
  );
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
            projectMetadata={props.project.projectMetadata}
            classNameOverride={
              "bg-black h-[120px] w-full object-cover rounded-t"
            }
          />
        </CardHeader>
        <CardContent>
          <CardTitle>{props.project.projectMetadata.title}</CardTitle>
        </CardContent>
      </Link>
    </BasicCard>
  );
}

const ProjectList = (props: {
  projects: Project[];
  roundRoutePath: string;
}): JSX.Element => {
  const { projects } = props;
  return (
    <CardsContainer>
      {projects.map((project, index) => {
        return (
          <ProjectCard
            key={index}
            project={project}
            roundRoutePath={props.roundRoutePath}
          />
        );
      })}
    </CardsContainer>
  );
};

function PreRoundPage(props: {
  round?: Round;
  element: (req: Requirement, index: number) => JSX.Element;
}) {
  return (
    <div className="container mx-auto flex flex-row bg-white">
      <div className="basis-1/2 mt-20 ">
        <div className="lg:inline-block md:inline-block"></div>
        <p className="mb-2 text-xl text-black font-bold">{props.round?.roundMetadata?.name!}</p>
        <p className="text-lg my-2 text-black font-normal" data-testid="application-period">
          Application Period:
          <span>
            {" "}
            &nbsp;
            {props.round?.applicationsStartTime.toLocaleDateString()}
            &nbsp;
            <span>-</span>
            &nbsp;
            {props.round?.applicationsEndTime.toLocaleDateString()}
          </span>
        </p>
        <p className="text-lg my-2 text-black font-normal" data-testid="round-period">
          Round Period:
          <span>
            {" "}
            &nbsp;
            {props.round?.roundStartTime.toLocaleDateString()}
            &nbsp;
            <span>-</span>
            &nbsp;
            {props.round?.roundEndTime.toLocaleDateString()}
          </span>
        </p>
        <p className="text-lg my-2 text-black font-normal">Matching Funds Available: $$$</p>
        <p className="text-lg mt-4 mb-4 my-2 text-black font-normal">
          <span>{props.round?.roundMetadata?.eligibility?.description}</span>
        </p>
        <p className="mb-2 text-lg text-black font-bold" data-testid="round-eligibility">Round Eligibility</p>
        <ul className="list-disc list-inside text-lg text-black font-normal">
          {props.round?.roundMetadata?.eligibility.requirements?.map(
            props.element
          )}
        </ul>
      </div>
      <div className="basis-1/2 right-0"></div>
    </div>
  );
}