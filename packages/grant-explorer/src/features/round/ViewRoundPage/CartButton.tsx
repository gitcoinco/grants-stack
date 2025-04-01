import { Project } from "../../api/types";

import { CartButtonToggle } from "./CartButtonToggle";

export function CartButton(props: {
  project: Project;
  isAlreadyInCart: boolean;
  removeFromCart: () => void;
  addToCart: () => void;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div>
      <CartButtonToggle
        project={props.project}
        isAlreadyInCart={props.isAlreadyInCart}
        removeFromCart={props.removeFromCart}
        addToCart={props.addToCart}
        setCurrentProjectAddedToCart={props.setCurrentProjectAddedToCart}
        setShowCartNotification={props.setShowCartNotification}
      />
    </div>
  );
}
