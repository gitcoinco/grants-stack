import { useState } from "react";
import { getConfig, switchAlloVersion } from "../config";
import AlloV1 from "../icons/AlloV1";
import AlloV2 from "../icons/AlloV2";
import classNames from "classnames";

export default function AlloVersionSwitcher() {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentVersion = getConfig().allo.version;

  return (
    <div className="relative">
      <div
        className={classNames(
          "rounded-[8px] bg-white py-[8px] px-[16px] flex items-center justify-center cursor-pointer",
          {
            "rounded-b-none": isExpanded,
          }
        )}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        {currentVersion === "allo-v1" && (
          <AlloV1 color="black" className="h-[24px]" />
        )}
        {currentVersion === "allo-v2" && (
          <AlloV2 color="black" className="h-[24px]" />
        )}
        <svg
          fill="none"
          height="7"
          width="14"
          className="ml-2"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            xmlns="http://www.w3.org/2000/svg"
          ></path>
        </svg>
      </div>
      <div
        className={classNames(
          "absolute bg-white rounded-b-[8px] w-full border-t hover:bg-gray-50",
          {
            hidden: !isExpanded,
          }
        )}
      >
        {currentVersion === "allo-v1" && (
          <button
            className="py-[8px] px-[16px]"
            onClick={() => {
              setIsExpanded(false);
              switchAlloVersion("allo-v2");
            }}
          >
            <AlloV2 color="black" className="h-[24px]" />
          </button>
        )}
        {currentVersion === "allo-v2" && (
          <button
            className="py-[8px] px-[16px]"
            onClick={() => {
              setIsExpanded(false);
              switchAlloVersion("allo-v1");
            }}
          >
            <AlloV1 color="black" className="h-[24px]" />
          </button>
        )}
      </div>
    </div>
  );
}
