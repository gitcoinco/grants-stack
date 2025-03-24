import { ReactComponent as CartCircleIcon } from "../../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../../assets/icons/checked-circle.svg";
import { Project } from "../../api/types";

export function CartButtonToggle(props: {
  project: Project;
  isAlreadyInCart: boolean;
  addToCart: () => void;
  removeFromCart: () => void;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // if the project is not added, show the add to cart button
  // if the project is added to the cart, show the remove from cart button
  if (props.isAlreadyInCart) {
    return (
      <div
        className="cursor-pointer"
        data-testid="remove-from-cart"
        onClick={props.removeFromCart}
      >
        <CheckedCircleIcon className="w-10" />
      </div>
    );
  }
  return (
    <div
      className="cursor-pointer"
      data-testid="add-to-cart"
      // oonclick adds the project to the cart, sets the current project added to cart and shows the cart notification
      onClick={() => {
        props.addToCart();
        props.setCurrentProjectAddedToCart(props.project);
        props.setShowCartNotification(true);
      }}
    >
      <CartCircleIcon className="w-10" />
    </div>
  );
}
