import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { roundApplicationPath } from "../../routes";
import { loadRound, unloadRounds } from "../../actions/rounds";

function Round() {
  const params = useParams();
  const dispatch = useDispatch();

  const props = useSelector(
    (state: RootState) => ({
      id: params.id,
      account: state.web3.account,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (props.id !== undefined) {
      dispatch(unloadRounds());
      dispatch(loadRound(props.id));
    }
  }, [dispatch, props.id]);

  return (
    <div>
      <h4>Round #{props.id}</h4>
      <p>...</p>
      <Link to={roundApplicationPath(params.id!)}>Apply to this round</Link>
    </div>
  );
}

export default Round;
