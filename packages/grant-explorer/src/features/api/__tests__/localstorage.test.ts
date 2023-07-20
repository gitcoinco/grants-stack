import { Project } from "../types";
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
      const roundId1 = "1";
      const cart: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      saveCartToLocalStorage(cart, roundId1);

      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        `cart-round-${roundId1}`,
        JSON.stringify(cart),
      );
      expect(localStorage.__STORE__[`cart-round-${roundId1}`]).toBe(
        JSON.stringify(cart),
      );
      expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    });

    it("retrieves a cart from localstorage for different rounds", function () {
      const roundId1 = "1";
      const roundId2 = "2";
      const round1Cart: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      const round2Cart: Project[] = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];
      localStorage.__STORE__[`cart-round-${roundId1}`] =
        JSON.stringify(round1Cart);
      localStorage.__STORE__[`cart-round-${roundId2}`] =
        JSON.stringify(round2Cart);

      const list1 = loadCartFromLocalStorage(roundId1);
      const list2 = loadCartFromLocalStorage(roundId2);

      expect(list1).toEqual(round1Cart);
      expect(list2).toEqual(round2Cart);
    });

    it("retrieves empty project list when cart is empty on localstrage ", function () {
      const list = loadCartFromLocalStorage("1");

      expect(list).toEqual([]);
    });
  });
});
