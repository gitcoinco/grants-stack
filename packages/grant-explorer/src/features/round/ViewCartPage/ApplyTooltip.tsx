import { InformationCircleIcon } from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";

export function ApplyTooltip() {
  return (
    <div>
      <InformationCircleIcon
        data-tip
        data-background-color="#15B8DC"
        data-for="apply-tooltip"
        className="inline h-5 w-5 ml-0 mb-1 mt-4"
        data-testid={"apply-tooltip"}
        fill="#15B8DC"
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
