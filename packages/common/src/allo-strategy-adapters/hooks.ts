import { Address } from "wagmi";
import { PublicClient } from "viem";
import { useState, useEffect } from "react";
import { getAllocationAdapter } from "./index";
import { AdapterErrorWrapper } from "./adapter";

type AdapterResponseWrapper<T> = {
  loading: boolean;
  error: AdapterErrorWrapper | undefined;
  value: T | undefined;
};

export function useAdapterCanAllocate(
  client: PublicClient | undefined,
  poolId: string | undefined,
  strategyName: string | undefined,
  address: Address | undefined
): AdapterResponseWrapper<boolean> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AdapterErrorWrapper>();
  const [value, setValue] = useState<boolean>();

  useEffect(() => {
    if (
      client === undefined ||
      poolId === undefined ||
      strategyName === undefined
    ) {
      return;
    }

    setLoading(true);

    const adapter = getAllocationAdapter(strategyName);
    if (adapter === undefined) {
      setError({
        type: "ADAPTER_NOT_FOUND",
        strategyName,
        error: new Error(`Adapter not found for strategy: ${strategyName}`),
      });
      setLoading(false);
      return;
    }

    adapter
      .canAllocate(client, poolId, address)
      .then((resp) => {
        if (resp.type === "success") {
          setValue(resp.value);
        } else {
          setError(resp.error);
        }
      })
      .catch((e: AdapterErrorWrapper) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, poolId, strategyName]);

  return { loading, error, value };
}
