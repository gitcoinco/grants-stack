import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";

import { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";
import {
  Badge,
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
} from "./styles";
import { getAddress } from "viem";
import * as Routes from "common/src/routes";
import { ProjectBanner } from "./ProjectBanner";
import { createIpfsImageUrl } from "common/src/ipfs";

function ProjectLogo(props: {
  className?: string;
  imageCid: string;
  size: number;
}) {
  const projectBannerImageUrl = createIpfsImageUrl({
    cid: props.imageCid,
    height: props.size * 2,
  });

  return (
    <img
      className={`object-cover rounded-full ${props.className ?? ""}`}
      style={{ height: props.size, width: props.size }}
      src={projectBannerImageUrl}
      alt="Project Banner"
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl my-3 overflow-hidden p-4 pb-10">
      <Skeleton height="110px" />
      <SkeletonCircle size="48px" mt="-24px" ml="10px" />
      <SkeletonText mt="3" noOfLines={1} spacing="4" skeletonHeight="7" />
      <SkeletonText mt="10" noOfLines={4} spacing="4" skeletonHeight="2" />
    </div>
  );
}

export function ProjectCard(props: {
  application: ApplicationSummary;
  inCart: boolean;
  addToCart: (app: ApplicationSummary) => void;
  removeFromCart: (app: ApplicationSummary) => void;
}) {
  const { application, inCart, addToCart, removeFromCart } = props;

  return (
    <BasicCard className="w-full hover:opacity-90 transition hover:shadow-none">
      <a
        target="_blank"
        href={Routes.Explorer.applicationPath(
          application.chainId,
          getAddress(application.roundId),
          application.roundApplicationId
        )}
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
            {"Round name goes here"}
          </Badge>
        </CardContent>
      </a>
      <div className="p-2">
        <div className="border-t pt-2 flex justify-end">
          {inCart ? (
            <button onClick={() => removeFromCart(application)}>
              <CheckedCircleIcon className="w-10" />
            </button>
          ) : (
            <button onClick={() => addToCart(application)}>
              <CartCircleIcon className="w-10" />
            </button>
          )}
        </div>
      </div>
    </BasicCard>
  );
}
