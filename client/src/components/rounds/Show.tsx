import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { roundApplicationPath } from "../../routes";
import { loadRound, unloadRounds } from "../../actions/rounds";
import { Status } from "../../reducers/rounds";
import { formatDate } from "../../utils/components";
import Button, { ButtonVariants } from "../base/Button";

function Round() {
  const [roundData, setRoundData] = useState<any>();

  const params = useParams();
  const dispatch = useDispatch();

  const props = useSelector((state: RootState) => {
    const { id } = params;
    const roundState = state.rounds[id!];
    const status = roundState ? roundState.status : Status.Undefined;
    const error = roundState ? roundState.error : undefined;
    const round = roundState ? roundState.round : undefined;
    return {
      id,
      roundState,
      status,
      error,
      round,
    };
  }, shallowEqual);

  useEffect(() => {
    if (props.id !== undefined) {
      dispatch(unloadRounds());
      dispatch(loadRound(props.id));
    }
  }, [dispatch, props.id]);

  useEffect(() => {
    if (props.round) {
      setRoundData(props.round);
    }
  }, [props.round]);

  if (props.status === Status.Error) {
    return <div>Error: {props.error}</div>;
  }

  if (props.status !== Status.Loaded) {
    return <div>loading...</div>;
  }

  if (props.roundState === undefined || props.round === undefined) {
    return <div>something went wrong</div>;
  }

  return (
    <div className="h-full w-full absolute flex flex-col justify-center items-center">
      <div className="w-full lg:w-1/3 sm:w-2/3">
        <h2 className="text-center">{roundData?.roundMetadata.name}</h2>
        <h4 className="text-center">{roundData?.roundMetadata.description}</h4>
        <div className="p-8 flex flex-col">
          <p className="mt-4 mb-12 w-full text-center">
            Date: {formatDate(roundData?.applicationsStartTime)} -{" "}
            {formatDate(roundData?.applicationsEndTime)}
          </p>
          <Link to={roundApplicationPath(props.id!)}>
            <Button
              styles={["w-full justify-center"]}
              variant={ButtonVariants.primary}
            >
              Apply to this round
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Round;
