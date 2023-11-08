import tw from "tailwind-styled-components";

export function getRoundDaysText({
  roundStartsIn,
  roundEndsIn,
}: {
  roundStartsIn?: number;
  roundEndsIn?: number;
}) {
  const days = pluralize(["day", "days"]);

  if (roundStartsIn && roundStartsIn > 0) {
    return `Starts in ${roundStartsIn} ${days(roundStartsIn)}`;
  }
  if (roundEndsIn === 0) return "Ends today";
  if (!roundEndsIn) return "No round end date";

  return roundEndsIn > 0
    ? `${roundEndsIn} ${days(roundEndsIn)} left in round`
    : `Ended ${-roundEndsIn} ${days(-roundEndsIn)} ago`;
}

export const RoundDaysDetails = ({
  roundStartsIn = 0,
  roundEndsIn = 0,
  applicationsEndIn = 0,
}) => {
  const days = pluralize(["day", "days"]);

  const startsOrEndsIn = getRoundDaysText({ roundStartsIn, roundEndsIn });
  return (
    <div className="flex-1">
      {applicationsEndIn > 0 && (
        <Days data-testid="apply-days-left">
          {applicationsEndIn} {days(applicationsEndIn)} left to apply
        </Days>
      )}
      <Days data-testid="days-left">{startsOrEndsIn}</Days>
    </div>
  );
};

const Days = tw.div`
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
