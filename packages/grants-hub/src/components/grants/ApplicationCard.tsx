import { Badge, Box, Button, Image, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loadRound } from "../../actions/rounds";
import { RootState } from "../../reducers";
import { AppStatus } from "../../reducers/projects";
import { roundApplicationViewPath } from "../../routes";
import { RoundSupport } from "../../types";
import { formatDateFromSecs } from "../../utils/components";
import { getNetworkIcon, networkPrettyName } from "../../utils/wallet";

export default function ApplicationCard({
  applicationData,
}: {
  applicationData: any;
}) {
  const [roundData, setRoundData] = useState<any>();
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => {
    const roundState = state.rounds[applicationData.roundID];
    const round = roundState ? roundState.round : undefined;
    const support: RoundSupport | undefined = round?.roundMetadata?.support;

    const applicationChainName = networkPrettyName(
      Number(applicationData.chainId)
    );
    const applicationChainIconUri = getNetworkIcon(
      Number(applicationData.chainId)
    );

    return {
      round,
      support,
      applicationChainName,
      applicationChainIconUri,
    };
  });

  const renderApplicationDate = () => (
    <>
      {formatDateFromSecs(roundData?.applicationsStartTime)} -{" "}
      {formatDateFromSecs(roundData?.applicationsEndTime)}
    </>
  );

  useEffect(() => {
    if (applicationData.roundID !== undefined) {
      dispatch(loadRound(applicationData.roundID, applicationData.chainId));
    }
  }, [dispatch, applicationData.roundID]);

  useEffect(() => {
    if (props.round) {
      setRoundData(props.round);
    }
  }, [props.round]);

  const renderApplicationBadge = () => {
    let colorScheme:
      | {
          bg: string;
          text: string;
        }
      | undefined;
    switch (applicationData?.application.status as AppStatus) {
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
      default:
        colorScheme = undefined;
        break;
    }

    return (
      <Badge
        backgroundColor={colorScheme?.bg}
        className="max-w-fit"
        borderRadius="full"
        p={2}
        textTransform="inherit"
      >
        {applicationData?.application.status === "REJECTED" ? (
          <span className={`text-${colorScheme?.text} text-sm`}>Rejected</span>
        ) : null}
        {applicationData?.application.status === "PENDING" ? (
          <span className={`text-${colorScheme?.text} text-sm`}>In Review</span>
        ) : null}
        {applicationData?.application.status === "APPROVED" ? (
          <span className={`text-${colorScheme?.text} text-sm`}>Approved</span>
        ) : null}
      </Badge>
    );
  };

  return (
    <Box
      p={2}
      className="border-gray-300 pt-4 pb-7 px-5"
      borderWidth="1px"
      borderRadius="md"
    >
      <Box p={2} mb={1}>
        <span className="text-sm text-gitcoin-gray-400">
          {props.round?.programName}
        </span>
      </Box>
      <div className="flex justify-end w-fit mr-1 align-middle mb-2">
        <Image
          src={props.applicationChainIconUri}
          alt="chain icon"
          className="flex flex-row h-4 w-4 ml-2 mr-1 mt-1 rounded-full"
        />
        <span className="align-middle mb-1">{props.applicationChainName}</span>
      </div>
      <div className="flex flex-1 flex-col md:flex-row justify-between">
        <Box className="pl-2 text-gitcoin-gray-400">
          <div className="mb-1 text-sm">{props.round?.roundMetadata.name}</div>
          {roundData ? <span>{renderApplicationDate()}</span> : <Spinner />}
        </Box>
        <Box className="pl-2 mt-2 md:mt-0">{renderApplicationBadge()}</Box>
      </div>
      {props.support && (
        <Box p={2} className="mt-4 text-sm">
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
              Contact the {props.round?.programName} support team.
            </a>
          </p>
          <Link
            to={roundApplicationViewPath(
              applicationData.chainId,
              applicationData.roundID,
              applicationData.application.metaPtr.pointer
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
