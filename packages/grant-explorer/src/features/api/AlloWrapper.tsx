import {
  Allo,
  AlloProvider,
  AlloV1,
  AlloV2,
  ChainId,
  createPinataIpfsUploader,
  createViemTransactionSender,
  createWaitForIndexerSyncTo,
} from "common";
import { getConfig } from "common/src/config";
import React, { useEffect, useState } from "react";
import { useNetwork, usePublicClient, useWalletClient } from "wagmi";
import { zeroAddress } from "viem";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainID = chain?.id;

  const [backend, setBackend] = useState<Allo | null>(null);

  useEffect(() => {
    if (!publicClient || !walletClient || !chainID) {
      setBackend(null);
    } else {
      const chainIdSupported = Object.values(ChainId).includes(chainID);

      const config = getConfig();
      let alloBackend: Allo;

      if (config.allo.version === "allo-v2") {
        alloBackend = new AlloV2({
          chainId: chainIdSupported ? chainID : 1,
          transactionSender: createViemTransactionSender(
            walletClient,
            publicClient
          ),
          ipfsUploader: createPinataIpfsUploader({
            token: getConfig().pinata.jwt,
            endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
          }),
          waitUntilIndexerSynced: createWaitForIndexerSyncTo(
            `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`
          ),
          allo: zeroAddress,
        });

        setBackend(alloBackend);
      } else {
        alloBackend = new AlloV1({
          chainId: chainIdSupported ? chainID : 1,
          transactionSender: createViemTransactionSender(
            walletClient,
            publicClient
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
  }, [publicClient, walletClient, chainID]);

  return <AlloProvider backend={backend}>{children}</AlloProvider>;
}

export default AlloWrapper;
