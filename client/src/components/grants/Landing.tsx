import { useSelector, useDispatch } from "react-redux";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useProvider, useSigner, useNetwork } from "wagmi";
import { useEffect } from "react";
import { BroadcastChannel } from "broadcast-channel";
import { RootState } from "../../reducers";
import { initializeWeb3 } from "../../actions/web3";
import Footer from "../Footer";

function Landing() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Error: state.web3.error,
    web3Initializing: state.web3.initializing,
  }));
  const queryString = new URLSearchParams(window?.location?.search);

  // Twitter oauth will attach code & state in oauth procedure
  const queryError = queryString.get("error");
  const queryCode = queryString.get("code");
  const queryState = queryString.get("state");

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

  // if Twitter oauth then submit message to other windows and close self
  if (
    (queryError || queryCode) &&
    queryState &&
    /^twitter-.*/.test(queryState)
  ) {
    // shared message channel between windows (on the same domain)
    const channel = new BroadcastChannel("twitter_oauth_channel");
    // only continue with the process if a code is returned
    if (queryCode) {
      channel.postMessage({
        target: "twitter",
        data: { code: queryCode, state: queryState },
      });
    }
    // always close the redirected window
    window.close();

    return <div />;
  }

  // if Github oauth then submit message to other windows and close self
  if (
    (queryError || queryCode) &&
    queryState &&
    /^github-.*/.test(queryState)
  ) {
    // shared message channel between windows (on the same domain)
    const channel = new BroadcastChannel("github_oauth_channel");
    // only continue with the process if a code is returned
    if (queryCode) {
      channel.postMessage({
        target: "github",
        data: { code: queryCode, state: queryState },
      });
    }

    // always close the redirected window
    window.close();

    return <div />;
  }

  if (
    props.web3Initializing &&
    (signer || chain || address) &&
    !props.web3Error
  ) {
    return null;
  }

  return (
    <div className="flex flex-col absolute h-full w-full">
      <div className="flex absolute top-0 left-8 md:left-10">
        <img
          className="py-4 mr-4"
          alt="Gitcoin Logo"
          src="./assets/gitcoin-logo.svg"
        />
        <span className="border border-gitcoin-separator my-[1.35rem] mr-4" />
        <img
          className="py-4 mr-4"
          alt="Grants Hub Logo"
          src="./assets/grants-hub-logo.svg"
        />
        <img
          alt="Grants Hub Logo Text"
          src="./assets/grants-hub-logo-text.svg"
        />
      </div>
      <section className="flex flex-1 flex-col md:flex-row">
        <div className="flex flex-1 flex-col justify-center container px-8 md:px-10">
          <h3 className="mb-4 pt-24 md:pt-0 md:mb-4">
            <img src="/assets/gitcoinWordLogo.svg" alt="Gitcoin logo" />
          </h3>
          <h1 className="w-auto text-5xl md:text-7xl mb-8 -ml-1">Grants Hub</h1>
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
        <div className="flex flex-1">
          <img
            className="w-full object-cover"
            src="./assets/landing-background.svg"
            alt="Jungle Background"
          />
        </div>
      </section>
      <div className="w-full mb-2">
        <Footer />
      </div>
    </div>
  );
}

export default Landing;
