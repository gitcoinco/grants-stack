import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { roundPath } from "../../routes";
import { Status } from "../../reducers/rounds";
import Form from "../application/Form";

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
      applicationMetadata: round?.applicationMetadata,
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
      {!props.applicationMetadata === undefined && <div>loading form...</div>}
      {props.applicationMetadata !== undefined && (
        <Form roundApplication={props.applicationMetadata} />
      )}
    </div>
  );
}

export default Apply;
