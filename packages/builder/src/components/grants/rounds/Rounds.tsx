import { Divider } from "@chakra-ui/react";
import {
  ProjectApplicationWithRound,
  RoundCategory,
  strategyNameToCategory,
} from "data-layer";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../../reducers";
import { RoundDisplayType } from "../../../types";
import { formatDateAsNumber, isInfinite } from "../../../utils/components";
import RoundListItem from "./RoundListItem";

const displayHeaders = {
  [RoundDisplayType.Active]: "Active Rounds",
  [RoundDisplayType.Current]: "Current Applications",
  [RoundDisplayType.Past]: "Past Rounds",
};

function secondsSinceEpoch(): number {
  const date = new Date();
  return Math.floor(date.getTime() / 1000);
}

export default function Rounds({
  applications,
}: {
  applications: ProjectApplicationWithRound[];
}) {
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const projectId = params.id!;
    const fullId = `${params.chainId}:${params.registryAddress}:${params.id}`;
    const { rounds } = state;

    const mappedApplications = applications.map((app) => {
      const { round } = app;

      const isDirectGrants =
        round?.strategyName &&
        strategyNameToCategory(round?.strategyName) === RoundCategory.Direct;

      const infiniteApplicationsEndDate = isInfinite(
        formatDateAsNumber(round?.applicationsEndTime)
      );
      const infiniteRoundEndDate = isInfinite(
        formatDateAsNumber(
          isDirectGrants ? round?.applicationsEndTime : round?.donationsEndTime
        )
      );

      if (round) {
        let category = null;
        const currentTime = secondsSinceEpoch();

        const applicationsStartTime = formatDateAsNumber(
          round.applicationsStartTime
        );
        const applicationsEndTime = formatDateAsNumber(
          round.applicationsEndTime
        );
        const donationsStartTime = isDirectGrants
          ? applicationsStartTime
          : formatDateAsNumber(round.donationsStartTime);
        const donationsEndTime = isDirectGrants
          ? applicationsEndTime
          : formatDateAsNumber(round.donationsEndTime);

        // Current Applications
        // FOCUS on Direct Rounds infinite periods
        // FOCUS on Both Rounds application dates period
        // FOCUS on Quadratic Rounds roundStartTime not met
        if (
          !infiniteApplicationsEndDate &&
          !infiniteRoundEndDate &&
          applicationsStartTime < currentTime &&
          applicationsEndTime > currentTime &&
          donationsStartTime !== applicationsStartTime &&
          donationsStartTime > currentTime
        ) {
          category = RoundDisplayType.Current;
        }
        // Active Rounds
        // FOCUS on Direct Rounds infinite periods
        // FOCUS on Round dates period
        if (
          (infiniteApplicationsEndDate && infiniteRoundEndDate) ||
          (donationsEndTime > currentTime &&
            donationsStartTime < currentTime &&
            (donationsEndTime === applicationsEndTime ||
              applicationsEndTime < currentTime) &&
            applicationsStartTime < currentTime)
        ) {
          category = RoundDisplayType.Active;
        }
        // Past Rounds
        // EXCLUDES Direct Rounds since infinite periods
        // FOCUS on Round dates period
        if (
          !infiniteRoundEndDate &&
          donationsEndTime < currentTime &&
          donationsStartTime < currentTime
        ) {
          category = RoundDisplayType.Past;
        }

        return { app, category };
      }

      // the round is not yet loaded
      return { app, category: null };
    });

    return {
      rounds,
      projectId,
      fullId,
      mappedApplications,
    };
  });

  const renderStatGroup = (
    displayType: RoundDisplayType,
    userApplications: ProjectApplicationWithRound[]
  ) => (
    <div>
      <span className="text-gitcoin-grey-500 text-[12px] font-normal">
        {displayHeaders[displayType]}
      </span>
      {userApplications.length > 0 ? (
        userApplications.map((app) => (
          <div key={app.roundId}>
            <RoundListItem
              applicationData={app}
              displayType={displayType as RoundDisplayType}
              projectId={props.fullId}
            />
            <Divider className="" borderColor="#F3F3F5" />
          </div>
        ))
      ) : (
        <div className="text-base text-gitcoin-grey-400 flex flex-col items-center justify-center p-10">
          <span> No Data </span>
        </div>
      )}

      <Divider className="mb-8" borderColor="#E2E0E7" />
    </div>
  );

  return (
    <div className="w-full mb-4">
      <div className="flex-col">
        {Object.values(RoundDisplayType).map((displayType) => (
          <div key={displayType}>
            {renderStatGroup(
              displayType as RoundDisplayType,
              // when props.applications is undefined, we are still loading, when it's not undefined, we check if any of the rounds are still loading
              props.mappedApplications?.flatMap(({ app, category }) =>
                category === displayType ? [app] : []
              ) ?? []
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
