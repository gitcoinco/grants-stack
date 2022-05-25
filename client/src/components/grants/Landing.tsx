import { useSelector, useDispatch } from "react-redux";
import Button, { ButtonVariants } from "../base/Button";
import { RootState } from "../../reducers";
import { initializeWeb3 } from "../../actions/web3";

function Landing() {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => ({
    web3Initialized: state.web3.initialized,
    web3Error: state.web3.error,
  }));

  const connectHandler = () => {
    dispatch(initializeWeb3());
  };

  return (
    <div className="container mx-auto flex flex-col h-full justify-center">
      <h1 className="mb-8">Grant Hub</h1>
      <p>
        Manage projects that generate maximum impact and receive funds matching
        from Gitcoin, partner DAO, or independent grant program rounds.
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
  );
}

export default Landing;
