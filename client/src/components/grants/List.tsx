import React, { useEffect } from 'react';
// import { RootState } from '../../reducers';
import { Link } from "react-router-dom";
import {
  // shallowEqual,
  // useSelector,
  useDispatch,
} from 'react-redux';

function GrantsList() {
  const dispatch = useDispatch();
  // const props = useSelector((state: RootState) => ({
  // }), shallowEqual);

  useEffect(() => {
    // load grants
    console.log("-- loading grants");
    return () => {
      // unload grants
      console.log("-- unloading grants");
    }
  }, [dispatch]);

  return (
    <div>
      <ul>
        <li><Link to="/grants/1">Test Grant 1</Link></li>
        <li><Link to="/grants/2">Test Grant 2</Link></li>
        <li><Link to="/grants/2">Test Grant 3</Link></li>
      </ul>

      <Link to="/">Home</Link>
    </div>
  );
}

export default GrantsList;
