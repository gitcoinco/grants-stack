import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { grantsPath } from "../../routes";
import { resetFileStatus } from "../../actions/ipfs";

function TXLoading({ status }: { status: string }) {
  const dispatch = useDispatch();
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
      Your grant has been published has been published! View your grants{" "}
      <Link to={grantsPath()} onClick={() => dispatch(resetFileStatus())}>
        Grants
      </Link>
    </div>
  );
}

export default TXLoading;
