import tw from "tailwind-styled-components";
import { CheckIcon, LinkIcon } from "@heroicons/react/20/solid";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { CollectionV1 } from "./collections";
import { useCollections } from "./hooks/useCollections";

type Props = {
  collection: CollectionV1;
  projectsInView: number;
  onAddAllApplicationsToCart: () => void;
};

const defaultCollectionName = "Untitled Collection";

export function CollectionDetails({
  collection,
  projectsInView,
  onAddAllApplicationsToCart,
}: Props) {
  const collections = useCollections();

  // filter collections by collection.href
  const description = collections.data?.find(
    (c) => c.cid && location.href.includes(c.cid)
  )?.description;

  return (
    <div className="mt-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h3 className="text-4xl font-medium">
            {`${collection.name ?? defaultCollectionName} (${projectsInView})`}
          </h3>
          <div className="flex gap-2 mt-4 md:mt-0">
            <ShareButton url={location.href} />
            <AddToCartButton
              current={projectsInView}
              total={collection.applications.length}
              onAdd={onAddAllApplicationsToCart}
            />
          </div>
        </div>
        <div className="col-span-1 md:col-span-3 text-lg flex-1 whitespace-pre-wrap">
          {description ?? collection.description}
        </div>
      </div>
    </div>
  );
}

const AddToCartButton = ({
  current,
  total,
  onAdd,
}: {
  current: number;
  total: number;
  onAdd: () => void;
}) => {
  const [isAdded, setAdded] = useState(false);

  const Icon = isAdded ? CheckIcon : ShoppingCartIcon;
  return (
    <Button
      className=""
      disabled={isAdded}
      onClick={() => {
        onAdd();
        setAdded(true);
      }}
    >
      <Icon className="w-4 h-4" />
      {isAdded ? "Added" : `Add all to cart (${current}/${total})`}
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
  translucent: "bg-white/60 hover:bg-white/80 border-white border",
  primary: "bg-orange-100 hover:bg-orange-50",
};
export const Button = tw.button<{
  variant?: "primary" | "translucent" | "default";
}>`
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
