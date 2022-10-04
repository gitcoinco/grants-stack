import { datadogLogs } from "@datadog/browser-logs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";
import NotFoundPage from "../common/NotFoundPage";
import { Spinner } from "../common/Spinner";
import { Project } from "../api/types";
import {
  BasicCard,
  CardContent,
  CardHeader,
  CardsContainer,
  CardTitle,
} from "../common/styles";
import { ProjectBanner } from "../common/ProjectBanner"

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const { round, isLoading } = useRoundById(chainId!, roundId!);

  const [roundExists, setRoundExists] = useState(true);
  useEffect(() => {
    setRoundExists(!!round);
  }, [round]);

  return isLoading ? (
    <Spinner text="We're fetching the Round." />
  ) : (
    <>
      {!roundExists && <NotFoundPage />}
      {roundExists && (
        <>
          <Navbar />
          <div className="container mx-auto px-4 py-16 h-screen">
            <main>
              <p>
                <span>Round Name: </span>
                <span>{round?.roundMetadata!.name}</span>
              </p>
              <p>
                <span>Program: </span>
                <span>{round?.ownedBy}</span>
              </p>
              {round?.approvedProjects ? (
                <ProjectList projects={round.approvedProjects} />
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

function ProjectCard(props: { project: Project }) {
  return (
    <BasicCard data-testid="project-card">
      <CardHeader>
        <ProjectBanner projectMetadata={props.project.projectMetadata} classNameOverride={"bg-black h-[120px] w-full object-cover rounded-t"}/>
      </CardHeader>
      <CardContent>
        <CardTitle>{props.project.projectMetadata.title}</CardTitle>
      </CardContent>
    </BasicCard>
  );
}

const ProjectList = (props: { projects: Project[] }): JSX.Element => {
  const { projects } = props;
  return (
    <CardsContainer>
      {projects.map((project, index) => {
        return <ProjectCard key={index} project={project} />;
      })}
    </CardsContainer>
  );
};
