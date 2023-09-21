import { InformationCircleIcon } from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";
import React from "react";

export function ApplyTooltip() {
  return (
    <div>
      <InformationCircleIcon
        data-tip
        data-background-color="#5932C4"
        data-for="apply-tooltip"
        className="inline h-4 w-4 ml-1 mb-1 mt-4"
        data-testid={"apply-tooltip"}
      />

      <ReactTooltip
        id="apply-tooltip"
        place="bottom"
        type="dark"
        effect="solid"
      >
        <p className="text-xs">
          Apply the same donation amount <br />
          to all of the projects you currently <br />
          have in your cart. You can also set <br />
          individual donation amounts <br />
          below.
        </p>
      </ReactTooltip>
    </div>
  );
}
