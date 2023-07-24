import { CartProject } from "../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loadCartFromLocalStorage,
  saveCartToLocalStorage,
} from "../features/api/LocalStorage";
import { RoundContext } from "./RoundContext";

export interface CartContextState {
  cart: CartProject[];
  setCart: React.Dispatch<SetStateAction<CartProject[]>>;
}

export const initialCartState: CartContextState = {
  cart: loadCartFromLocalStorage() ?? [],
  setCart: () => {
    /**/
  },
};

export const CartContext = createContext<CartContextState>(initialCartState);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const roundContext = useContext(RoundContext);
  const currentRoundId = roundContext?.state?.currentRoundId;
  const [cart, setCart] = useState(initialCartState.cart);

  useEffect((): void => {
    if (currentRoundId) {
      const storedCart = loadCartFromLocalStorage() ?? initialCartState.cart;
      setCart(storedCart);
    }
  }, [currentRoundId]);

  useEffect((): void => {
    if (currentRoundId) {
      saveCartToLocalStorage(cart);
    }
  }, [cart, currentRoundId]);

  const providerProps: CartContextState = {
    cart,
    setCart,
  };

  return (
    <CartContext.Provider value={providerProps}>
      {children}
    </CartContext.Provider>
  );
};

/* Custom Hooks */
type UseCart = [
  cart: CartContextState["cart"],
  handleAddProjectsToCart: (projects: CartProject[]) => void,
  handleRemoveProjectsFromCart: (projects: CartProject[]) => void
];

export const useCart = (): UseCart => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const { cart, setCart } = context;

  const handleAddProjectsToCart = (projectsToAdd: CartProject[]): void => {
    const currentCart = loadCartFromLocalStorage() ?? [];

    // Add projects to the cart if they are not already present
    const newCart = projectsToAdd.reduce((acc, projectToAdd) => {
      const isProjectAlreadyInCart = acc.find(
        (project) =>
          project.projectRegistryId === projectToAdd.projectRegistryId
      );
      return isProjectAlreadyInCart ? acc : acc.concat(projectToAdd);
    }, currentCart);

    setCart(newCart);
    saveCartToLocalStorage(newCart);
    console.log("newCart", newCart);
  };

  const handleRemoveProjectsFromCart = (
    projectsToRemove: CartProject[]
  ): void => {
    const currentCart = loadCartFromLocalStorage() ?? [];

    // Remove projects from the cart if they are present
    const newCart = currentCart.filter(
      (project) =>
        !projectsToRemove.find(
          (projectToRemove) =>
            projectToRemove.projectRegistryId === project.projectRegistryId
        )
    );

    setCart(newCart);
    saveCartToLocalStorage(newCart);
    console.log("newCart", newCart);
  };

  return [cart, handleAddProjectsToCart, handleRemoveProjectsFromCart];
};
