import {
  Allo,
  AlloProvider,
  AlloV1,
  AlloV2,
  createPinataIpfsUploader,
  createViemTransactionSender,
  createWaitForIndexerSyncTo,
  isChainIdSupported,
} from "common";
import { getConfig } from "common/src/config";
import { useEffect, useState } from "react";
import { useNetwork, usePublicClient, useWalletClient } from "wagmi";
import { AlloVersionProvider } from "common/src/components/AlloVersionSwitcher";

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

  return (
    <AlloProvider backend={backend}>
      <AlloVersionProvider>{children}</AlloVersionProvider>
    </AlloProvider>
  );
}

export default AlloWrapper;
