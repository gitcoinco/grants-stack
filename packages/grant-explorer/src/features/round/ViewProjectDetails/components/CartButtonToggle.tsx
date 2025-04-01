import { CheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

export function CartButtonToggle(props: {
  isAlreadyInCart: boolean;
  addToCart: () => void;
  removeFromCart: () => void;
}) {
  return (
    <button
      className="font-mono bg-blue-100 hover:bg-blue-300  hover:text-grey-50 transition-all w-full items-center justify-center rounded-b-3xl rounded-t-none p-4 inline-flex gap-2"
      data-testid={props.isAlreadyInCart ? "remove-from-cart" : "add-to-cart"}
      onClick={() =>
        props.isAlreadyInCart ? props.removeFromCart() : props.addToCart()
      }
    >
      {props.isAlreadyInCart ? (
        <CheckIcon className="w-5 h-5" />
      ) : (
        <ShoppingCartIcon className="w-5 h-5" />
      )}
      {props.isAlreadyInCart ? "Added to cart" : "Add to cart"}
    </button>
  );
}
