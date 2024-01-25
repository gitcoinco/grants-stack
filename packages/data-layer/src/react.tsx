import React, { createContext, useContext } from "react";
import { DataLayer } from "./data-layer";

export const DataLayerContext = createContext<DataLayer | null>(null);

interface DataLayerProps extends React.PropsWithChildren {
  client: DataLayer | null;
}

export const DataLayerProvider: React.FC<DataLayerProps> = ({
  client,
  children,
}) => {
  return (
    <DataLayerContext.Provider value={client}>
      {children}
    </DataLayerContext.Provider>
  );
};

export const useDataLayer = (): DataLayer => {
  const context = useContext(DataLayerContext);

  if (context === null) {
    throw new Error("useDataLayer must be used within a DataLayerProvider");
  }
  return context;
};
