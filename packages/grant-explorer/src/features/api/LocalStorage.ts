import { Project } from "./types";

export function saveCartToLocalStorage(cart: Project[], roundId: string): void {
  window.localStorage.setItem(`cart-round-${roundId}`, JSON.stringify(cart));
}

export function loadCartFromLocalStorage(roundId: string): Project[] {
  const serializedCart = window.localStorage.getItem(`cart-round-${roundId}`);
  if (!serializedCart) {
    return [];
  }
  return JSON.parse(serializedCart);
}
