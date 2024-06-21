import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { ApplicationSummary } from "data-layer";
import {
  Badge,
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
} from "./styles";
import { applicationPath } from "common/src/routes/explorer";
import { ProjectBanner, ProjectLogo } from "./ProjectBanner";
import { usePostHog } from "posthog-js/react";

export function ApplicationCard(props: {
  application: ApplicationSummary;
  inCart: boolean;
  onAddToCart: (app: ApplicationSummary) => void;
  onRemoveFromCart: (app: ApplicationSummary) => void;
}): JSX.Element {
  const {
    application,
    inCart,
    onAddToCart: addToCart,
    onRemoveFromCart: removeFromCart,
  } = props;

  const posthog = usePostHog();
  const roundId = application.roundId.toLowerCase();

  return (
    <BasicCard className="w-full hover:opacity-90 transition hover:shadow-none">
      <a
        target="_blank"
        href={applicationPath({
          chainId: application.chainId,
          roundId,
          applicationId: application.roundApplicationId,
        })}
        data-track-event="project-card"
      >
        <CardHeader className="relative">
          <ProjectBanner
            bannerImgCid={application.bannerImageCid}
            classNameOverride={
              "bg-black h-[120px] w-full object-cover rounded-t"
            }
            resizeHeight={120}
          />
        </CardHeader>
        <CardContent className="relative">
          {application.logoImageCid !== null && (
            <ProjectLogo
              className="border-solid border-2 border-white absolute -top-[24px] "
              imageCid={application.logoImageCid}
              size={48}
            />
          )}
          <div className="truncate mt-4">{application.name}</div>
          <CardDescription className=" min-h-[96px]">
            <div className="text-sm line-clamp-4">
              {application.summaryText}
            </div>
          </CardDescription>

          <Badge color="grey" rounded="3xl">
            <span className="truncate">{application.roundName}</span>
          </Badge>
        </CardContent>
      </a>
      <div className="p-2">
        <div className="border-t pt-2 flex justify-end">
          {inCart ? (
            <button
              aria-label="Remove from cart"
              onClick={() => {
                posthog.capture("application_removed_from_cart", {
                  applicationRef: application.applicationRef,
                });

                removeFromCart(application);
              }}
            >
              <CheckedCircleIcon className="w-10" />
            </button>
          ) : (
            <button
              aria-label="Add to cart"
              onClick={() => {
                posthog.capture("application_added_to_cart", {
                  applicationRef: application.applicationRef,
                });

                addToCart(application);
              }}
            >
              <CartCircleIcon className="w-10" />
            </button>
          )}
        </div>
      </div>
    </BasicCard>
  );
}
