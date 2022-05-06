import React, { useEffect, useRef } from 'react';
import { RootState } from './reducers';
import { Link } from "react-router-dom";
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';
import './App.css';
import { initializeWeb3 } from "./actions/web3";
import { startIPFS, saveFileToIPFS } from "./actions/ipfs";
import {
  grantsPath
} from "./routes";

function App() {
  const dispatch = useDispatch();
  const textArea = useRef<HTMLTextAreaElement>(null);

  const props = useSelector((state: RootState) => ({
    web3Initializing: state.web3.initializing,
    web3Initialized: state.web3.initialized,
    web3Error: state.web3.error,
    chainID: state.web3.chainID,
    account: state.web3.account,
    ipfsInitializing: state.ipfs.initializing,
    ipfsInitializationError: state.ipfs.initializationError,
    ipfsInitialized: state.ipfs.initialized,
    ipfsLastFileSavedURL: state.ipfs.lastFileSavedURL,
  }), shallowEqual);

  useEffect(() => {
    dispatch(initializeWeb3());
  }, [dispatch]);

  useEffect(() => {
    dispatch(startIPFS());
  }, [dispatch]);

  const connectHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(initializeWeb3());
  }

  const saveHandler = () => {
    if (textArea.current !== null) {
      dispatch(saveFileToIPFS("test.txt", textArea.current.value));
    }
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

      {props.ipfsInitialized && <div>
        <h3>Test IPFS</h3>
        <div>
          <textarea cols={40} rows={5} ref={textArea}>
          </textarea>
        </div>
        <div>
          <button onClick={saveHandler}>
            Save
          </button>
        </div>
        {props.ipfsLastFileSavedURL && <div>
          Last file save at <a target="_blank" rel="noreferrer" href={props.ipfsLastFileSavedURL}>{props.ipfsLastFileSavedURL}</a>
        </div>}
      </div>}

      <ul>
        <li><Link to="/test">Test Link</Link></li>
        <li><Link to="/grants">Grants</Link></li>
        <li><Link to="/create">Create a Grant</Link></li>
      </ul>
    </div>
  );
}

export default App;
