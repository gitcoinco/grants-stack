import { Address } from "wagmi";
import { PublicClient } from "viem";
import { useState, useEffect } from "react";
import { getAllocationAdapter } from "./index";
import { AdapterError, UnknownAdapterError } from "./adapter";

type AdapterResponseWrapper<T> = {
  loading: boolean;
  error: Error | undefined;
  value: T | undefined;
};

export function useAdapterCanAllocate(
  client: PublicClient | undefined,
  poolId: string | undefined,
  strategyName: string | undefined,
  address: Address | undefined
): AdapterResponseWrapper<boolean> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AdapterError>();
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
      setError(new UnknownAdapterError(strategyName));
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
      .catch((e: AdapterError) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, poolId, strategyName]);

  return { loading, error, value };
}
