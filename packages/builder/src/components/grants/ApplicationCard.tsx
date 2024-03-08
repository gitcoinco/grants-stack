import { Badge, Box, Button, Image, Spinner } from "@chakra-ui/react";
import {
  ApplicationStatus,
  RoundCategory,
  strategyNameToCategory,
  useDataLayer,
} from "data-layer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loadRound } from "../../actions/rounds";
import { roundApplicationViewPath } from "../../routes";
import { ApplicationCardType, RoundSupport } from "../../types";
import {
  formatDate,
  formatDateAsNumber,
  isInfinite,
} from "../../utils/components";
import { getNetworkIcon, networkPrettyName } from "../../utils/wallet";

export default function ApplicationCard({
  applicationData,
}: {
  applicationData: ApplicationCardType;
}) {
  // const [roundData, setRoundData] = useState<Round>();
  const dataLayer = useDataLayer();
  const dispatch = useDispatch();

  const props = useSelector(() => {
    const { round } = applicationData.application;

    const support: RoundSupport | undefined = round?.roundMetadata?.support;

    // todo: ensure the strategy name is always set on the indexer and remove the fallback
    const payoutStrategy = round.strategyName
      ? strategyNameToCategory(round.strategyName)
      : RoundCategory.QuadraticFunding;

    const applicationChainName = networkPrettyName(
      Number(applicationData.chainId)
    );
    const applicationChainIconUri = getNetworkIcon(
      Number(applicationData.chainId)
    );

    const isDirectRound = payoutStrategy === RoundCategory.Direct;

    return {
      round,
      isDirectRound,
      support,
      payoutStrategy,
      applicationChainName,
      applicationChainIconUri,
    };
  });

  useEffect(() => {
    if (applicationData.roundID !== undefined) {
      dispatch(
        loadRound(applicationData.roundID, dataLayer, applicationData.chainId)
      );
    }
  }, [dispatch, applicationData.roundID]);

  const renderApplicationDate = () =>
    props.round && (
      <>
        {formatDate(props.round?.applicationsStartTime!)} -{" "}
        {!isInfinite(formatDateAsNumber(props.round?.applicationsEndTime!)) &&
        props.round?.applicationsEndTime
          ? formatDate(props.round?.applicationsEndTime!)
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

    switch (props.payoutStrategy) {
      case RoundCategory.QuadraticFunding:
        colorScheme = {
          bg: "#E6FFF9",
          text: "gitcoin-grey-500",
        };
        break;
      case RoundCategory.Direct:
        colorScheme = {
          bg: "#FDDEE4",
          text: "gitcoin-grey-500",
        };
        break;
      default:
        colorScheme = undefined;
        break;
    }

    const roundPayoutStrategy = props.payoutStrategy;

    return (
      <span>
        <Badge
          backgroundColor={colorScheme?.bg}
          className="max-w-fit"
          borderRadius="full"
          p={2}
          textTransform="inherit"
        >
          {roundPayoutStrategy === RoundCategory.QuadraticFunding ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              Quadratic Funding
            </span>
          ) : null}
          {roundPayoutStrategy === RoundCategory.Direct ? (
            <span className={`text-${colorScheme?.text} text-sm`}>
              Direct Grant
            </span>
          ) : null}
        </Badge>
      </span>
    );
  };

  const renderApplicationBadge = () => {
    let colorScheme:
      | {
          bg: string;
          text: string;
        }
      | undefined;
    switch (applicationData.application.status as ApplicationStatus) {
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

    const applicationStatus = applicationData.application.status;

    return (
      <Badge
        backgroundColor={colorScheme?.bg}
        className="max-w-fit"
        borderRadius="full"
        p={2}
        textTransform="inherit"
      >
        {applicationStatus === "PENDING" && props.isDirectRound ? (
          <span className={`text-${colorScheme?.text} text-sm`}>Received</span>
        ) : null}
        {(applicationStatus === "PENDING" && !props.isDirectRound) ||
        (props.isDirectRound && applicationStatus === "IN_REVIEW") ? (
          <span className={`text-${colorScheme?.text} text-sm`}>In Review</span>
        ) : null}
        {applicationStatus === "REJECTED" ? (
          <span className={`text-${colorScheme?.text} text-sm`}>Rejected</span>
        ) : null}
        {applicationStatus === "APPROVED" ? (
          <span className={`text-${colorScheme?.text} text-sm`}>Approved</span>
        ) : null}
      </Badge>
    );
  };

  const hasProperStatus = ["APPROVED", "PENDING", "IN_REVIEW"].includes(
    applicationData.application.status
  );

  if (!props.round?.roundMetadata) {
    return null;
  }

  return (
    <Box
      p={2}
      className="border-gray-300 pt-4 pb-7 px-5"
      borderWidth="1px"
      borderRadius="md"
    >
      <Box p={2} mb={1}>
        <span className="text-sm text-gitcoin-gray-400">
          {props.round?.roundMetadata.name}
        </span>
      </Box>
      <div className="flex justify-end w-fit mr-1 align-middle mb-2">
        <Image
          src={props.applicationChainIconUri}
          alt="chain icon"
          className="flex flex-row h-4 ml-2 mr-1 mt-1 rounded-full"
        />
        <span className="align-middle mb-1">{props.applicationChainName}</span>
      </div>
      <div className="flex flex-1 flex-col md:flex-row justify-between">
        <Box className="pl-2 text-gitcoin-gray-400">
          <div className="mb-1 text-sm">{props.round?.roundMetadata.name}</div>
          {props.round ? <span>{renderApplicationDate()}</span> : <Spinner />}
        </Box>
        <Box className="pl-2 mt-2 md:mt-0">{renderRoundBadge()}</Box>
        <Box className="pl-2 mt-2 md:mt-0">{renderApplicationBadge()}</Box>
      </div>
      {props.support && (
        <Box p={2} className="mt-4 text-sm">
          {(!props.isDirectRound || hasProperStatus) && (
            <p>
              Have any questions about your grant round application?{" "}
              <a
                className="text-purple-500"
                target="_blank"
                href={`${props.support.type === "Email" ? "mailto:" : ""}${
                  props.support.info
                }`}
                rel="noreferrer"
              >
                Contact the {props.round?.roundMetadata.name} support team.
              </a>
            </p>
          )}
          <Link
            to={roundApplicationViewPath(
              applicationData.chainId.toString(),
              applicationData.roundID,
              applicationData.application.metadataCid || ""
            )}
          >
            <Button
              backgroundColor="purple.100"
              color="purple.600"
              className="mt-4 mr-2 mb-2 w-full"
              fontWeight="normal"
            >
              View Application
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
}
