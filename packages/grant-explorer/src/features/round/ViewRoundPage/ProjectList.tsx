import { useMemo } from "react";

import { Project, Round } from "../../api/types";

import { BasicCard } from "../../common/styles";

import { Application, useDataLayer } from "data-layer";
import { useRoundApprovedApplications } from "../../projects/hooks/useRoundApplications";
import { ProjectCard } from "./ProjectCard";

export const ProjectList = (props: {
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
