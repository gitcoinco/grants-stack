import tw from "tailwind-styled-components";

export function getRoundDaysText({
  roundStartsIn,
  roundEndsIn,
}: {
  roundStartsIn?: number;
  roundEndsIn?: number;
}) {
  const dayTerm = getSingularPlural(["day", "days"]);

  if (roundStartsIn !== undefined && roundStartsIn > 0) {
    return `Starts in ${roundStartsIn} ${dayTerm(roundStartsIn)}`;
  }
  if (roundEndsIn === undefined) return "No round end date";
  if (roundEndsIn === 0) return "Ends today";

  return roundEndsIn > 0
    ? `${roundEndsIn} ${dayTerm(roundEndsIn)} left in round`
    : `Ended ${-roundEndsIn} ${dayTerm(-roundEndsIn)} ago`;
}

export function getRoundApplicationDaysText({
  applicationsStartsIn,
  applicationsEndsIn,
}: {
  applicationsStartsIn?: number;
  applicationsEndsIn?: number;
}) {
  const dayTerm = getSingularPlural(["day", "days"]);

  // Hide if application date has passed
  if (applicationsEndsIn === undefined || applicationsEndsIn < 0) return "";

  if (applicationsEndsIn === 0) return "Last day to apply";
  if (
    applicationsStartsIn !== undefined &&
    applicationsStartsIn > 0 &&
    applicationsEndsIn > 0
  ) {
    return `Apply in ${applicationsStartsIn} ${dayTerm(applicationsStartsIn)}`;
  }
  return `${applicationsEndsIn} ${dayTerm(applicationsEndsIn)} left to apply`;
}

export const RoundDaysDetails = ({
  roundStartsIn,
  roundEndsIn,
  applicationsStartsIn,
  applicationsEndsIn,
}: {
  roundStartsIn: number | undefined;
  roundEndsIn: number | undefined;
  applicationsStartsIn: number | undefined;
  applicationsEndsIn: number | undefined;
}) => {
  const startsOrEndsIn = getRoundDaysText({ roundStartsIn, roundEndsIn });
  const applicationsIn = getRoundApplicationDaysText({
    applicationsStartsIn,
    applicationsEndsIn,
  });
  return (
    <div className="flex-1">
      <Days data-testid="apply-days-left">{applicationsIn}</Days>
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
const getSingularPlural =
  ([singular = "", plural = ""]) =>
  (num = 0) =>
    num ? (num === 1 ? singular : plural) : plural;
