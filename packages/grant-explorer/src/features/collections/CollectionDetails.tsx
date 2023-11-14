import { Address, useEnsName } from "wagmi";
import { Collection } from "./hooks/useCollections";
import { Skeleton } from "@chakra-ui/react";
import tw from "tailwind-styled-components";
import { LinkIcon } from "@heroicons/react/20/solid";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

type Props = {
  collection: Collection;
  onAddAllApplicationsToCart: () => void;
};
export function CollectionDetails({
  collection,
  onAddAllApplicationsToCart,
}: Props) {
  const ens = useEnsName({
    chainId: 1,
    address: collection.author as Address,
    enabled: Boolean(collection.author),
  });

  return (
    <div className="mt-16">
      <h3 className="text-4xl font-medium mb-2">{`${collection.name} (${collection.projects.length})`}</h3>
      <div className="text-lg flex gap-2 mb-12">
        by:
        <Skeleton isLoaded={!ens.isLoading}>
          <span className="text-white">{ens.data ?? collection.author}</span>
        </Skeleton>
      </div>

      <div className="flex">
        <div className="text-lg flex-1">{collection.description}</div>
        <div className="w-96">
          <div className="flex justify-end gap-2">
            <Button variant="primary" onClick={() => alert("not implemented")}>
              <LinkIcon className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={onAddAllApplicationsToCart}>
              <ShoppingCartIcon className="w-4 h-4" />
              Add all to cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// These buttons are very different from the old GS designs.
// Keeping it here for now until other designs with these kinds of buttons.
const variantMap = {
  default: "bg-white hover:bg-grey-100",
  primary: "bg-orange-100 hover:bg-orange-50",
};
const Button = tw.button<{ variant?: "primary" | "default" }>`
border-grey-100 
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
