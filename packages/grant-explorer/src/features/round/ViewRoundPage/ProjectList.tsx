import { useMemo } from "react";

import { Project, Round } from "../../api/types";
import { Application, useDataLayer } from "data-layer";
import { useRoundApprovedApplications } from "../../projects/hooks/useRoundApplications";
import { useRoundStakingSummary } from "../../projects/hooks/useRoundStakingSummary";
import {
  SortOption,
  useSortApplications,
} from "../../projects/hooks/useSortApplications";
import { ProjectCard } from "./ProjectCard";
import { useSearchParams } from "react-router-dom";
import { useIsStakable } from "../ViewProjectDetails/components/StakingBannerAndModal/hooks/useIsStakable";

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
  const { projects: _projects, roundRoutePath, chainId, roundId } = props;
  const dataLayer = useDataLayer();
  const [searchParams] = useSearchParams();
  const sortOption = searchParams.get("orderBy");
  const isStakableRound = useIsStakable({
    chainId,
    roundId,
  });

  enum SortOptionEnum {
    TOTAL_STAKED_DESC = "totalStakedDesc",
    TOTAL_DONATIONS_DESC = "totalDonationsDesc",
    TOTAL_CONTRIBUTORS_DESC = "totalContributorsDesc",
    TOTAL_STAKED_ASC = "totalStakedAsc",
    TOTAL_CONTRIBUTORS_ASC = "totalContributorsAsc",
    TOTAL_DONATIONS_ASC = "totalDonationsAsc",
  }
  const params = isStakableRound
    ? {}
    : {
        chainId,
        roundId,
      };

  const { data: _applications } = useRoundApprovedApplications(
    params,
    dataLayer
  );

  const { data: poolSummary, isLoading } = useRoundStakingSummary(
    roundId,
    chainId.toString(),
    isStakableRound
  );

  const _stakedApplications = useSortApplications(
    poolSummary,
    chainId.toString(),
    roundId,
    SortOptionEnum[sortOption as keyof typeof SortOptionEnum] as SortOption
  );

  const applications = useMemo(() => {
    return _applications?.length ? _applications : (_stakedApplications ?? []);
  }, [_stakedApplications, _applications]);

  const isDonationPeriodStarted = props.showProjectCardFooter;

  const LeaderboardTitle = useMemo(() => {
    return sortOption === "TOTAL_STAKED_DESC"
      ? "Leaderboard - Most GTC Staked"
      : sortOption === "TOTAL_DONATIONS_DESC"
        ? "Leaderboard - Most Donations"
        : sortOption === "TOTAL_CONTRIBUTORS_DESC"
          ? "Leaderboard - Most Contributors"
          : sortOption === "TOTAL_STAKED_ASC"
            ? "Leaderboard - Least GTC Staked"
            : sortOption === "TOTAL_CONTRIBUTORS_ASC"
              ? "Leaderboard - Least Contributors"
              : sortOption === "TOTAL_DONATIONS_ASC"
                ? "Leaderboard - Least Donations"
                : isStakableRound && isDonationPeriodStarted
                  ? "Leaderboard - Most GTC Staked"
                  : "";
  }, [sortOption, isStakableRound, isDonationPeriodStarted]);

  const projects = useMemo(() => {
    return (applications.map((application) => {
      return _projects?.find(
        (project) =>
          project.anchorAddress?.toLowerCase() ===
          application.anchorAddress?.toLowerCase()
      );
    }) ?? []) as Project[];
  }, [applications, _projects]);

  const applicationsMapByGrantApplicationId:
    | Map<string, Application & { totalStaked?: number }>
    | undefined = useMemo(() => {
    if (!applications) return;
    const map: Map<string, Application & { totalStaked?: number }> = new Map();
    applications.forEach((application) =>
      map.set(application.projectId, application)
    );
    return map;
  }, [applications]);

  return (
    <div className="flex flex-col gap-y-8">
      {LeaderboardTitle && !props.isProjectsLoading && !isLoading && (
        <span className="text-[32px]/[39px] font-modern-era-medium">
          {LeaderboardTitle}
        </span>
      )}
      <div className="grid gap-x-6 gap-y-12 gap-5 justify-around md:justify-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
        {props.isProjectsLoading || isLoading ? (
          <>
            {Array(6)
              .fill("")
              .map((item, index) => (
                <div
                  key={index}
                  className="relative animate-pulse bg-grey-100 w-[326px] rounded-3xl h-[370px]"
                />
              ))}
          </>
        ) : projects?.length ? (
          <>
            {projects.map((project) => {
              return (
                <ProjectCard
                  key={project?.projectRegistryId}
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
                      project?.projectRegistryId ?? ""
                    )?.totalAmountDonatedInUsd ?? 0
                  }
                  uniqueContributorsCount={
                    applicationsMapByGrantApplicationId?.get(
                      project?.projectRegistryId ?? ""
                    )?.uniqueDonorsCount ?? 0
                  }
                  totalStaked={
                    applicationsMapByGrantApplicationId?.get(
                      project?.projectRegistryId ?? ""
                    )?.totalStaked ?? 0
                  }
                />
              );
            })}
          </>
        ) : (
          <p>No projects</p>
        )}
      </div>
    </div>
  );
};
