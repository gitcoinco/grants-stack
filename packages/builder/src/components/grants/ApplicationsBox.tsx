import { Box, SkeletonText } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadRounds } from "../../actions/rounds";
import { RootState } from "../../reducers";
import { Application } from "../../reducers/projects";
import { Status } from "../../reducers/rounds";
import ApplicationCard from "./ApplicationCard";

export default function ApplicationsBox({
  applications,
}: {
  applications: Application[];
}) {
  const props = useSelector((state: RootState) => {
    const rounds: { [key: string]: any } = {};

    const isLoading = applications.some((application) => {
      const roundState = state.rounds[application.roundID];
      return roundState?.status !== Status.Loaded;
    });

    for (const application of applications) {
      const roundState = state.rounds[application.roundID];
      if (roundState?.round) {
        rounds[application.roundID] = roundState.round;
      }
    }

    return {
      rounds,
      isLoading,
    };
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const roundToChain = new Map<string, number>();
    applications.forEach((application) => {
      roundToChain.set(application.roundID, application.chainId);
    });
    dispatch(loadRounds(roundToChain));
  }, []);

  const applicationsToDisplay = useMemo(() => {
    if (props.isLoading) {
      return [];
    }
    return applications.filter(
      (application) =>
        props.rounds[application.roundID]?.roundEndTime! > Date.now() / 1000
    );
  }, [applications, props.rounds, props.isLoading]);

  return (
    <>
      <Box p={1}>
        <span className="text-[20px]">Current Applications</span>
      </Box>
      <SkeletonText
        isLoaded={!props.isLoading}
        noOfLines={4}
        spacing="2"
        skeletonHeight="6"
      >
        <Box>
          {!props.isLoading &&
            applicationsToDisplay.map((application, index) => {
              const roundID = application?.roundID;
              const cardData = {
                application,
                roundID,
                chainId: application?.chainId,
              };
              return (
                <Box key={[roundID, index].join("-")} m={2}>
                  <ApplicationCard applicationData={cardData} />
                </Box>
              );
            })}
          {!props.isLoading && applicationsToDisplay.length === 0 && (
            <Box
              pt={10}
              pb={10}
              pl={5}
              m={2}
              borderWidth="1px"
              borderRadius="md"
            >
              <span className="text-[14px]">
                This grant has no ongoing round applications.
              </span>
            </Box>
          )}
        </Box>
      </SkeletonText>
    </>
  );
}
