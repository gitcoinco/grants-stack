import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";

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
      // load round
    }

    return () => {
      if (props.id !== undefined) {
        // unload round
      }
    };
  }, [dispatch, props.id]);

  return <div>Round #{props.id}</div>;
}

export default Round;
