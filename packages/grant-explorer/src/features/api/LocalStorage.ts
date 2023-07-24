import { CartProject } from "./types";

export function saveCartToLocalStorage(cart: CartProject[]): void {
  window.localStorage.setItem("gitcoin-cart", JSON.stringify(cart));
}

export function loadCartFromLocalStorage(): CartProject[] {
  const serializedCart = window.localStorage.getItem("gitcoin-cart");
  if (!serializedCart) {
    return [];
  }
  return JSON.parse(serializedCart);
}

export function reloadPageOnLocalStorageEvent(event: StorageEvent): void {
  // Check if the event is related to localStorage changes
  if (event.storageArea === window.localStorage) {
    // Check if the updated item is 'gitcoin-cart'
    if (event.key === "gitcoin-cart") {
      // Check if it's a different tab
      if (document.visibilityState === "hidden") {
        // Reload the page
        window.location.reload();
      }
    }
  }
}
