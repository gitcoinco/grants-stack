import { Collection } from "./hooks/useCollections";
import tw from "tailwind-styled-components";
import { CheckIcon, LinkIcon } from "@heroicons/react/20/solid";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Props = {
  collection: Collection;
  onAddAllApplicationsToCart: () => void;
};
export function CollectionDetails({
  collection,
  onAddAllApplicationsToCart,
}: Props) {
  return (
    <div className="mt-16">
      <h3 className="text-4xl font-medium mb-2">{`${collection.name} (${collection.projects.length})`}</h3>
      <div className="text-lg flex gap-2 mb-12">
        by:
        <span className="text-white">{collection.author}</span>
      </div>

      <div className="flex">
        <div className="text-lg flex-1 whitespace-pre-wrap">
          {collection.description}
        </div>
        <div className="w-96">
          <div className="flex justify-end gap-2">
            <ShareButton url={location.href} />
            <AddToCartButton onAdd={onAddAllApplicationsToCart} />
          </div>
        </div>
      </div>
    </div>
  );
}

const AddToCartButton = ({ onAdd }: { onAdd: () => void }) => {
  const [isAdded, setAdded] = useState(false);

  const Icon = isAdded ? CheckIcon : ShoppingCartIcon;
  return (
    <Button
      className="hidden"
      disabled={isAdded}
      onClick={() => {
        onAdd();
        setAdded(true);
      }}
    >
      <Icon className="w-4 h-4" />
      {isAdded ? "Added" : "Add all to cart"}
    </Button>
  );
};

const ShareButton = ({ url = "" }) => {
  const [isCopied, setCopied] = useState(false);

  const Icon = isCopied ? CheckIcon : LinkIcon;
  return (
    <Button
      variant="primary"
      disabled={isCopied}
      onClick={() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);

        navigator.clipboard.writeText(url);
      }}
    >
      <Icon className="w-4 h-4" />
      {isCopied ? "Copied" : "Share"}
    </Button>
  );
};

// These buttons are very different from the old GS designs.
// Keeping it here for now until other designs with these kinds of buttons.
const variantMap = {
  default: "bg-white hover:bg-grey-100",
  primary: "bg-orange-100 hover:bg-orange-50",
};
export const Button = tw.button<{ variant?: "primary" | "default" }>`
border-grey-100
disabled:pointer-events-none
px-3 py-2
text-sm
font-medium
rounded-lg
whitespace-nowrap
inline-flex gap-1
items-center
transition-colors
${({ variant = "default" }) => variant && variantMap[variant]}
`;
