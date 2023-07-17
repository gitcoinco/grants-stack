import { CartProject } from "../types";
import { makeApprovedProjectData } from "../../../test-utils";
import {
  loadCartFromLocalStorage,
  saveCartToLocalStorage,
} from "../LocalStorage";

describe("Local Storage", () => {
  describe("cart local storage", () => {
    beforeEach(() => {
      localStorage.clear();
      jest.clearAllMocks();
    });

    it("stores cart to local storage", () => {
      const cart: CartProject[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      saveCartToLocalStorage(cart);

      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        "cart",
        JSON.stringify(cart)
      );
      expect(localStorage.__STORE__["cart"]).toBe(JSON.stringify(cart));
      expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    });

    it("retrieves a cart from localstorage for different rounds", function () {
      const round1Cart: CartProject[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      const round2Cart: CartProject[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      const combinedCart = [...round1Cart, ...round2Cart];

      localStorage.__STORE__["cart"] = JSON.stringify(round1Cart);
      localStorage.__STORE__["cart"] = JSON.stringify(combinedCart);

      const list = loadCartFromLocalStorage();

      expect(list).toEqual(combinedCart);
    });

    it("retrieves empty project list when cart is empty on localstrage ", function () {
      const list = loadCartFromLocalStorage();

      expect(list).toEqual([]);
    });
  });
});
