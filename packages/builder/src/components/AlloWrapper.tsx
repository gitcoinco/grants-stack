import { useEffect, useState } from "react";
import {
  Allo,
  AlloV2,
  AlloProvider,
  createPinataIpfsUploader,
  waitForSubgraphSyncTo,
  createEthersTransactionSender,
} from "common";
import { global } from "../global";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { web3Provider, signer, chainID } = global;
  const [backend, setBackend] = useState<Allo | null>(null);

  useEffect(() => {
    if (!web3Provider || !signer || !chainID) {
      setBackend(null);
    } else {
      const alloBackend: Allo = new AlloV2({
        chainId: chainID,
        transactionSender: createEthersTransactionSender(signer, web3Provider),
        projectRegistryAddress: "0x0000000000000000000000000000000000000000",
        ipfsUploader: createPinataIpfsUploader({
          token: process.env.REACT_APP_PINATA_JWT || "",
          endpoint: process.env.REACT_APP_PINATA_GATEWAY || "",
        }),
        waitUntilIndexerSynced: waitForSubgraphSyncTo,
      });

      setBackend(alloBackend);
    }
  }, [web3Provider, signer, chainID]);

  return <AlloProvider backend={backend}>{children}</AlloProvider>;
}

export default AlloWrapper;
