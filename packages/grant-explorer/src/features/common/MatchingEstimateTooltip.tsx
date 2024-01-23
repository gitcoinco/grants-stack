import { InformationCircleIcon } from "@heroicons/react/24/solid";
import React from "react";
import { Tooltip } from "@chakra-ui/react";

export function MatchingEstimateTooltip(props: { isEligible: boolean }) {
  return (
    <div>
      <Tooltip
        hasArrow
        closeDelay={1000}
        placement={"bottom-end"}
        label={
          <p className="text-xs p-1 pointer-events-auto select-all">
            {props.isEligible ? (
              <>
                Due to the nature of quadratic funding, this estimated match is
                subject to change as the round progresses. Your match may start
                at $0, but can change as the project receives more donations.
                Read more about how quadratic funding works{" "}
                <a
                  href="https://wtfisqf.com"
                  className={"underline"}
                  target={"_blank"}
                >
                  here
                </a>
                .
              </>
            ) : (
              <>
                Keep in mind that this is a potential match that may change with
                the number of donations to a round.
                <a
                  href="https://passport.gitcoin.co"
                  className={"underline"}
                  target="_blank"
                >
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
          data-background-color="#5932C4"
          className="inline w-4 h-4 ml-2"
          data-testid={"matching-estimate-tooltip"}
        />
      </Tooltip>
    </div>
  );
}
