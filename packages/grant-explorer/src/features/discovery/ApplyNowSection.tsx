import { Link } from "react-router-dom";
import { RoundOverview } from "../api/rounds";
import NoRounds from "./NoRounds";
import RoundCard from "./RoundCard";
import { Skeleton } from "@chakra-ui/react";

type ApplyNow = {
  isLoading: boolean;
  roundOverview?: RoundOverview[];
};

const ApplyNowSection = (props: ApplyNow) => {
  const applyNowRoundsCount = props.roundOverview?.length ?? 0;

  return (
    <div data-testid="apply-now-rounds">
      <div>
        <p className="text-grey-400 text-2xl">Apply Now</p>
        <div className="flex flex-col lg:flex-row justify-between">
          <p className="text-grey-400 mb-2 lg:mb-4 mt-2">
            Rounds currently accepting applications
          </p>
          <Link
            className="cursor-pointer mr-1 text-violet-400 text-sm"
            to="/apply-now"
          >
            {applyNowRoundsCount > 0 && `View All (${applyNowRoundsCount})`}
          </Link>
        </div>
      </div>
      {props.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6 2xl:grid-cols-4">
          {new Array(3).fill(undefined).map((_, index) => {
            return (
              // @ts-expect-error Tsc too weak to represent this type lol
              <Skeleton
                key={index}
                my={3}
                rounded={"md"}
                w={"full"}
                h={"64"}
                role={"progressbar"}
              />
            );
          })}
        </div>
      ) : applyNowRoundsCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6 2xl:grid-cols-4">
          {props.roundOverview?.slice(0, 4).map((round, index) => {
            return <RoundCard key={index} round={round} />;
          })}
        </div>
      ) : (
        <NoRounds type={"apply"} />
      )}
    </div>
  );
};

export default ApplyNowSection;
