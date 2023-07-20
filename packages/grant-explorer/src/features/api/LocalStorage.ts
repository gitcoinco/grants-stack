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

export function reloadPageOnLocalStorageEvent(
  roundId: string,
  event: StorageEvent,
): void {
  // Check if the event is related to localStorage changes
  if (event.storageArea === window.localStorage) {
    // Check if the updated item is 'cart-round-roundId'
    if (event.key === `cart-round-${roundId}`) {
      // Check if it's a different tab
      if (document.visibilityState === "hidden") {
        // Reload the page
        window.location.reload();
      }
    }
  }
}
