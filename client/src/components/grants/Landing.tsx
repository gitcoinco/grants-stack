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
      <h3 className="mb-4">
        The one place to manage your project across multiple grants programs.
      </h3>
      <p>
        Grant owners can create and manage grants across multiple rounds. Grants
        rounds are tied to a deep, flexible registry to easily find and
        distribute capital across the most impactful projects.
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
