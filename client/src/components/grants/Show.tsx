import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { addressesByChainID } from "../../contracts/deployments";
import GrantsRegistryABI from "../../contracts/abis/GrantsRegistry.json";
// import { RootState } from '../../reducers';
import { grantsPath } from "../../routes";
import { RootState } from "../../reducers";
import { global } from "../../global";

interface MetaData {
  title: string;
  description: string;
  website: string;
  chain: string;
  wallet: string;
  receivedFunding: boolean;
}

function GrantsList() {
  const dispatch = useDispatch();
  const props = useSelector(
    (state: RootState) => ({
      chainID: state.web3.chainID,
    }),
    shallowEqual
  );

  const { id } = useParams();
  const [metaData, setMetaData] = useState<MetaData>({
    title: "",
    description: "",
    website: "",
    chain: "",
    wallet: "",
    receivedFunding: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGrantData() {
      const { chainID } = props;

      const addresses = addressesByChainID(chainID!);
      const signer = global.web3Provider!.getSigner();
      setLoading(true);
      const grantRegistry = new ethers.Contract(
        addresses.grantsRegistry,
        GrantsRegistryABI,
        signer
      );
      const metadataUri: string = await grantRegistry.grantMetaData(Number(id));

      const metaDataResponse = await fetch(metadataUri);
      const metaDataValues = await metaDataResponse.json();

      setMetaData(metaDataValues);
      setLoading(false);
    }

    fetchGrantData();
  }, [dispatch, id, props.chainID]);

  return (
    <div>
      <div>Grant #{id}</div>
      {loading ? (
        <div>Loading grant data from IPFS</div>
      ) : (
        <>
          {Object.entries(metaData).map(([key, value]) => {
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
        </>
      )}
      <div>
        <Link to={grantsPath()}>Back to grants list</Link>
      </div>
    </div>
  );
}

export default GrantsList;
