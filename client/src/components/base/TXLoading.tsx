import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { grantsPath } from "../../routes";
import { resetFileStatus } from "../../actions/ipfs";
import { resetTXStatus } from "../../actions/newGrant";

function TXLoading({ status }: { status: string }) {
  const dispatch = useDispatch();
  const resetStatuses = () => {
    dispatch(resetFileStatus());
    dispatch(resetTXStatus());
  };
  if (status === "initiated") {
    return (
      <div style={{ color: "yellow", background: "grey" }}>
        Your transaction is pending! Hold tight, we will let you know once your
        grant has been created
      </div>
    );
  }
  if (status === "error") {
    return (
      <div style={{ color: "red", background: "grey" }}>
        There was an error processing your transaction. Please try again
      </div>
    );
  }
  return (
    <div style={{ color: "green" }}>
      Your grant has been published has been published! View your{" "}
      <Link to={grantsPath()} onClick={() => resetStatuses()}>
        Grants
      </Link>
    </div>
  );
}

export default TXLoading;
