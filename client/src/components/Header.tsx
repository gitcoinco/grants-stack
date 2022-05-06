import React from 'react'
import { Link } from 'react-router-dom'
import { RootState } from '../reducers';
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';
import { initializeWeb3 } from "../actions/web3";
import {
  grantsPath,
  newGrantPath
} from "../routes";

export function Header() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Initialized: state.web3.initialized,
    web3Error: state.web3.error,
    chainID: state.web3.chainID,
    account: state.web3.account,
  }), shallowEqual);

  const connectHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(initializeWeb3());
  }
  return (
    <header>
      <div>
        <h3>WEB3</h3>
        {props.web3Error !== undefined && <div>
          <div>
            {props.web3Error}
          </div>
        </div>}

        {!props.web3Error && <>
          {props.web3Initialized && <div>
            Welcome {props.account} (chainID: {props.chainID})
          </div>}
        </>}

        {!props.web3Initialized && <div>
          <button onClick={connectHandler}>CONNECT</button>
        </div>}
      </div>
      <ul>
        <li><Link to={ grantsPath() }>Grants</Link></li>
        <li><Link to={ newGrantPath() }>Create a Grant</Link></li>
      </ul>
    </header>
  )
}
