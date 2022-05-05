import React, { useEffect, useRef } from 'react';
import { RootState } from '../../reducers';
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';

function GrantsList() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
  }), shallowEqual);

  useEffect(() => {
    // load grants
    return () => {
      // unload grants
    }
  }, [dispatch]);

  return (
    <div>
      Grants list
    </div>
  );
}

export default GrantsList;
