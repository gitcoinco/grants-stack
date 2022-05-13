import React, { useEffect } from "react";
// import { RootState } from '../../reducers';
import { Link } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reducers";
import { grantPath } from "../../routes";
import { loadGrants, unloadGrants } from "../../actions/grants";

function GrantsList() {
  const dispatch = useDispatch();
  const props = useSelector(
    (state: RootState) => ({
      loading: state.grants.loading,
      grants: state.grants.grants,
      chainID: state.web3.chainID,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (props.chainID) {
      dispatch(loadGrants());
    }
    return () => {
      dispatch(unloadGrants());
    };
  }, [dispatch, props.chainID]);

  return (
    <div>
      {props.loading && <>loading...</>}

      {!props.loading && (
        <ul>
          {props.grants.map((item: number) => (
            <li key={item}>
              <Link to={grantPath(item)}>Grant #{item}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GrantsList;
