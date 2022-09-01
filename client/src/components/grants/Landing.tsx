import { useSelector, useDispatch } from "react-redux";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useProvider, useSigner, useNetwork } from "wagmi";
import { useEffect } from "react";
import { RootState } from "../../reducers";
import { initializeWeb3 } from "../../actions/web3";

function Landing() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Error: state.web3.error,
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
    if (signer && provider && chain && address) {
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

  return (
    <div className="md:flex h-full">
      <div className="flex absolute top-0 left-10">
        <img
          className="py-4 mr-4"
          alt="Gitcoin Logo"
          src="./assets/gitcoin-logo.svg"
        />
        <img alt="Gitcoin Logo Text" src="./assets/gitcoin-logo-text.svg" />
      </div>
      <div className="w-full md:w-1/2 flex flex-col absolute h-1/2 max-w-fit md:h-full justify-center container mx-10">
        <h3 className="mb-8 hidden md:inline-block">Grant Hub</h3>
        <h6 className="mb-4 pt-20 inline-block md:hidden">Grant Hub</h6>
        <h1 className="md:inline-block hidden">Bring your project to life</h1>
        <h4 className="md:hidden inline-block">Bring your project to life</h4>
        <p className="text-black text-xl">
          Build and fund your projects all in one place -- from creating a
          project to applying for grants to creating impact with your project
          starting today!
        </p>
        {!isConnected && (
          <div className="mt-8">
            <ConnectButton />
            {props.web3Error !== undefined && (
              <div>
                <div>{props.web3Error}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <img
        className="absolute w-1/2 md:inline-block inset-y-56 right-0"
        src="./assets/landing-background.svg"
        alt="Jungle Background"
      />
    </div>
  );
}

export default Landing;
