import tw from "tailwind-styled-components";

export function getRoundEndedText(daysLeft: number, isValid?: boolean) {
  if (!isValid) return "No end time";

  const days = pluralize(["day", "days"]);

  return daysLeft === 0
    ? "Ends today"
    : daysLeft > 0
    ? `${daysLeft} ${days(daysLeft)} left in round`
    : `Ended ${-daysLeft} ${days(-daysLeft)} ago`;
}

export const RoundDaysLeft = ({
  daysLeft = 0,
  daysLeftToApply = 0,
  isValidRoundEndTime = true,
}) => {
  const days = pluralize(["day", "days"]);

  const roundEndText = getRoundEndedText(daysLeft, isValidRoundEndTime);
  return (
    <div className="flex-1">
      {daysLeftToApply > 0 && (
        <DaysLeft data-testid="apply-days-left">
          {daysLeftToApply} {days(daysLeftToApply)} left to apply
        </DaysLeft>
      )}
      <DaysLeft data-testid="days-left">{roundEndText}</DaysLeft>
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
