import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { getAlloVersion } from "common/src/config";

export default function AlloVersionBanner() {
  const alloVersion = getAlloVersion();

  return (
    <div>
      <ExclamationCircleIcon className="h-5 w-5 inline-block mr-2" />
      {alloVersion === "allo-v2" ? (
        <>
          Rounds launched before the 25th of March appear on Allo v1. Check out
          those rounds{" "}
          <a
            className="underline"
            target="_blank"
            href="https://explorer-v1.gitcoin.co"
          >
            here
          </a>
          !
        </>
      ) : (
        <>
          Rounds launched after the 24th of March appear on Allo v2. Check out
          those rounds{" "}
          <a
            className="underline"
            target="_blank"
            href="https://explorer.gitcoin.co"
          >
            here
          </a>
          !
        </>
      )}
    </div>
  );
}
