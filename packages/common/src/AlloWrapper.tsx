import { useEffect, useState } from "react";
import {
  Allo,
  // AlloV2,
  AlloProvider,
  createPinataIpfsUploader,
  waitForSubgraphSyncTo,
  createEthersTransactionSender,
  AlloV1,
} from "./";
import { useNetwork, useProvider, useSigner } from "wagmi";
import { getConfig } from "./config";

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
      // const alloBackend: Allo = new AlloV2({
      //   chainId: chainID,
      //   transactionSender: createEthersTransactionSender(signer, web3Provider),
      //   ipfsUploader: createPinataIpfsUploader({
      //     token: getConfig().pinata.jwt,
      //     endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
      //   }),
      //   waitUntilIndexerSynced: waitForSubgraphSyncTo,
      // });

      const alloBackend: Allo = new AlloV1({
        chainId: chainID,
        transactionSender: createEthersTransactionSender(signer, web3Provider),
        ipfsUploader: createPinataIpfsUploader({
          token: getConfig().pinata.jwt,
          endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
        }),
        waitUntilIndexerSynced: waitForSubgraphSyncTo,
      });

      setBackend(alloBackend);
    }
  }, [web3Provider, signer, chainID]);

  return <AlloProvider backend={backend}>{children}</AlloProvider>;
}

export default AlloWrapper;
