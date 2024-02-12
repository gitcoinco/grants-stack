// eslint-disable max-len
import { ApplicationStatus, ProjectApplication } from "data-layer";
import { Badge, Box, Spinner } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE, RoundType } from "common";
import { RootState } from "../../../reducers";
import { roundApplicationPathForProject } from "../../../routes";
import { Round, RoundDisplayType } from "../../../types";
import { formatDateFromSecs, isInfinite } from "../../../utils/components";
import generateUniqueRoundApplicationID from "../../../utils/roundApplication";
import { getProjectURIComponents } from "../../../utils/utils";
import LinkManager from "./LinkManager";

export default function RoundListItem({
  applicationData,
  displayType,
  projectId,
}: {
  applicationData?: ProjectApplication;
  displayType?: RoundDisplayType;
  projectId: string;
}) {
  const [roundData, setRoundData] = useState<Round>();
  const props = useSelector((state: RootState) => {
    const { roundId, chainId: projectChainId } = applicationData!;
    const roundState = state.rounds[roundId];
    const round = roundState ? roundState.round : undefined;
    const roundAddress = round?.address;
    const {
      chainId: roundChain,
      registryAddress,
      id,
    } = getProjectURIComponents(projectId);
    const generatedProjectId = generateUniqueRoundApplicationID(
      projectChainId,
      id,
      registryAddress
    );

    return {
      round,
      roundId,
      roundChain,
      roundAddress,
      projectId: id,
      generatedProjectId,
    };
  });

  const renderApplicationDate = () =>
    roundData && (
      <>
        {formatDateFromSecs(roundData.applicationsStartTime)} -{" "}
        {!isInfinite(roundData.applicationsEndTime) &&
        roundData.applicationsEndTime
          ? formatDateFromSecs(roundData.applicationsEndTime)
          : "No End Date"}
      </>
    );

  const renderRoundBadge = () => {
    let colorScheme:
      | {
          bg: string;
          text: string;
        }
      | undefined;

    switch (roundData?.payoutStrategy as RoundType) {
      case "MERKLE":
        colorScheme = {
          bg: "#E6FFF9",
          text: "gitcoin-grey-500",
        };
        break;
      case "DIRECT":
        colorScheme = {
          bg: "#FDDEE4",
          text: "gitcoin-grey-500",
        };
        break;
      default:
        colorScheme = undefined;
        break;
    }

    const roundPayoutStrategy = roundData?.payoutStrategy;

    return (
      <span>
        <Badge
          backgroundColor={colorScheme?.bg}
          className="max-w-fit"
          borderRadius="full"
          p={2}
          textTransform="inherit"
        >
          {roundPayoutStrategy === ROUND_PAYOUT_MERKLE ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              Quadratic Funding
            </span>
          ) : null}
          {roundPayoutStrategy === ROUND_PAYOUT_DIRECT ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              Direct Grant
            </span>
          ) : null}
        </Badge>
      </span>
    );
  };

  const renderApplicationBadge = (dt: RoundDisplayType) => {
    let colorScheme:
      | {
          bg: string;
          text: string;
        }
      | undefined;
    switch (applicationData?.status as ApplicationStatus) {
      case "APPROVED":
        colorScheme = {
          bg: "#E6FFF9",
          text: "gitcoin-grey-500",
        };
        break;
      case "REJECTED":
        colorScheme = {
          bg: "#FDDEE4",
          text: "gitcoin-grey-500",
        };
        break;
      case "PENDING":
        colorScheme = {
          text: "gitcoin-grey-500",
          bg: "#E2E0E7",
        };
        break;
      case "RECEIVED":
        colorScheme = {
          text: "gitcoin-grey-500",
          bg: "#E2E0E7",
        };
        break;
      default:
        colorScheme = undefined;
        break;
    }

    const applicationStatus = applicationData?.status;
    const isDirectRound = props.round?.payoutStrategy === ROUND_PAYOUT_DIRECT;
    const applicationInReview = applicationData?.inReview;

    if (RoundDisplayType.Current === dt) {
      return (
        <Badge
          className="max-w-fit"
          backgroundColor={colorScheme?.bg}
          borderRadius="full"
          p={2}
          textTransform="inherit"
        >
          {applicationStatus === "REJECTED" ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              Rejected
            </span>
          ) : null}
          {applicationStatus === "PENDING" &&
          isDirectRound &&
          !applicationInReview ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              Received
            </span>
          ) : null}
          {(applicationStatus === "PENDING" && !isDirectRound) ||
          (isDirectRound && applicationInReview) ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              In Review
            </span>
          ) : null}
          {applicationStatus === "APPROVED" ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              Approved
            </span>
          ) : null}
        </Badge>
      );
    }

    if (RoundDisplayType.Past === dt) {
      return (
        <div>
          {applicationData?.status === "PENDING" ||
          applicationData?.status === "REJECTED" ? (
            <span className="text-gitcoin-grey-500 text-[14px]">
              Not Approved
            </span>
          ) : null}
          {applicationData?.status === "APPROVED" ? (
            <span className="text-gitcoin-grey-500 text-[14px]">Approved</span>
          ) : null}
        </div>
      );
    }

    if (RoundDisplayType.Active === dt) {
      if (applicationData?.status === "PENDING" && !applicationInReview) {
        return <span className={`text-${colorScheme?.text}`}>Received</span>;
      }
      if (
        (applicationStatus === "PENDING" && !isDirectRound) ||
        (isDirectRound && applicationInReview)
      ) {
        return <span className={`text-${colorScheme?.text}`}>In Review</span>;
      }
      if (applicationData?.status === "REJECTED") {
        return <span className={`text-${colorScheme?.text}`}>Rejected</span>;
      }

      return <span className="text-gitcoin-teal-500 ml-4 lg:ml-2">Active</span>;
    }

    return null;
  };

  const applicationLink = roundApplicationPathForProject(
    props.roundChain!,
    props.roundAddress!,
    projectId
  );
  const explorerUrl = process.env.REACT_APP_GRANT_EXPLORER;

  // add check for application status
  // const enableStatusButton = () =>
  //   applicationData?.status === "APPROVED" &&
  //   displayType === RoundDisplayType.Past;

  useEffect(() => {
    if (props.round) {
      setRoundData(props.round);
    }
  }, [props.round]);

  return (
    <Box>
      <Box className="w-full my-8 lg:flex md:flex basis-0 justify-between items-center text-[14px] text-gitcoin-grey-400">
        <Box className="flex-1 my-2">
          {!props.round?.programName ? (
            <Spinner />
          ) : (
            <span>{props.round?.programName}</span>
          )}
        </Box>
        <Box className="flex-1 my-2">
          {!props.round?.roundMetadata.name ? (
            <Spinner />
          ) : (
            <span>{props.round?.roundMetadata.name}</span>
          )}
        </Box>
        <Box className="flex-1 my-2">
          {!props.round?.roundStartTime ? (
            <Spinner />
          ) : (
            <span>{renderApplicationDate()}</span>
          )}
        </Box>
        <Box className="flex-1 my-2">{renderRoundBadge()}</Box>
        <Box className="flex-1 my-2">
          {renderApplicationBadge(displayType!)}
        </Box>
        <Box className="flex-1 my-2">
          {displayType === RoundDisplayType.Active ? (
            <LinkManager
              linkProps={{
                displayType: RoundDisplayType.Active,
                link:
                  `${explorerUrl}/#/round/${props.roundChain}/` +
                  `${props.roundAddress}`,
                text: "View on Explorer",
                applicationStatus: applicationData?.status!,
              }}
            />
          ) : null}
          {/* todo: add check for application status */}
          {displayType === RoundDisplayType.Current ? (
            <LinkManager
              linkProps={{
                displayType: RoundDisplayType.Current,
                link: applicationLink,
                text: "View Application",
                applicationStatus: applicationData?.status!,
              }}
            />
          ) : null}
          {/* {displayType === RoundDisplayType.Past ? (
            <LinkManager
              linkProps={{
                displayType: RoundDisplayType.Past,
                link: `https://manager.gitcoin.co/#/round/${props.roundAddress}`,
                text: "View Stats",
                enableStats: enableStatusButton(),
                applicationStatus: applicationData?.status!,
              }}
            />
          ) : null} */}
        </Box>
      </Box>
    </Box>
  );
}

// todo: add tests for this component
