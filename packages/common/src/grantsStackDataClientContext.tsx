import React, { createContext, useContext, ReactNode } from "react";
import { GrantsStackDataClient } from "grants-stack-data-client";

export type { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";

type GrantsStackDataClientContextType = GrantsStackDataClient | null;

export const GrantsStackDataClientContext =
  createContext<GrantsStackDataClientContextType>(null);

type GrantsStackDataProviderProps = {
  client: GrantsStackDataClient;
  children: ReactNode;
};

export function GrantsStackDataProvider({
  client,
  children,
}: GrantsStackDataProviderProps) {
  return (
    <GrantsStackDataClientContext.Provider value={client}>
      {children}
    </GrantsStackDataClientContext.Provider>
  );
}

export function useGrantsStackDataClient(): GrantsStackDataClient {
  const context = useContext(GrantsStackDataClientContext);

  if (context === null) {
    throw new Error(
      "useGrantsStackDataClient must be used within a GrantsStackDataProvider"
    );
  }
  return context;
}
