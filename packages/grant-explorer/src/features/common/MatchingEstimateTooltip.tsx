import { InformationCircleIcon } from "@heroicons/react/24/solid";
import React from "react";
import { Tooltip, useBoolean } from "@chakra-ui/react";

export function MatchingEstimateTooltip(props: { isEligible: boolean }) {
  const [tooltipOpen, { toggle }] = useBoolean(false);
  return (
    <div>
      <Tooltip
        hasArrow
        closeDelay={500}
        placement={"bottom-end"}
        label={
          <p className="text-xs p-1 pointer-events-auto select-all">
            {props.isEligible ? (
              <>
                Due to the nature of quadratic funding, this estimated match is
                subject to change as the round progresses. Your match may start
                at $0, but can change as the project receives more donations.
                Read more about how quadratic funding works{" "}
                <a href="https://wtfisqf.com">here</a>.
              </>
            ) : (
              <>
                Keep in mind that this is a potential match. By connecting to
                Gitcoin Passport, you can update your score before or after
                submitting your donation.
                <a href="https://passport.gitcoin.co" target="_blank">
                  Click here
                </a>{" "}
                to configure your score.
              </>
            )}
          </p>
        }
        id="matching-estimate-tooltip"
        className={"max-w-sm bg-gray-500 text-gray-50"}
      >
        <InformationCircleIcon
          onClick={() => toggle()}
          data-background-color="#5932C4"
          className="inline w-4 h-4 ml-2"
          data-testid={"matching-estiamte-tooltip"}
        />
      </Tooltip>
    </div>
  );
}
