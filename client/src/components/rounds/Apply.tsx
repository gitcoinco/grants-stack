import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";

function Apply() {
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

  return (
    <div>
      <h4>Round #{props.id} Application</h4>
      <p>Submit application</p>
    </div>
  );
}

export default Apply;
