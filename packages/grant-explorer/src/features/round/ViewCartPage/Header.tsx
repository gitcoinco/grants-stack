import { useMemo } from "react";
import { CartProject } from "../../api/types";
import { CollectionShareButtonContainer } from "../CollectionShareDialog";

export function Header(props: { projects: CartProject[] }) {
  const applications = useMemo(
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
          <CollectionShareButtonContainer
            showOnlyInAlloVersion="allo-v2"
            applications={applications}
          />
        </div>
      </div>

      <p className="mt-6 leading-6">Cross-Round, Cross-Network Giving 🌐 🛒</p>
      <p className="mt-2 mb-5 leading-6">
        Donate seamlessly across multiple rounds and networks. Add projects to
        your cart and make a difference.
      </p>
    </div>
  );
}
