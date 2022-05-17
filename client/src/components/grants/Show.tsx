import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { grantsPath } from "../../routes";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/currentGrant";

function GrantsList() {
  const dispatch = useDispatch();
  const props = useSelector(
    (state: RootState) => ({
      chainID: state.web3.chainID,
      loading: state.currentGrant.loading,
      currentGrant: state.currentGrant.currentGrant,
    }),
    shallowEqual
  );

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      dispatch(fetchGrantData(Number(id)));
    }
  }, [dispatch, id, props.chainID]);

  const { loading, currentGrant } = props;

  console.log({ currentGrant });

  return (
    <div>
      <div>Grant #{currentGrant?.chain}</div>
      {loading ? (
        <div>Loading grant data from IPFS</div>
      ) : (
        <>
          <p>Title: {currentGrant?.title}</p>
          <p>Description: {currentGrant?.description}</p>
          <p>Webstie: {currentGrant?.website}</p>
          <p>Chain: {currentGrant?.chain}</p>
          <p>Wallet: {currentGrant?.wallet}</p>
          <p>
            Received Funding: {currentGrant?.receivedFunding ? "Yes" : "No"}
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
