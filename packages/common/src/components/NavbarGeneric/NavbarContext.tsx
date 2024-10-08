import { createContext, PropsWithChildren, useContext } from "react";

// Define the type for the context value
type NavbarContextType = {
  showWalletInteraction?: boolean;
  showBanner?: boolean;
};

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

type NavbarProviderProps = PropsWithChildren<{
  value: NavbarContextType;
}>;

const NavbarProvider: React.FC<NavbarProviderProps> = ({ children, value }) => {
  return (
    <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
  );
};

const useNavbarContext = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbarContext must be used within a NavbarContext");
  }
  return context;
};

export { NavbarProvider, useNavbarContext };
