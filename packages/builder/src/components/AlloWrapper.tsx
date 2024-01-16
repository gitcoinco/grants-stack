import { useEffect, useState } from "react";
import {
  Allo,
  // AlloV2,
  AlloProvider,
  createPinataIpfsUploader,
  waitForSubgraphSyncTo,
  createEthersTransactionSender,
  AlloV1,
} from "common";
import { useNetwork, useProvider, useSigner } from "wagmi";
import { getConfig } from "common/src/config";
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
      // const alloBackend: Allo = new AlloV2({
      //   chainId: chainID,
      //   transactionSender: createEthersTransactionSender(signer, web3Provider),
      //   projectRegistryAddress: "0x0000000000000000000000000000000000000000",
      //   ipfsUploader: createPinataIpfsUploader({
      //     token: getConfig().pinata.jwt,
      //     endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
      //   }),
      //   waitUntilIndexerSynced: waitForSubgraphSyncTo,
      // });

      const addresses = addressesByChainID(chainID!);

      console.log("AlloWrapper: addresses", addresses);

      const alloBackend: Allo = new AlloV1({
        chainId: chainID,
        transactionSender: createEthersTransactionSender(signer, web3Provider),
        projectRegistryAddress: addresses?.projectRegistry! as `0x${string}`,
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
