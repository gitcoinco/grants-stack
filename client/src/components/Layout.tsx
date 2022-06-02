import React from "react";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../reducers";
import Landing from "./grants/Landing";
import Header from "./Header";

interface Props {
  children: JSX.Element;
}

function Layout(ownProps: Props) {
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

  const { children } = ownProps;

  return (
    <div className="flex flex-col h-full relative">
      {!props.web3Initialized ? (
        <Landing />
      ) : (
        <>
          <Header />
          <main className="container mx-auto dark:bg-primary-background h-full">
            {!props.web3Error &&
              props.web3Initialized &&
              props.chainID &&
              children}
            {props.web3Error && <p>{props.web3Error}</p>}
          </main>
        </>
      )}
    </div>
  );
}

export default Layout;
