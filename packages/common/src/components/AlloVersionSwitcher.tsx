import { createContext, useCallback, useContext, useState } from "react";
import { getAlloVersion, switchAlloVersionAndReloadPage } from "../config";
import AlloV1 from "../icons/AlloV1";
import AlloV2 from "../icons/AlloV2";
import classNames from "classnames";
import { Spinner } from "./Spinner";
import { AlloVersion } from "data-layer/dist/data-layer.types";
import { useAllo } from "../allo/react";

const AlloVersionContext = createContext<{
  version: AlloVersion;
  switchingToVersion: AlloVersion | null;
  switchToVersion: (version: AlloVersion) => void;
}>({
  version: getAlloVersion(),
  switchingToVersion: null,
  switchToVersion: () => {
    /* noop */
  },
});

export function AlloVersionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentVersion] = useState(getAlloVersion());
  const [switchingToVersion, setSwitchingToVersion] =
    useState<AlloVersion | null>(null);

  const switchToVersion = useCallback(
    (version: AlloVersion) => {
      if (version === currentVersion) {
        return;
      }

      setSwitchingToVersion(version);

      setTimeout(() => {
        switchAlloVersionAndReloadPage(version);
      }, 1500);
    },
    [currentVersion]
  );

  return (
    <AlloVersionContext.Provider
      value={{
        version: currentVersion,
        switchingToVersion,
        switchToVersion,
      }}
    >
      {switchingToVersion && (
        <div
          className="fixed inset-0 backdrop-blur-sm  bg-black/30 z-30 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="bg-white rounded-3xl py-16 px-28 flex flex-col items-center justify-center">
            <Spinner className="mb-4" />
            <div>
              Switching to Allo {switchingToVersion.split("-")[1]}
              ...
            </div>
          </div>
        </div>
      )}
      {children}
    </AlloVersionContext.Provider>
  );
}

export function useAlloVersion() {
  return useContext(AlloVersionContext);
}

export default function AlloVersionSwitcher({
  isHidden,
}: {
  isHidden?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { version: currentVersion, switchToVersion } = useAlloVersion();

  if (isHidden) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          title="Switch between Allo versions"
          className={classNames(
            "py-[8px] px-[16px] flex items-center justify-center cursor-pointer"
          )}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {currentVersion === "allo-v1" && (
            <AlloV1 color="white" className="h-[24px]" />
          )}
          {currentVersion === "allo-v2" && (
            <AlloV2 color="white" className="h-[24px]" />
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
              stroke="white"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              xmlns="http://www.w3.org/2000/svg"
            ></path>
          </svg>
        </button>
        <button
          className={classNames(
            "absolute bg-white/80 p-4 rounded-[8px] hover:bg-white backdrop-blur-sm mt-0.5 font-mono font-medium right-0 whitespace-nowrap z-30",
            {
              hidden: !isExpanded,
            }
          )}
          onClick={() => {
            setIsExpanded(false);
            switchToVersion(
              currentVersion === "allo-v1" ? "allo-v2" : "allo-v1"
            );
          }}
        >
          Switch to Allo {currentVersion === "allo-v1" ? "v2" : "v1"}
        </button>
      </div>
    </>
  );
}
