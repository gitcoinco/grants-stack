import React, { useEffect } from 'react';
// import { RootState } from '../../reducers';
import { Link } from "react-router-dom";
import { RootState } from "../../reducers";
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';
import {
  grantPath,
} from "../../routes";
import { loadGrants, unloadGrants } from "../../actions/grants";
import { GrantsListItem } from "../../reducers/grants";

function GrantsList() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    loading: state.grants.loading,
    grants: state.grants.grants
  }), shallowEqual);

  useEffect(() => {
    dispatch(loadGrants());
    return () => {
      dispatch(unloadGrants());
    }
  }, [dispatch]);

  return (
    <div>
      {props.loading && <>
      loading...
      </>}

      {!props.loading && <ul>
        {props.grants.map((item: GrantsListItem, i: number) => (
          <li key={item.uri}>
            <Link to={ grantPath(1) }>{item.uri}</Link>
          </li>
        ))}
      </ul>}
    </div>
  );
}

export default GrantsList;
