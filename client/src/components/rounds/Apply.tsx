import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { roundPath } from "../../routes";
import { Status } from "../../reducers/rounds";

function Apply() {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    if (props.id !== undefined && props.round === undefined) {
      navigate(roundPath(props.id));
    }
  }, [dispatch, props.id, props.round]);

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
      <div>
        MetaPtr: {props.round.metaPtr?.protocol} {props.round.metaPtr?.pointer}
      </div>
      <p>Raw Metadata</p>
      <pre>{props.round.metadata}</pre>
      <p>Submit application</p>
    </div>
  );
}

export default Apply;
