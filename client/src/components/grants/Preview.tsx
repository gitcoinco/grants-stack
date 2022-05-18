// import { useEffect} from 'react'
import { Link } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { FormInputs } from "./New";
import { createGrant } from "../../actions/newGrant";
import { RootState } from "../../reducers";
import { grantsPath } from "../../routes";

function Loading({ status }: { status: string }) {
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
      <Link to={grantsPath()}>Grants</Link>
    </div>
  );
}

function GrantPreview({ grant, url }: { grant: FormInputs; url: string }) {
  const dispatch = useDispatch();

  const props = useSelector(
    (state: RootState) => ({
      txStatus: state.newGrant.txStatus,
      grants: state.newGrant.grants,
    }),
    shallowEqual
  );

  return (
    <>
      <div>
        Your grant data has been saved to IPFS! And can be accessed here:{" "}
        <a target="_blank" rel="noreferrer" href={url}>
          {url}
        </a>
      </div>
      <div>
        This is the data associated with your grant:{" "}
        {Object.entries(grant).map(([key, value]) => {
          if (key === "receivedFunding") {
            return (
              <p key={key}>
                {key}: {value ? "Yes" : "No"}
              </p>
            );
          }
          return (
            <p key={key}>
              {key}: {value}
            </p>
          );
        })}
      </div>
      {!props.txStatus ? (
        <>
          <div>Does everything look good?</div>
          <button type="button" onClick={() => dispatch(createGrant())}>
            Save and Publish
          </button>
        </>
      ) : (
        <Loading status={props.txStatus} />
      )}
      <Link to="/">Return to home page</Link>
    </>
  );
}

export default GrantPreview;
