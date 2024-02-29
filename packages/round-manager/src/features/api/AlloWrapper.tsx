import {
  Allo,
  AlloProvider,
  AlloV1,
  AlloV2,
  createEthersTransactionSender,
  createPinataIpfsUploader,
  createWaitForIndexerSyncTo,
} from "common";
import { useNetwork, useProvider, useSigner } from "wagmi";
import { getConfig } from "common/src/config";
import { addressesByChainID } from "./deployments";
import { useMemo } from "react";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { chain } = useNetwork();
  const web3Provider = useProvider();
  const { data: signer } = useSigner();
  const chainID = chain?.id;

  const backend = useMemo(() => {
    if (!web3Provider || !signer || !chainID) {
      return null;
    }

    const addresses = addressesByChainID(chainID);
    const config = getConfig();
    let alloBackend: Allo;

    if (config.allo.version === "allo-v2") {
      alloBackend = new AlloV2({
        chainId: chainID,
        transactionSender: createEthersTransactionSender(signer, web3Provider),
        ipfsUploader: createPinataIpfsUploader({
          token: getConfig().pinata.jwt,
          endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
        }),
        waitUntilIndexerSynced: createWaitForIndexerSyncTo(
          `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`
        ),
        allo: addresses.projectRegistry as `0x${string}`,
      });
    } else {
      alloBackend = new AlloV1({
        chainId: chainID,
        transactionSender: createEthersTransactionSender(signer, web3Provider),
        ipfsUploader: createPinataIpfsUploader({
          token: getConfig().pinata.jwt,
          endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
        }),
        waitUntilIndexerSynced: createWaitForIndexerSyncTo(
          `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`
        ),
      });
    }

    return alloBackend;
  }, [web3Provider, signer, chainID]);

  return <AlloProvider backend={backend}>{children}</AlloProvider>;
}

export default AlloWrapper;
