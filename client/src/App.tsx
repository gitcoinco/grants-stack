import React, { useEffect } from 'react';
import { RootState } from './reducers';
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';
import './App.css';
import { initializeWeb3 } from "./actions/web3";

function App() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Initialized: state.web3.initialized,
    web3Error: state.web3.error,
    chainID: state.web3.chainID,
    account: state.web3.account,
  }), shallowEqual);

  useEffect(() => {
    if (!props.web3Initialized) {
      dispatch(initializeWeb3());
    }
  }, [props.web3Initialized, props.account, props.web3Error]);

  const connectHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(initializeWeb3());
  }

  return (
    <div className="App">
      <header className="App-header">
        {props.web3Error !== undefined && <div>
          <div className="alert alert-danger col-12 col-lg-8 offset-lg-2" role="alert">
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
      </header>


      <div>
        <p>
          Hello World
        </p>
      </div>
    </div>
  );
}

export default App;
