import React, { useEffect, useState } from "react";
import { shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../reducers";
import { initializeWeb3 } from "../../actions/web3";
import { startIPFS, saveFileToIPFS, fetchFileFromIPFS } from "../../actions/ipfs"


import './Dashboard.css';
import { useAppDispatch, useAppSelector } from "../../app/hooks";

function Dashboard() {

  const [ipfsData, setIpfsData] = useState<string>("")

  const dispatch = useAppDispatch();

  const props = useAppSelector(
    (state: RootState) => ({
      web3Initializing: state.web3.initializing,
      web3Initialized: state.web3.initialized,
      web3Error: state.web3.error,
      chainID: state.web3.chainID,
      account: state.web3.account,
      ipfsInitializing: state.ipfs.initializing,
      ipfsInitialized: state.ipfs.initialized,
      ipfsError: state.ipfs.initializationError,
      ipfsSavingFile: state.ipfs.ipfsSavingFile,
      ipfsFetchingFile: state.ipfs.ipfsFetchingFile,
      lastFileSavedURL: state.ipfs.lastFileSavedURL,
      lastFileFetched: state.ipfs.lastFileFetched
    }),
    shallowEqual
  );

  useEffect(() => {
    dispatch(initializeWeb3());
    dispatch(startIPFS())
  }, [dispatch]);

  const connectHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(initializeWeb3());
  };

  const saveToIPFSHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(e);
    dispatch(saveFileToIPFS(ipfsData));
  }

  const fetchFromIPFSHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(e);
    dispatch(fetchFileFromIPFS(ipfsData));
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Round Manager</h1>

        <div>
          <p>Web3 Flow</p>

          {props.web3Error !== undefined && (
            <div>
              <div>{props.web3Error}</div>
            </div>
          )}

          {!props.web3Error && props.web3Initialized && (
            <div>
              Welcome {props.account} (chainID: {props.chainID})
            </div>
          )}

          {!props.web3Initialized && (
            <div>
              <button type="button" onClick={connectHandler}>
                CONNECT
              </button>
            </div>
          )}

          <p>
            <label htmlFor="ipfs">IPFS Demo</label>
          </p>
          <textarea
            onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIpfsData(e.target.value)}
            name="ipfs" rows={5} cols={50}
            placeholder="Paste data/CID to save/fetch data in IPFS here"></textarea><br />
          <button type="button" disabled={props.ipfsSavingFile} onClick={saveToIPFSHandler}>Save to IPFS</button>&nbsp;
          <button type="button" disabled={props.ipfsFetchingFile} onClick={fetchFromIPFSHandler}>Fetch from IPFS</button>
          <br />
          <p>
            <span>IPFS url: {props.lastFileSavedURL}</span><br />
            <span>IPFS data: {props.lastFileFetched}</span>
          </p>

        </div>
        <span>
          <Link to="/round/new">New Round</Link> <br />
          <Link to="/round/XYZ">Round XYZ</Link> <br />
        </span>
      </header>
    </div>
  );
}

export default Dashboard;