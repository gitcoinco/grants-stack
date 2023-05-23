import { useSelector, useDispatch } from "react-redux";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useProvider, useSigner, useNetwork } from "wagmi";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { RootState } from "../../reducers";
import { initializeWeb3 } from "../../actions/web3";
import {
  LandingBackground,
  BuilderLogo,
  GitcoinLogo,
  GitcoinLogoText,
} from "../../assets";
import { grantsPath } from "../../routes";

function LandingHeader() {
  return (
    <header
      className="flex items-center justify-between px-4 sm:px-2 z-10 text-primary-text w-full border-0 sm:border-b mx-auto h-1/8"
      style={{
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="w-full mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between pl-4 ml-20">
          <Link to={grantsPath()}>
            <div className="flex">
              <img className="py-4 mr-4" alt="Gitcoin Logo" src={GitcoinLogo} />
              <span className="border border-gitcoin-separator my-[1.35rem] mr-4" />
              <img className="py-4" alt="Builder Logo" src={BuilderLogo} />
            </div>
          </Link>
          <div className="flex items-center mr-20">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Error: state.web3.error,
    web3Initializing: state.web3.initializing,
  }));
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();
  const { data: signer } = useSigner();

  // dispatch initializeWeb3 when address changes
  useEffect(() => {
    // FIXME: getAddress is checked to be sure the signer object is not the one deserialized from the queries cache.
    // it can be removed when wagmi-dev/wagmi/pull/904 has been merged
    if (signer && "getAddress" in signer && provider && chain && address) {
      dispatch(initializeWeb3(signer, provider, chain, address));
    }
  }, [signer, provider, chain, address]);

  if (
    props.web3Initializing &&
    (signer || chain || address) &&
    !props.web3Error
  ) {
    return null;
  }

  return (
    <div className="flex flex-col absolute h-full w-full">
      <LandingHeader />
      <section className="flex flex-col md:flex-row">
        <div className="flex flex-1 flex-col justify-center container px-8 md:px-10 md:pl-4 ml-20">
          <div>
            <img
              className="inline-block ml-2"
              src={GitcoinLogoText}
              alt="Gitcoin Logo"
            />
          </div>
          <h1 className="w-auto text-5xl md:text-7xl mb-8 mt-4">Builder</h1>
          <p className="text-black text-xl w-full md:max-w-4xl">
            Build and fund your project all in one place, and bring your vision
            to life.
          </p>
          {!isConnected && (
            <div className="mt-8 mb-8 md:mb-0">
              <ConnectButton />
              {props.web3Error !== undefined && (
                <div>
                  <div>{props.web3Error}</div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <img
            className="w-full object-cover"
            src={LandingBackground}
            alt="Jungle Background"
          />
        </div>
      </section>
    </div>
  );
}

export default Landing;
