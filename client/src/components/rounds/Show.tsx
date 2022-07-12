import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { roundApplicationPath } from "../../routes";
import { loadRound, unloadRounds } from "../../actions/rounds";
import { Status } from "../../reducers/rounds";

function Round() {
  const params = useParams();
  const dispatch = useDispatch();

  const props = useSelector((state: RootState) => {
    const { id } = params;
    const roundState = state.rounds[id!];
    const status = roundState ? roundState.status : Status.Empty;
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
    <div>
      <h4>Round #{props.id} Application</h4>
      <p>Raw Round</p>
      <pre>{JSON.stringify(props.round, null, 2)}</pre>
      <Link to={roundApplicationPath(params.id!)}>Apply to this round</Link>
    </div>
  );
}

export default Round;
