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
import { ProjectBanner } from "../common/ProjectBanner";
import { useCartStorage } from "../../store";
import { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";
import { ApplicationStatus, CartProject } from "../api/types";
import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";

// TODO: configure in common with env var
const grantsStackDataClient = new GrantsStackDataClient({
  baseUrl: "https://gitcoin-search-dev.fly.dev",
});

// TODO: create generic IPFS image component that can be styled
function ProjectLogo(props: {
  className?: string;
  logoImageCid: string | null;
  size: number;
}) {
  const projectBannerImageUrl = props.logoImageCid
    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${
        props.logoImageCid
      }?img-height=${props.size * 2}`
    : "";

  return (
    <div>
      <img
        className={`object-cover rounded-full ${props.className ?? ""}`}
        style={{ height: props.size, width: props.size }}
        src={projectBannerImageUrl}
        alt="Project Banner"
      />
    </div>
  );
}

const ProjectsPage = () => {
  const { data: applications } = useSWR(["/applications"], () => {
    return grantsStackDataClient.query({
      type: "applications-paginated",
      page: 0,
    });
  });

  const { projects, add, remove } = useCartStorage();

  function addApplicationToCart(application: ApplicationSummary) {
    const cartProject: CartProject = {
      projectRegistryId: application.applicationRef,
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

    add(cartProject);
  }

  function removeApplicationFromCart(application: ApplicationSummary) {
    remove(createGrantApplicationId(application));
  }

  const createGrantApplicationId = (application: ApplicationSummary) =>
    `${application.roundId}-${application.roundApplicationId}`;

  const applicationIdsInCart = new Set(
    projects.map((project) => project.grantApplicationId)
  );

  function applicationExistsInCart(application: ApplicationSummary) {
    return applicationIdsInCart.has(createGrantApplicationId(application));
  }

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={
          applications
            ? `All projects (${applications.applications.length})`
            : "Loading..."
        }
        className="flex-wrap pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4">
          {applications?.applications.map((application) => (
            <div key={application.applicationRef}>
              <BasicCard className="w-full hover:opacity-90 transition hover:shadow-none">
                <a
                  target="_blank"
                  // TODO: url helper
                  href={`/#/round/${
                    application.chainId
                  }/${application.roundId.toLowerCase()}/${application.roundId.toLowerCase()}-${
                    application.roundApplicationId
                  }`}
                >
                  <CardHeader
                    className="relative"
                    style={{ backgroundImage: "http://placehold.it/300x300" }}
                  >
                    <ProjectBanner
                      bannerImgCid={application.bannerImageCid}
                      classNameOverride={
                        "bg-black h-[120px] w-full object-cover rounded-t"
                      }
                      resizeHeight={120}
                    />
                  </CardHeader>
                  <CardContent className="relative">
                    <ProjectLogo
                      className="border-solid border-2 border-white absolute -top-[24px] "
                      logoImageCid={application.logoImageCid}
                      size={48}
                    />
                    <div>{application.name}</div>
                    <CardDescription className="min-h-[96px]">
                      <div className="text-sm">{application.summaryText}</div>
                    </CardDescription>

                    <Badge color={"grey"} rounded="3xl">
                      {"Round name goes here"}
                    </Badge>
                  </CardContent>
                </a>
                <div className="p-2">
                  <div className="border-t pt-2 flex justify-end">
                    {applicationExistsInCart(application) ? (
                      <button
                        onClick={() => removeApplicationFromCart(application)}
                      >
                        <CheckedCircleIcon className="w-10" />
                      </button>
                    ) : (
                      <button onClick={() => addApplicationToCart(application)}>
                        <CartCircleIcon className="w-10" />
                      </button>
                    )}
                  </div>
                </div>
              </BasicCard>
            </div>
          ))}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default ProjectsPage;
