import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import CustomerSupport, {
  menuItems,
} from "../../../components/base/CustomerSupport";

describe("<CustomerSupport />", () => {
  describe("Help button click", () => {
    beforeEach(() => {
      render(<CustomerSupport />);
      const customerSupport = screen.getByTestId("customer-support");
      const customerSupportButton = customerSupport.querySelector(
        "button"
      ) as Element;

      act(() => {
        customerSupportButton.dispatchEvent(
          new MouseEvent("click", { bubbles: true })
        );
      });
    });

    describe("should open menu dropdown", () => {
      menuItems.forEach((i) => {
        test(`with menu item: ${i.title}`, async () => {
          expect(screen.getByText(i.title)).toBeInTheDocument();
        });
      });
    });
  });
});
