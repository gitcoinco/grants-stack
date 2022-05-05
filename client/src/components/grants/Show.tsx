import React, { useEffect } from 'react';
// import { RootState } from '../../reducers';
import { Link, useParams } from "react-router-dom";
import {
  // shallowEqual,
  // useSelector,
  useDispatch,
} from 'react-redux';
import {
  grantsPath
} from "../../routes";

function GrantsList() {
  const dispatch = useDispatch();
  const { id } = useParams();
  // const props = useSelector((state: RootState) => ({
  // }), shallowEqual);

  useEffect(() => {
    // load grant
    console.log("-- loading grant");
    return () => {
      // unload grant
      console.log("-- unloading grant");
    }
  }, [dispatch]);

  return (
    <div>
      <div>
        Grant #{id}
      </div>
      <div>
        <Link to={ grantsPath() }>Back to grants list</Link>
      </div>
    </div>
  );
}

export default GrantsList;
