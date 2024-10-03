import { Contribution } from "data-layer";
import { RoundAccordionContribution } from "./RoundAccordionContribution";

export function RoundAccordionPanel({
  contributions,
}: {
  contributions: Contribution[];
}) {
  return (
    <div className="flex flex-col gap-4 bg-grey-75 rounded-lg p-2 pb-[12px]">
      <div className="flex items-center justify-between px-4 font-sans font-medium text-base">
        <span className="flex-1">Project</span>
        <span className="flex-1 text-center">Donation</span>
        <div className="flex-1"></div>
      </div>
      {contributions.length > 0 &&
        contributions
          .flat()
          .sort(
            (a, b) =>
              (Number(b.timestamp) || Number.MAX_SAFE_INTEGER) -
              (Number(a.timestamp) || Number.MAX_SAFE_INTEGER)
          )

          .map((contribution) => (
            <RoundAccordionContribution
              key={contribution.id}
              contribution={contribution}
            />
          ))}
    </div>
  );
}
