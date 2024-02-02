import React, { createContext, useContext } from "react";
import { Allo } from "./allo";

export const AlloContext = createContext<Allo | null>(null);

interface AlloProps extends React.PropsWithChildren {
  backend: Allo | null;
}

export const AlloProvider: React.FC<AlloProps> = ({ backend, children }) => {
  return (
    <AlloContext.Provider value={backend}>{children}</AlloContext.Provider>
  );
};

export const useAllo = (): Allo => {
  const context = useContext(AlloContext);

  if (context === null) {
    throw new Error("useAllo must be used within a AlloProvider");
  }

  return context;
};
