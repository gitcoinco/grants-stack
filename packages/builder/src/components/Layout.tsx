import { useChainModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { useAccount } from "wagmi";
import Footer from "common/src/components/Footer";
import { WEB3_BAD_CHAIN_ERROR } from "../actions/web3";
import { RootState } from "../reducers";
import colors from "../styles/colors";
import { AlertContainer } from "./base/Alert";
import Toast from "./base/Toast";
import Landing from "./grants/Landing";
import Header from "./Header";
import Globe from "./icons/Globe";

interface Props {
  children: JSX.Element;
}

function Layout(ownProps: Props) {
  const [show, showToast] = useState(false);
  const { address: account } = useAccount();
  const { openChainModal } = useChainModal();
  const props = useSelector(
    (state: RootState) => ({
      web3Initializing: state.web3.initializing,
      web3Initialized: state.web3.initialized,
      web3Error: state.web3.error,
      chainID: state.web3.chainID,
      alerts: state.ui.alerts,
    }),
    shallowEqual
  );

  useEffect(() => {
    showToast(props.web3Initialized);
  }, [props.web3Initialized]);

  // check the network and show a modal
  useEffect(() => {
    function checkNetwork() {
      if (props.web3Error === WEB3_BAD_CHAIN_ERROR) {
        console.log("Wrong chain");
        if (openChainModal) openChainModal();
      }
    }

    checkNetwork();
  }, [props.web3Error]);

  const { children } = ownProps;
  if (!props.web3Initialized || account === undefined) {
    return <Landing />;
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="container mx-auto dark:bg-primary-background grow relative">
        {props.web3Error === undefined && children}
        {props.web3Error && <p>{props.web3Error}</p>}
      </main>
      <Toast fadeOut show={show} onClose={() => showToast(false)}>
        <>
          <div className="w-6 mt-1 mr-2">
            <Globe color={colors["quaternary-text"]} />
          </div>
          <div>
            <p className="font-semibold text-quaternary-text">
              Wallet Connected!
            </p>
            <p className="text-quaternary-text">Welcome to your Builder.</p>
          </div>
        </>
      </Toast>
      <AlertContainer alerts={props.alerts} />
      <div className="mr-20 mb-6">
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
