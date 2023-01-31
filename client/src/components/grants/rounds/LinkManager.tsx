import { Button } from "@chakra-ui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { AppStatus } from "../../../reducers/projects";
import { RoundDisplayType } from "../../../types";

export type LinkProps = {
  displayType?: RoundDisplayType;
  link: string;
  text: string;
  enableStats?: boolean;
  applicationStatus: AppStatus;
};

export default function LinkManager({ linkProps }: { linkProps: LinkProps }) {
  const disabled = linkProps.displayType === RoundDisplayType.Current;
  const isActive =
    linkProps.displayType === RoundDisplayType.Active &&
    linkProps.applicationStatus === "APPROVED";
  const disableExternalLink = linkProps.applicationStatus === "APPROVED";

  const isMobile = window.innerWidth < 768;

  return (
    <div className="w-full">
      {linkProps.displayType === RoundDisplayType.Active ? (
        <Button
          disabled={!disableExternalLink}
          className={`bg-gitcoin-violet-100 flex p-2 my-4 rounded-md ${
            isActive && "cursor-not-allowed"
          }`}
          width={isMobile ? "100%" : "auto"}
        >
          {isActive ? (
            <a
              className="flex flex-row"
              href={linkProps.link}
              rel="noreferrer"
              target="_blank"
            >
              <ArrowTopRightOnSquareIcon
                className="flex mx-2 mt-[1px] text-gitcoin-violet-400"
                width={11}
                height={11}
              />
              <span
                className={`flex text-[12px] mr-1 text-violet-400 ${
                  !disableExternalLink && "cursor-not-allowed"
                }`}
              >
                {linkProps.text}
              </span>
            </a>
          ) : (
            <>
              <ArrowTopRightOnSquareIcon
                className="flex mx-2 mt-[1px] text-gitcoin-violet-400"
                width={11}
                height={11}
              />
              <span
                className={`flex text-[12px] mr-1 text-violet-400 ${
                  disabled && "cursor-not-allowed"
                }`}
              >
                {linkProps.text}
              </span>
            </>
          )}
        </Button>
      ) : null}
      {/* Applications link is todo: Andrea PR */}
      {linkProps.displayType === RoundDisplayType.Current ?? null}
      {linkProps.displayType === RoundDisplayType.Past ? (
        <Button
          disabled={!linkProps.enableStats}
          className={`bg-gitcoin-violet-100 flex p-2 rounded-md ${
            !linkProps.enableStats && "cursor-not-allowed"
          }`}
          width={isMobile ? "100%" : "auto"}
        >
          {linkProps.enableStats ? (
            <a
              href={linkProps.link}
              className="flex flex-row text-[12px] text-violet-400"
              rel="noreferrer"
              target="_blank"
            >
              <span className="flex text-[12px] mr-1 text-violet-400">
                {linkProps.text}
              </span>
            </a>
          ) : (
            <span
              className={`flex text-[12px] mr-1 text-violet-400 ${
                !linkProps.enableStats && "cursor-not-allowed"
              }`}
            >
              {linkProps.text}
            </span>
          )}
        </Button>
      ) : null}
    </div>
  );
}

// todo: add tests for this component
