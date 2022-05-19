import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { grantsPath } from "../../routes";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";

function GrantsList() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(id)];
    return {
      loading: grantMetadata ? grantMetadata.loading : false,
      currentGrant: grantMetadata?.metadata,
      ipfsInitialized: state.ipfs.initialized,
      ipfsInitializationError: state.ipfs.initializationError,
    };
  }, shallowEqual);

  useEffect(() => {
    if (props.ipfsInitialized && id) {
      dispatch(fetchGrantData(Number(id)));
    }
  }, [dispatch, props.ipfsInitialized, id]);

  if (props.ipfsInitializationError) {
    return <>Error initializing IPFS. Reload the page and try again.</>;
  }

  if (!props.ipfsInitialized) {
    return <>Initializing ipfs...</>;
  }

  if (props.loading && props.currentGrant === undefined) {
    return <>Loading grant data from IPFS... </>;
  }

  return (
    <div>
      {props.currentGrant && (
        <>
          <div>Grant #{props.currentGrant.chain}</div>
          <p>Title: {props.currentGrant.title}</p>
          <p>Description: {props.currentGrant.description}</p>
          <p>Webstie: {props.currentGrant.website}</p>
          <p>Chain: {props.currentGrant.chain}</p>
          <p>Wallet: {props.currentGrant.wallet}</p>
          <p>
            Received Funding:{" "}
            {props.currentGrant.receivedFunding ? "Yes" : "No"}
          </p>
        </>
      )}

      <div>
        <Link to={grantsPath()}>Back to grants list</Link>
      </div>
    </div>
  );
}

export default GrantsList;
