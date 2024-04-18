import React, { useMemo, useState } from "react";
import { Button } from "common/src/styles";
import { CartProject } from "../../api/types";
import { CollectionShareDialog } from "../CollectionShareDialog";

export function Header(props: { projects: CartProject[] }) {
  const [showCollectionShareDialog, setShowCollectionShareDialog] =
    useState(false);

  const projects = useMemo(
    () =>
      props.projects.map((p: CartProject) => ({
        chainId: p.chainId,
        roundId: p.roundId,
        id: p.grantApplicationId,
      })),

    [props.projects]
  );

  return (
    <div>
      <div className="flex mt-5 border-b-2 pb-2">
        <h1 className="grow text-3xl">Cart</h1>
        <div>
          <Button
            type="button"
            onClick={() => {
              setShowCollectionShareDialog(true);
            }}
            className="rainbow-button
            px-1 ml-4 items-center justify-center shadow-sm text-sm rounded border-1 text-black bg-[#C1E4FC] px-4 border-grey-100 hover:shadow-md"
            data-testid="twitter-button"
          >
            <span>Share your cart as a collection</span>
          </Button>
        </div>
      </div>

      <p className="mt-6 leading-6">Cross-Round, Cross-Network Giving 🌐 🛒</p>
      <p className="mt-2 mb-5 leading-6">
        Donate seamlessly across multiple rounds and networks. Add projects to
        your cart and make a difference.
      </p>

      <CollectionShareDialog
        isOpen={showCollectionShareDialog}
        setIsOpen={setShowCollectionShareDialog}
        applications={projects}
      />
    </div>
  );
}
