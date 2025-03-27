import { ArrowTrendingUpIcon, LinkIcon } from "@heroicons/react/24/solid";
import { useProjectDetailsParams } from "../hooks/useProjectDetailsParams";
import { useDataLayer } from "data-layer";
import { useApplication } from "../../../projects/hooks/useApplication";
import { CartButtonToggle } from "./CartButtonToggle";
import { ProjectStats } from "./ProjectStats";

export function Sidebar(props: {
  isAlreadyInCart: boolean;
  isBeforeRoundEndDate?: boolean;
  removeFromCart: () => void;
  addToCart: () => void;
}) {
  const { chainId, roundId, applicationId } = useProjectDetailsParams();
  const dataLayer = useDataLayer();

  const { data: application } = useApplication(
    {
      chainId: Number(chainId as string),
      roundId,
      applicationId: applicationId,
    },
    dataLayer
  );

  return (
    <div>
      <div className="min-w-[320px] h-fit mb-6 rounded-3xl bg-gray-50">
        <ProjectStats application={application} />
        {props.isBeforeRoundEndDate && (
          <CartButtonToggle
            isAlreadyInCart={props.isAlreadyInCart}
            addToCart={props.addToCart}
            removeFromCart={props.removeFromCart}
          />
        )}
      </div>
      {!props.isBeforeRoundEndDate && (
        <a
          href={`/#/projects/${application?.project.id}`}
          target="_blank"
          className="mt-4 flex font-bold justify-center border rounded-lg px-4 py-2"
        >
          <ArrowTrendingUpIcon className="w-4 h-4 inline-block mt-1 mr-2" />
          View history
          <LinkIcon className="w-4 h-4 ml-2 mt-1" />
        </a>
      )}
    </div>
  );
}
