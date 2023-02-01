import { Divider, Spinner } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../../reducers";
import { Application } from "../../../reducers/projects";
import { Status } from "../../../reducers/rounds";
import { RoundDisplayType } from "../../../types";
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

export default function Rounds() {
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const projectId = params.id!;
    const fullId = `${params.chainId}:${params.registryAddress}:${params.id}`;
    const { rounds } = state;

    const applications = state.projects.applications[params.id!]?.map((app) => {
      const roundState = state.rounds[app.roundID];

      if (!roundState) {
        return { app, category: null, isLoading: true };
      }

      const status = roundState.status ?? Status.Undefined;
      const { round } = roundState;

      if (status === Status.Loaded && round) {
        let category = null;
        const currentTime = secondsSinceEpoch();
        // Current Applications
        if (
          round.applicationsStartTime < currentTime &&
          round.applicationsEndTime > currentTime &&
          round.roundStartTime > currentTime &&
          round.roundEndTime > currentTime
        ) {
          category = RoundDisplayType.Current;
        }
        // Active Rounds
        if (
          round.roundEndTime > currentTime &&
          round.roundStartTime < currentTime &&
          round.applicationsEndTime < currentTime &&
          round.applicationsStartTime < currentTime
        ) {
          category = RoundDisplayType.Active;
        }
        // Past Rounds
        if (
          round.roundEndTime < currentTime &&
          round.roundStartTime < currentTime &&
          round.applicationsEndTime < currentTime &&
          round.applicationsStartTime < currentTime
        ) {
          category = RoundDisplayType.Past;
        }

        return { app, category, isLoading: false };
      }

      // the round is not yet loaded
      return { app, category: null, isLoading: true };
    });

    return {
      rounds,
      projectId,
      fullId,
      applications,
    };
  });

  const renderStatGroup = (
    displayType: RoundDisplayType,
    isLoading: boolean,
    applications: Application[]
  ) => (
    <div>
      <span className="text-gitcoin-grey-500 text-[12px] font-normal">
        {displayHeaders[displayType]}
      </span>
      {!isLoading &&
        applications.length > 0 &&
        applications.map((app) => (
          <div key={app.roundID}>
            <RoundListItem
              applicationData={app}
              displayType={displayType as RoundDisplayType}
              projectId={props.fullId}
            />
            <Divider className="" borderColor="#F3F3F5" />
          </div>
        ))}
      {!isLoading && applications.length === 0 && (
        <div className="text-base text-gitcoin-grey-400 flex flex-col items-center justify-center p-10">
          <span>No Data</span>
        </div>
      )}
      {isLoading && (
        <div className="text-base text-gitcoin-grey-400 flex flex-col items-center justify-center p-10">
          <span>Loading your information, please stand by...</span>
          <Spinner className="flex mt-4" />
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
              props.applications?.some((a) => a.isLoading) ?? true,
              props.applications?.flatMap(({ app, category }) =>
                category === displayType ? [app] : []
              ) ?? []
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
