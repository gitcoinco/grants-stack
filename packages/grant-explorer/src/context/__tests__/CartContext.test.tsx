import { fireEvent, render, screen } from "@testing-library/react";
import { CartProvider, useCart } from "../CartContext";
import { CartProject } from "../../features/api/types";
import { makeApprovedProjectData } from "../../test-utils";
import {
  loadCartFromLocalStorage,
  saveCartToLocalStorage,
} from "../../features/api/LocalStorage";
import { initialRoundState, RoundContext } from "../RoundContext";

jest.mock("../../features/api/LocalStorage");

describe("<CartProvider>", () => {
  describe("when cart is empty", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should not have any projects in the cart", () => {
      render(
        <CartProvider>
          <TestingUseCartComponent />
        </CartProvider>
      );

      expect(screen.queryAllByTestId("cart-project")).toHaveLength(0);
    });
  });

  describe("Cart -> remove", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should update the cart when removing the project from the cart", () => {
      render(
        <CartProvider>
          <TestingUseCartComponent />
        </CartProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-cart"));
      expect(screen.getAllByTestId("cart-project")).toHaveLength(1);

      fireEvent.click(screen.getByTestId("remove-project-from-cart"));
      expect(screen.queryAllByTestId("cart-project")).toHaveLength(0);
    });

    it("does not error when trying to remove a project not in the cart", () => {
      render(
        <CartProvider>
          <TestingUseCartComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId("remove-project-from-cart"));
      expect(screen.queryAllByTestId("cart-project")).toHaveLength(0);
    });
  });

  describe("Cart -> Add", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should add a project to the cart when add project is invoked", () => {
      render(
        <CartProvider>
          <TestingUseCartComponent />
        </CartProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-cart"));

      expect(screen.getAllByTestId("cart-project")).toHaveLength(1);
    });

    it("should not add the same project twice to the cart", () => {
      render(
        <CartProvider>
          <TestingUseCartComponent />
        </CartProvider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-cart"));
      fireEvent.click(screen.getByTestId("add-project-to-cart"));

      expect(screen.getAllByTestId("cart-project")).toHaveLength(1);
    });

    it("should update the cart in localstorage when currently in a round and the cart changes", () => {
      render(
        <RoundContext.Provider
          value={{
            state: { ...initialRoundState, currentRoundId: "1" },
            dispatch: jest.fn(),
          }}
        >
          <CartProvider>
            <TestingUseCartComponent />
          </CartProvider>
        </RoundContext.Provider>
      );
      fireEvent.click(screen.getByTestId("add-project-to-cart"));

      expect(saveCartToLocalStorage).toBeCalled();
    });
  });
});

const testProject: CartProject = makeApprovedProjectData();

const TestingUseCartComponent = () => {
  const [cart, handleAddProjectsToCart, handleRemoveProjectsFromCart] =
    useCart();

  return (
    <>
      {cart.map((project, index) => {
        return (
          <div key={index} data-testid="cart-project">
            {`Grant Application Id: ${project.grantApplicationId}
            || Project Registry Id: ${project.projectRegistryId}`}

            <span data-testid="cart-project-id">
              {project.projectRegistryId}
            </span>
          </div>
        );
      })}

      <button
        data-testid="add-project-to-cart"
        onClick={() => handleAddProjectsToCart([testProject])}
      >
        Add Project To Cart
      </button>

      <button
        data-testid="remove-project-from-cart"
        onClick={() => handleRemoveProjectsFromCart([testProject])}
      >
        Remove Project From Cart
      </button>
    </>
  );
};
