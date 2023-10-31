import tw from "tailwind-styled-components";

export const RoundDaysLeft = ({
  daysLeft = 0,
  daysLeftToApply = 0,
  isValidRoundEndTime = true,
}) => {
  const days = pluralize(["day", "days"]);
  return (
    <div className="flex-1">
      {daysLeftToApply > 0 && (
        <DaysLeft data-testid="apply-days-left">
          {daysLeftToApply} {days(daysLeftToApply)} left to apply
        </DaysLeft>
      )}
      <DaysLeft data-testid="days-left">
        {isValidRoundEndTime ? (
          <span>
            {daysLeft} {days(daysLeft)} left in round
          </span>
        ) : (
          <span>No end time</span>
        )}
      </DaysLeft>
    </div>
  );
};

const DaysLeft = tw.div`
text-xs
w-full
font-mono
whitespace-nowrap
`;

// If we need something more advanced or to use in another place in codebase, we can pull in a library
const pluralize =
  ([singular = "", plural = ""]) =>
  (num = 0) =>
    num ? (num === 1 ? singular : plural) : plural;
