import { useReadContract } from "wagmi";
import {
  easConfig,
  schemaByNetwork,
  VERSION_ABI,
  legacyABI,
  proxyABI,
} from "./config";
import { EAS__factory } from "@ethereum-attestation-service/eas-contracts";

/**
 * Hook to manage EAS configuration based on chainId.
 */
export const useEASConfig = (chainId: number) => {
  let easAddress = easConfig[chainId]?.eas;

  const proxy = easConfig[chainId]?.proxy;
  if (proxy) {
    easAddress = proxy;
  }

  const { data: version } = useReadContract({
    chainId,
    address: easAddress,
    abi: VERSION_ABI,
    functionName: "VERSION",
  });

  const abi = proxy
    ? proxyABI
    : version !== undefined
      ? legacyABI
      : EAS__factory.abi;

  const schema = schemaByNetwork[chainId as keyof typeof schemaByNetwork];

  return { easAddress, abi, schema };
};
