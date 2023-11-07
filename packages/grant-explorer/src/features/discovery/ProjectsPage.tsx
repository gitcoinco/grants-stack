import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import { GrantsStackDataClient } from "grants-stack-data-client";
import useSWR from "swr";
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
import { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";
import { ApplicationStatus, CartProject } from "../api/types";
import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { getAddress } from "viem";
import { useMemo } from "react";
import { useRandomSeed } from "../../hooks/useRandomSeed";

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
        // TODO: url helper
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

function createCartProject(application: ApplicationSummary): CartProject {
  return {
    projectRegistryId: application.projectId,
    roundId: application.roundId,
    chainId: application.chainId,
    grantApplicationId: createGrantApplicationId(application),
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

function createGrantApplicationId(application: ApplicationSummary) {
  return `${application.roundId}-${application.roundApplicationId}`;
}

const ProjectsPage = () => {
  const seed = useRandomSeed(window.sessionStorage);
  const { projects, add, remove } = useCartStorage();

  const { data: applications, isLoading } = useSWR(
    ["/applications", seed],
    () => {
      const config = getConfig();

      const grantsStackDataClient = new GrantsStackDataClient({
        baseUrl: config.grantsStackDataClient.baseUrl,
        applications: {
          pagination: {
            pageSize: 50,
          },
        },
      });

      return grantsStackDataClient.query({
        type: "applications-paginated",
        page: 0,
        shuffle: {
          seed,
        },
      });
    }
  );

  const applicationIdsInCart = useMemo(() => {
    return new Set(projects.map((project) => project.grantApplicationId));
  }, [projects]);

  function addApplicationToCart(application: ApplicationSummary) {
    const cartProject = createCartProject(application);
    add(cartProject);
  }

  function removeApplicationFromCart(application: ApplicationSummary) {
    remove(createGrantApplicationId(application));
  }

  function applicationExistsInCart(application: ApplicationSummary) {
    return applicationIdsInCart.has(createGrantApplicationId(application));
  }

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={
          isLoading || applications === undefined
            ? "Loading..."
            : `All projects (${applications.applications.length})`
        }
        className="flex-wrap pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4">
          {applications?.applications.map((application) => (
            <div key={application.applicationRef}>
              <ProjectCard
                application={application}
                inCart={applicationExistsInCart(application)}
                addToCart={addApplicationToCart}
                removeFromCart={removeApplicationFromCart}
              />
            </div>
          ))}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default ProjectsPage;
