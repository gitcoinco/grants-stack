import {
  Allo,
  AlloProvider,
  AlloV1,
  AlloV2,
  ChainId,
  createEthersTransactionSender,
  createPinataIpfsUploader,
  createWaitForIndexerSyncTo,
} from "common";
import { getConfig } from "common/src/config";
import React, { useEffect, useState } from "react";
import { useNetwork, useProvider, useSigner } from "wagmi";
import { addressesByChainID } from "../contracts/deployments";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { chain } = useNetwork();
  const web3Provider = useProvider();
  const { data: signer } = useSigner();
  const chainID = chain?.id;

  const [backend, setBackend] = useState<Allo | null>(null);

  useEffect(() => {
    if (!web3Provider || !signer || !chainID) {
      setBackend(null);
    } else {
      const addresses = addressesByChainID(chainID) ?? addressesByChainID(1);

      const chainIdSupported = Object.values(ChainId).includes(chainID);

      const config = getConfig();
      let alloBackend: Allo;

      if (config.allo.version === "allo-v2") {
        alloBackend = new AlloV2({
          chainId: chainIdSupported ? chainID : 1,
          transactionSender: createEthersTransactionSender(
            signer,
            web3Provider
          ),
          ipfsUploader: createPinataIpfsUploader({
            token: getConfig().pinata.jwt,
            endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
          }),
          waitUntilIndexerSynced: createWaitForIndexerSyncTo(
            `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`
          ),
          allo: addresses.projectRegistry as `0x${string}`,
        });

        setBackend(alloBackend);
      } else {
        alloBackend = new AlloV1({
          chainId: chainIdSupported ? chainID : 1,
          transactionSender: createEthersTransactionSender(
            signer,
            web3Provider
          ),
          ipfsUploader: createPinataIpfsUploader({
            token: getConfig().pinata.jwt,
            endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
          }),
          waitUntilIndexerSynced: createWaitForIndexerSyncTo(
            `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`
          ),
        });

        setBackend(alloBackend);
      }
    }
  }, [web3Provider, signer, chainID]);

  return <AlloProvider backend={backend}>{children}</AlloProvider>;
}

export default AlloWrapper;
