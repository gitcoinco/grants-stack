import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient } from "wagmi";
import { RootState } from "../../reducers";
import { LandingBackground, GitcoinLogoText } from "../../assets";
import { initializeWeb3 } from "../../actions/web3";
import { getEthersSigner } from "../../utils/wagmi";
import Header from "../Header";

function Landing() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Error: state.web3.error,
    web3Initializing: state.web3.initializing,
  }));

  const { chain, address, isConnected, connector } = useAccount();

  const provider = usePublicClient();
  // dispatch initializeWeb3 when address changes
  useEffect(() => {
    const init = async () => {
      if (connector?.getAccounts && provider && chain && address) {
        const signer = await getEthersSigner(connector, chain.id);
        dispatch(initializeWeb3(signer, provider, chain, address));
      }
    };
    init();
  }, [address, connector, chain, provider]);

  return (
    <div className="flex flex-col absolute h-full w-full">
      <Header showHelpButton={false} showNewProjectButton={false} />
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
