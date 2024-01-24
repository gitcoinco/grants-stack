import {
  Allo,
  AlloProvider,
  AlloV1,
  AlloV2,
  createEthersTransactionSender,
  createPinataIpfsUploader,
  waitForSubgraphSyncTo,
} from "common";
import { getConfig } from "common/src/config";
import { useEffect, useState } from "react";
import { useNetwork, useProvider, useSigner } from "wagmi";
import { addressesByChainID } from "../contracts/deployments";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { chain } = useNetwork();
  const web3Provider = useProvider();
  const { data: signer } = useSigner();
  const chainID = chain?.id;

  const [backend, setBackend] = useState<Allo | null>(null);

  useEffect(() => {
    console.log("AlloWrapper: useEffect", web3Provider, signer, chainID);
    if (!web3Provider || !signer || !chainID) {
      setBackend(null);
    } else {
      const addresses = addressesByChainID(chainID!);
      const config = getConfig();
      let alloBackend: Allo;

      if (config.allo.version === "allo-v2") {
        alloBackend = new AlloV2({
          chainId: chainID,
          transactionSender: createEthersTransactionSender(
            signer,
            web3Provider
          ),
          projectRegistryAddress: "0x0000000000000000000000000000000000000000",
          ipfsUploader: createPinataIpfsUploader({
            token: getConfig().pinata.jwt,
            endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
          }),
          waitUntilIndexerSynced: waitForSubgraphSyncTo,
        });

        setBackend(alloBackend);
      } else {
        alloBackend = new AlloV1({
          chainId: chainID,
          transactionSender: createEthersTransactionSender(
            signer,
            web3Provider
          ),
          projectRegistryAddress: addresses?.projectRegistry! as `0x${string}`,
          ipfsUploader: createPinataIpfsUploader({
            token: getConfig().pinata.jwt,
            endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
          }),
          waitUntilIndexerSynced: waitForSubgraphSyncTo,
        });

        setBackend(alloBackend);
      }
    }
  }, [web3Provider, signer, chainID]);

  console.log("AlloWrapper: backend", backend);

  return <AlloProvider backend={backend}>{children}</AlloProvider>;
}

export default AlloWrapper;
