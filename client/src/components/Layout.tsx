import React, { useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
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

  const toast = useToast();

  useEffect(() => {
    if (props.web3Initialized) {
      toast({
        title: "Wallet connected",
        status: "success",
        isClosable: true,
      });
    }
  }, [props.web3Initialized]);

  const { children } = ownProps;
  if (!props.web3Initialized) {
    return <Landing />;
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="container mx-auto dark:bg-primary-background grow">
        {!props.web3Error && props.web3Initialized && props.chainID && children}
        {props.web3Error && <p>{props.web3Error}</p>}
      </main>
      <div className="h-1/8">
        <div className="w-full flex justify-center py-4">
          <img
            alt="Built by the Gitcoin Community"
            src="./assets/footer-img.svg"
          />
        </div>
      </div>
    </div>
  );
}

export default Layout;
