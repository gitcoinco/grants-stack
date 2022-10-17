import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { loadProjects } from "../../actions/projects";
import { loadRound, unloadRounds } from "../../actions/rounds";
import useLocalStorage from "../../hooks/useLocalStorage";
import { RootState } from "../../reducers";
import { Status as ProjectStatus } from "../../reducers/projects";
import { ApplicationModalStatus } from "../../reducers/roundApplication";
import { Status } from "../../reducers/rounds";
import { newGrantPath, roundApplicationPath } from "../../routes";
import { formatDate } from "../../utils/components";
import { networkPrettyName } from "../../utils/wallet";
import Button, { ButtonVariants } from "../base/Button";

function Round() {
  const [roundData, setRoundData] = useState<any>();

  const params = useParams();
  const dispatch = useDispatch();

  const { roundId, chainId } = params;

  const props = useSelector((state: RootState) => {
    const allProjectMetadata = state.grantsMetadata;
    const projectsStatus = state.projects.status;
    const roundState = state.rounds[roundId!];
    const status = roundState ? roundState.status : Status.Undefined;
    const error = roundState ? roundState.error : undefined;
    const round = roundState ? roundState.round : undefined;
    const web3ChainId = state.web3.chainID;
    const roundChainId = Number(chainId);

    return {
      roundState,
      status,
      error,
      round,
      web3ChainId,
      roundChainId,
      projects: allProjectMetadata,
      projectsStatus,
    };
  }, shallowEqual);

  const [, setRoundToApply] = useLocalStorage("roundToApply", null);
  const [roundApplicationModal, setToggleRoundApplicationModal] =
    useLocalStorage(
      "toggleRoundApplicationModal",
      ApplicationModalStatus.Undefined
    );

  useEffect(() => {
    if (roundId) {
      setRoundToApply(`${chainId}:${roundId}`);

      if (roundApplicationModal === ApplicationModalStatus.Undefined) {
        setToggleRoundApplicationModal(ApplicationModalStatus.NotApplied);
      }
    }
  }, [roundId]);

  useEffect(() => {
    if (roundId !== undefined) {
      dispatch(unloadRounds());
      dispatch(loadRound(roundId));
    }
  }, [dispatch, roundId]);

  useEffect(() => {
    if (props.round) {
      setRoundData(props.round);
    }
  }, [props.round]);

  useEffect(() => {
    if (props.projectsStatus === ProjectStatus.Undefined) {
      dispatch(loadProjects(true));
    }
  }, [props.projectsStatus, dispatch]);

  if (props.web3ChainId !== props.roundChainId) {
    return (
      <p>
        This application has been deployed to{" "}
        {networkPrettyName(props.roundChainId)} and you are connected to{" "}
        {networkPrettyName(props.web3ChainId ?? 1)}
      </p>
    );
  }

  if (props.status === Status.Error) {
    return <p>Error: {props.error}</p>;
  }

  if (
    props.status !== Status.Loaded ||
    props.projectsStatus !== ProjectStatus.Loaded
  ) {
    return <p>loading...</p>;
  }

  if (props.roundState === undefined || props.round === undefined) {
    return <p>something went wrong</p>;
  }

  return (
    <div className="h-full w-full absolute flex flex-col justify-center items-center">
      <div className="w-full lg:w-1/3 sm:w-2/3">
        <h2 className="text-center uppercase text-2xl">
          {roundData?.programName}
        </h2>
        <h2 className="text-center">{roundData?.roundMetadata.name}</h2>
        <h4 className="text-center">{roundData?.roundMetadata.description}</h4>
        <div className="p-8 flex flex-col">
          <p className="mt-4 mb-12 w-full text-center">
            Date: {formatDate(roundData?.applicationsStartTime)} -{" "}
            {formatDate(roundData?.applicationsEndTime)}
          </p>
          {Object.keys(props.projects).length !== 0 ? (
            <Link to={roundApplicationPath(chainId!, roundId!)}>
              <Button
                styles={["w-full justify-center"]}
                variant={ButtonVariants.primary}
              >
                Apply to this round
              </Button>
            </Link>
          ) : (
            <Link to={newGrantPath()}>
              <Button
                styles={["w-full justify-center"]}
                variant={ButtonVariants.primary}
              >
                Create Project
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Round;
