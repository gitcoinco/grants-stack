import {
  Allo,
  AlloProvider,
  AlloV1,
  AlloV2,
  ChainId,
  createEthersTransactionSender,
  createPinataIpfsUploader,
  createWaitForIndexerSyncTo,
  isChainIdSupported,
} from "common";
import { useNetwork, useProvider, useSigner } from "wagmi";
import { getConfig } from "common/src/config";
import { useMemo } from "react";
import { AlloVersionProvider } from "common/src/components/AlloVersionSwitcher";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { chain } = useNetwork();
  const web3Provider = useProvider();
  const { data: signer } = useSigner();
  const chainID = chain?.id;

  const backend = useMemo(() => {
    const chainIdSupported = chainID ? isChainIdSupported(chainID) : false;

    if (!web3Provider || !signer || !chainID || !chainIdSupported) {
      return null;
    }

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

  return (
    <AlloProvider backend={backend}>
      <AlloVersionProvider>{children}</AlloVersionProvider>
    </AlloProvider>
  );
}

export default AlloWrapper;
