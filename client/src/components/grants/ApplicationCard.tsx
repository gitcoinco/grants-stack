import { Badge, Box, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadRound, unloadRounds } from "../../actions/rounds";
import { RootState } from "../../reducers";
import { RoundSupport } from "../../types";
import { formatDate } from "../../utils/components";

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

    return {
      round,
      support,
    };
  });

  // todo: what date do we want to show here?
  // todo: show round date or application date or both? @michellema1208
  // const renderRoundDate = () => (
  //   <>
  //     {formatDate(roundData?.roundStartTime)} -{" "}
  //     {formatDate(roundData?.roundEndTime)}
  //   </>
  // );

  const renderApplicationDate = () => (
    <>
      {formatDate(roundData?.applicationsStartTime)} -{" "}
      {formatDate(roundData?.applicationsEndTime)}
    </>
  );

  useEffect(() => {
    if (applicationData.roundID !== undefined) {
      dispatch(unloadRounds());
      dispatch(loadRound(applicationData.roundID));
    }
  }, [dispatch, applicationData.roundID]);

  useEffect(() => {
    if (props.round) {
      setRoundData(props.round);
    }
  }, [props.round]);

  return (
    <Box p={2} className="border-gray-300" borderWidth="1px" borderRadius="md">
      <Box p={2} mb={4}>
        <span className="text-[16px] text-gitcoin-gray-400">
          {props.round?.programName}
        </span>
      </Box>
      <div className="flex flex-1 flex-col md:flex-row justify-between">
        <Box className="pl-2 text-gitcoin-gray-400">
          <div>{props.round?.roundMetadata.name}</div>
          {roundData ? <span>{renderApplicationDate()}</span> : <Spinner />}
        </Box>
        <Box className="pl-2 mt-2 md:mt-0 text-gitcoin-gray-400">
          <Badge className="bg-gitcoin-gray-100" borderRadius="full" p={2}>
            {applicationData.application.status}
          </Badge>
        </Box>
      </div>
      {props.support && (
        <Box p={2} className="mt-4 mb-6">
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
        </Box>
      )}
    </Box>
  );
}
