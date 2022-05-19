import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { grantsPath } from "../../routes";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";

function GrantsList() {
  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(params.id)];
    return {
      id: params.id,
      loading: grantMetadata ? grantMetadata.loading : false,
      currentGrant: grantMetadata?.metadata,
      ipfsInitialized: state.ipfs.initialized,
      ipfsInitializationError: state.ipfs.initializationError,
    };
  }, shallowEqual);

  useEffect(() => {
    if (props.ipfsInitialized && params.id) {
      dispatch(fetchGrantData(Number(params.id)));
    }
  }, [dispatch, props.ipfsInitialized, params.id]);

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
