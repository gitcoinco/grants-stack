import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button, { ButtonVariants } from "../base/Button";
import { RootState } from "../../reducers";
import { initializeWeb3 } from "../../actions/web3";
import { slugs } from "../../routes";

function Landing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Initialized: state.web3.initialized,
    web3Error: state.web3.error,
    account: state.web3.account,
  }));

  const connectHandler = () => {
    dispatch(initializeWeb3());
  };

  useEffect(() => {
    if (props.account) {
      navigate(slugs.grants, { replace: true });
    }
  }, [props.account]);

  return (
    <div className="flex h-full">
      <div className="flex absolute top-0 left-10">
        <img
          className="py-4 mr-4"
          alt="Gitcoin Logo"
          src="./assets/gitcoin-logo.svg"
        />
        <img alt="Gitcoin Logo Text" src="./assets/gitcoin-logo-text.svg" />
      </div>
      <div className="w-1/2 flex flex-col h-full justify-center container ml-10">
        <h1 className="mb-8">Project Hub</h1>
        <p>
          Manage projects that generate maximum impact and receive funds
          matching from Gitcoin, partner DAO, or independent grant program
          rounds.
        </p>
        {!props.web3Initialized && (
          <div className="mt-8">
            <Button
              onClick={() => connectHandler()}
              variant={ButtonVariants.primary}
            >
              Connect Wallet
            </Button>
            {props.web3Error !== undefined && (
              <div>
                <div>{props.web3Error}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <img
        className="w-1/2"
        src="./assets/landing-background-img.svg"
        alt="Jungle Background"
      />
    </div>
  );
}

export default Landing;
