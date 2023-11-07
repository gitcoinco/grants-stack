import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import { GrantsStackDataClient } from "grants-stack-data-client";
import useSWRInfinite from "swr/infinite";
import {
  Badge,
  BasicCard,
  CardContent,
  CardDescription,
  CardHeader,
} from "../common/styles";
import { getConfig } from "common/src/config";
import { explorerRoutes } from "common/src/routes";
import { createIpfsImageUrl } from "common/src/ipfs";
import { ProjectBanner } from "../common/ProjectBanner";
import { useCartStorage } from "../../store";
// TODO: expose item types from grants-stack-data-client
import { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";
import { ApplicationStatus, CartProject } from "../api/types";
import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { getAddress } from "viem";
import { useMemo } from "react";
import { useRandomSeed } from "../../hooks/useRandomSeed";
import PlusIcon from "@heroicons/react/20/solid/PlusIcon";
import { LoadingRing } from "../common/Spinner";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import { argv0 } from "process";

const PAGE_SIZE = 50;

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

function createCartProjectFromApplication(
  application: ApplicationSummary
): CartProject {
  return {
    projectRegistryId: application.projectId,
    roundId: application.roundId,
    chainId: application.chainId,
    grantApplicationId: createCompositeRoundApplicationId(application),
    // TODO: add recipient when it is available
    recipient: "0x0000000000000000000000",
    grantApplicationFormAnswers: [],
    status: ApplicationStatus.APPROVED,
    applicationIndex: Number(application.roundApplicationId),
    projectMetadata: {
      title: application.name,
      description: application.summaryText,
      bannerImg: application.bannerImageCid,
      logoImg: application.logoImageCid,
    } as CartProject["projectMetadata"],
    amount: "",
  };
}

function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl my-3 overflow-hidden p-4 pb-10">
      <Skeleton height="110px" />
      <SkeletonCircle size="48px" mt="-24px" ml="10px" />
      <SkeletonText mt="3" noOfLines={1} spacing="4" skeletonHeight="7" />
      <SkeletonText mt="10" noOfLines={4} spacing="4" skeletonHeight="2" />
    </div>
  );
}

function ProjectCard(props: {
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
        href={explorerRoutes.applicationPath(
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

function createCompositeRoundApplicationId(application: ApplicationSummary) {
  return `${application.roundId}-${application.roundApplicationId}`;
}

const ProjectsPage = () => {
  const seed = useRandomSeed(window.sessionStorage);

  const {
    data: pages,
    isLoading,
    size: currentPage,
    setSize: setCurrentPage,
  } = useSWRInfinite(
    (pageIndex) => [pageIndex, seed, "/applications"],
    ([pageIndex]) => {
      const config = getConfig();

      const grantsStackDataClient = new GrantsStackDataClient({
        baseUrl: config.grantsStackDataClient.baseUrl,
        applications: {
          pagination: {
            pageSize: PAGE_SIZE,
          },
        },
      });

      return grantsStackDataClient.query({
        type: "applications-paginated",
        page: pageIndex,
        shuffle: {
          seed,
        },
      });
    }
  );

  const isLoadingMore =
    isLoading ||
    (currentPage > 0 &&
      pages !== undefined &&
      typeof pages[currentPage - 1] === "undefined");

  const totalApplicationCount =
    pages === undefined || pages.length === 0
      ? 0
      : pages[0].pagination.totalItems;

  const hasMore = useMemo(() => {
    if (pages === undefined) {
      return false;
    }

    const totalItemsLoaded = pages.reduce(
      (acc, page) => acc + page.applications.length,
      0
    );

    return totalItemsLoaded < totalApplicationCount;
  }, [pages, totalApplicationCount]);

  const { projects, add, remove } = useCartStorage();

  const applicationIdsInCart = useMemo(() => {
    return new Set(projects.map((project) => project.grantApplicationId));
  }, [projects]);

  function addApplicationToCart(application: ApplicationSummary) {
    const cartProject = createCartProjectFromApplication(application);
    add(cartProject);
  }

  function removeApplicationFromCart(application: ApplicationSummary) {
    remove(createCompositeRoundApplicationId(application));
  }

  function applicationExistsInCart(application: ApplicationSummary) {
    return applicationIdsInCart.has(
      createCompositeRoundApplicationId(application)
    );
  }

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={
          isLoading || pages === undefined
            ? "Loading..."
            : `All projects (${totalApplicationCount})`
        }
        className="flex-wrap pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4">
          {pages?.map((page) =>
            page.applications.map((application) => (
              <div key={application.applicationRef}>
                <ProjectCard
                  application={application}
                  inCart={applicationExistsInCart(application)}
                  addToCart={addApplicationToCart}
                  removeFromCart={removeApplicationFromCart}
                />
              </div>
            ))
          )}
          {isLoadingMore && (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          )}
          {isLoading === false && hasMore === true && (
            <div className="flex items-center">
              <button
                className="rounded-3xl border border-white bg-[#F3F3F5] text-md font-medium px-5 py-3 flex items-center"
                disabled={isLoadingMore}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {isLoadingMore ? (
                  <LoadingRing className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5 mr-1" />
                    <span>Load more</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default ProjectsPage;
