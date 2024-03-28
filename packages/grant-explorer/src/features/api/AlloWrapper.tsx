import {
  Allo,
  AlloV1,
  AlloV2,
  createPinataIpfsUploader,
  createViemTransactionSender,
  createWaitForIndexerSyncTo,
  isChainIdSupported,
} from "common";
import { getConfig } from "common/src/config";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNetwork, usePublicClient, useWalletClient } from "wagmi";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainID = chain?.id;

  const [backend, setBackend] = useState<Allo | null>(null);

  useEffect(() => {
    const chainIdSupported = chainID ? isChainIdSupported(chainID) : false;

    if (!publicClient || !walletClient || !chainID || !chainIdSupported) {
      setBackend(null);
    } else {
      const config = getConfig();
      let alloBackend: Allo;

      if (config.allo.version === "allo-v2") {
        alloBackend = new AlloV2({
          chainId: chainID,
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
      } else {
        alloBackend = new AlloV1({
          chainId: chainID,
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

export const AlloContext = createContext<Allo | null>(null);

interface AlloProps extends React.PropsWithChildren {
  backend: Allo | null;
}

export const AlloProvider: React.FC<AlloProps> = ({ backend, children }) => {
  return (
    <AlloContext.Provider value={backend}>{children}</AlloContext.Provider>
  );
};

export const useAllo = () => {
  return useContext(AlloContext);
};
