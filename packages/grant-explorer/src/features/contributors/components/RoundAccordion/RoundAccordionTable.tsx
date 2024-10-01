import { Contribution } from "data-layer";
import { RoundAccordionTableRow } from "./RoundAccordionTableRow";

export function RoundAccordionTable({
  contributions,
}: {
  contributions: Contribution[];
}) {
  return (
    <div className="bg-grey-75 rounded-lg p-2 py-1">
      <div className="mt-4 overflow-hidden">
        <div className="mx-auto">
          <div>
            <table className="w-full text-left">
              <thead className="font-sans text-lg">
                <tr>
                  <th>Project</th>
                  <th>Donation</th>
                </tr>
              </thead>
              <tbody>
                {contributions.length > 0 &&
                  contributions
                    .flat()
                    .sort(
                      (a, b) =>
                        (Number(b.timestamp) || Number.MAX_SAFE_INTEGER) -
                        (Number(a.timestamp) || Number.MAX_SAFE_INTEGER)
                    )

                    .map((contribution) => (
                      <RoundAccordionTableRow
                        key={contribution.id}
                        contribution={contribution}
                      />
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
