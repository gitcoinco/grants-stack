import React, { useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { RootState } from "../reducers";
import Header from "./Header";
import { initializeWeb3 } from "../actions/web3";

interface Props {
  children: JSX.Element;
}

function Layout(ownProps: Props) {
  const dispatch = useDispatch();

  const props = useSelector(
    (state: RootState) => ({
      web3Initializing: state.web3.initializing,
      web3Initialized: state.web3.initialized,
      web3Error: state.web3.error,
      chainID: state.web3.chainID,
      account: state.web3.account,
      ipfsInitializing: state.ipfs.initializing,
      ipfsInitializationError: state.ipfs.initializationError,
      ipfsInitialized: state.ipfs.initialized,
      ipfsLastFileSavedURL: state.ipfs.lastFileSavedURL,
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
  const { children } = ownProps;

  return (
    <div className="flex flex-col h-full relative">
      <Header />
      <main className="container mx-auto bg-light-primary dark:bg-dark-primary h-full">
        {!props.web3Error && props.web3Initialized && props.chainID && children}

        {props.web3Error !== undefined && (
          <div>
            <div>{props.web3Error}</div>
          </div>
        )}

        {!props.web3Initialized && (
          <button type="button" onClick={connectHandler}>
            CONNECT
          </button>
        )}
      </main>
    </div>
  );
}

export default Layout;
