import { RoundOverview } from "../api/rounds";
import { Spinner } from "../common/Spinner";
import NoRounds from "./NoRounds";
import RoundCard from "./RoundCard";

type ApplyNow = {
  isLoading: boolean;
  roundOverview: RoundOverview[];
};

const ApplyNowSection = (props: ApplyNow) => {
  const applyNowRoundsCount = props.roundOverview.length;

  return (
    <div>
      <div>
        <p className="text-grey-400 text-2xl">Apply Now</p>
        <div className="flex flex-col lg:flex-row justify-between">
          <p className="text-grey-400 mb-2 lg:mb-4 mt-2">
            Rounds currently accepting applications
          </p>
          <a className="cursor-pointer mr-1 text-violet-400 text-sm" href="/">
            {applyNowRoundsCount > 0
              ? `View All (${applyNowRoundsCount})`
              : null}
          </a>
        </div>
      </div>
      {props.isLoading ? (
        <div className="flex flex-col lg:flex-row my-auto">
          <Spinner />
        </div>
      ): 
        applyNowRoundsCount > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-6">
            {props.roundOverview.map((round, index) => {
              return <RoundCard key={index} round={round} />;
            })}
          </div>
        ) : (
          <NoRounds type={"apply"} />
        )
      }
    </div>
  );
};

export default ApplyNowSection;
