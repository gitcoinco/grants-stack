import React, { useEffect } from 'react';
import { RootState } from './reducers';
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';
import './App.css';
import { initializeWeb3 } from "./actions/web3";
import { startIPFS } from "./actions/ipfs";

function App() {
  const dispatch = useDispatch();

  const props = useSelector((state: RootState) => ({
    web3Initializing: state.web3.initializing,
    web3Initialized: state.web3.initialized,
    web3Error: state.web3.error,
    chainID: state.web3.chainID,
    account: state.web3.account,
    ipfsInitializing: state.ipfs.initializing,
    ipfsInitializationError: state.ipfs.initializationError,
    ipfsInitialized: state.ipfs.initialized,
  }), shallowEqual);

  useEffect(() => {
    if (!props.web3Initialized && !props.web3Initializing) {
      dispatch(initializeWeb3());
    }
  }, []);

  useEffect(() => {
    if (!props.ipfsInitializing && !props.ipfsInitialized && props.ipfsInitializationError === undefined) {
      dispatch(startIPFS());
    }
  }, []);

  const connectHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(initializeWeb3());
  }

  return (
    <div>
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

      <div>
        <h3>IPFS</h3>
        {props.ipfsInitializing && <>
          <div>Initializing...</div>
        </>}

        {props.ipfsInitialized && <>
          <div>Initialized</div>
        </>}
      </div>
    </div>
  );
}

export default App;
