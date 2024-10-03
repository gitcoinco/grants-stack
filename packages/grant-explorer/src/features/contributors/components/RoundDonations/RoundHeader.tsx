import { InformationCircleIcon } from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";

export function RoundHeader() {
  return (
    <div className="px-4 flex items-center justify-between font-modern-era-regular font-medium text-lg/[26px]">
      <div className="flex-1">Round</div>
      <div className="flex flex-row flex-1 gap-1 items-center justify-center">
        <div className="text-center">Total Donation</div>
        <div className="flex items-center">
          <InformationCircleIcon
            data-tip
            data-background-color="#0E0333"
            data-for="donation-tooltip"
            className="inline size-5"
            data-testid={"donation-tooltip"}
            fill="black"
          />
          <ReactTooltip
            id="donation-tooltip"
            place="bottom"
            type="dark"
            effect="solid"
          >
            <p className="text-xs">
              The displayed amount in USD reflects <br />
              the value at the time of your donation.
            </p>
          </ReactTooltip>
        </div>
      </div>
      <div className="flex-1"></div>
    </div>
  );
}
