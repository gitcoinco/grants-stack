import {
  FallbackProvider,
  JsonRpcProvider,
  JsonRpcSigner,
} from "@ethersproject/providers";
import {
  Allo,
  AlloProvider,
  AlloV1,
  AlloV2,
  createEthersTransactionSender,
  createPinataIpfsUploader,
  createWaitForIndexerSyncTo,
  isChainIdSupported,
} from "common";
import { getConfig } from "common/src/config";
import { useEffect, useMemo, useState } from "react";
import { AlloVersionProvider } from "common/src/components/AlloVersionSwitcher";
import { reconnect } from "@wagmi/core";
import { useAccount } from "wagmi";
import { config, getEthersProvider, getEthersSigner } from "./wagmi";

function AlloWrapper({ children }: { children: JSX.Element | JSX.Element[] }) {
  const { chain, isConnected, connector } = useAccount();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [provider, setProvider] = useState<
    JsonRpcProvider | FallbackProvider | undefined
  >();
  const [backend, setBackend] = useState<Allo | null>(null);

  const chainID = chain?.id;

  useEffect(() => {
    const init = async () => {
      const s = await getEthersSigner(connector!, chainID!);
      const p = getEthersProvider(chainID!);

      setSigner(s);
      setProvider(p);
    };

    const connect = async () => {
      await reconnect(config);
    };

    if (isConnected && chainID && connector?.getAccounts) init();
    if (!isConnected) connect();
  }, [chainID, isConnected, connector]);

  useEffect(() => {
    const chainIdSupported = chainID ? isChainIdSupported(chainID) : false;

    if (
      !isConnected ||
      !connector ||
      !provider ||
      !signer ||
      !chainID ||
      !chainIdSupported
    ) {
      return;
    }

    const globalConfig = getConfig();
    let alloBackend: Allo;

    if (globalConfig.allo.version === "allo-v2") {
      alloBackend = new AlloV2({
        chainId: chainID,
        transactionSender: createEthersTransactionSender(signer, provider),
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
        transactionSender: createEthersTransactionSender(signer, provider),
        ipfsUploader: createPinataIpfsUploader({
          token: getConfig().pinata.jwt,
          endpoint: `${getConfig().pinata.baseUrl}/pinning/pinFileToIPFS`,
        }),
        waitUntilIndexerSynced: createWaitForIndexerSyncTo(
          `${getConfig().dataLayer.gsIndexerEndpoint}/graphql`
        ),
      });
    }

    setBackend(alloBackend);
  }, [provider, signer, chainID]);

  const memoizedBackend = useMemo(() => backend, [backend]);

  return (
    <AlloProvider backend={memoizedBackend}>
      <AlloVersionProvider>{children}</AlloVersionProvider>
    </AlloProvider>
  );
}

export default AlloWrapper;
