import { useSelector } from "react-redux";
import Button from "../base/Button";
import { RootState } from "../../reducers";

function Landing() {
  const props = useSelector((state: RootState) => ({
    web3Initialized: state.web3.initialized,
  }));

  return (
    <div className="container mx-auto flex flex-col h-full justify-center">
      <h1 className="mb-8">Grant Hub</h1>
      <p>
        Manage projects that generate maximum impact and receive funds matching
        from Gitcoin, partner DAO, or independent grant program rounds.
      </p>
      {!props.web3Initialized && (
        <div className="mt-8">
          <Button onClick={() => console.log("click")} variant="outline">
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}

export default Landing;
