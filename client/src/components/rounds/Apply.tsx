import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { roundPath } from "../../routes";

function Apply() {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const props = useSelector((state: RootState) => {
    const { id } = params;
    return {
      id,
      round: state.rounds[id!],
      account: state.web3.account,
    };
  }, shallowEqual);

  useEffect(() => {
    if (props.id !== undefined && props.round === undefined) {
      navigate(roundPath(props.id));
    }
  }, [dispatch, props.id, props.round]);

  return (
    <div>
      <h4>Round #{props.id} Application</h4>
      <p>Submit application</p>
    </div>
  );
}

export default Apply;
