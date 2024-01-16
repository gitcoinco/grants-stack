import { useEffect, useState } from "react";
import {
  Allo,
  AlloV2,
  AlloProvider,
  createPinataIpfsUploader,
  waitForSubgraphSyncTo,
  createEthersTransactionSender,
} from "common";
import { useNetwork, useProvider, useSigner } from "wagmi";

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
