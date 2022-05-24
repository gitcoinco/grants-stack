import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../reducers";
import { initializeWeb3 } from "../../actions/web3";


import './Dashboard.css';
import { useAppDispatch, useAppSelector } from "../../app/hooks";

function Dashboard() {

  const dispatch = useAppDispatch();

  const props = useAppSelector(
    (state: RootState) => ({
      web3Initializing: state.web3.initializing,
      web3Initialized: state.web3.initialized,
      web3Error: state.web3.error,
      chainID: state.web3.chainID,
      account: state.web3.account
    }),
    shallowEqual
  );

  useEffect(() => {
    dispatch(initializeWeb3());
  }, [dispatch]);

  const connectHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(initializeWeb3());
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-5xl font-bold">Round Manager</h1>

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

        </div>
        <span>
          <Link to="/round/new">New Round</Link> <br/>
          <Link to="/round/XYZ">Round XYZ</Link> <br/>
        </span>
      </header>
    </div>
  );
}

export default Dashboard;