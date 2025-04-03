import { datadogLogs } from "@datadog/browser-logs";
import { getAlloVersion } from "common/src/config";
import React, { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useRoundById } from "../../../context/RoundContext";
import { CartProject } from "../../api/types";
import { ProjectBanner } from "../../common/ProjectBanner";
import RoundEndedBanner from "../../common/RoundEndedBanner";
import Breadcrumb, { BreadcrumbItem } from "../../common/Breadcrumb";
import { isDirectRound, isInfiniteDate } from "../../api/utils";
import { useCartStorage } from "../../../store";
import { Skeleton, SkeletonText } from "@chakra-ui/react";
import { GrantList } from "../KarmaGrant/GrantList";
import { ImpactList } from "../KarmaGrant/ImpactList";
import { useGap } from "../../api/gap";
import { StatList } from "../OSO/ImpactStats";
import { useOSO } from "../../api/oso";
import { useDataLayer } from "data-layer";
import { DefaultLayout } from "../../common/DefaultLayout";
import {
  mapApplicationToProject,
  mapApplicationToRound,
  useApplication,
} from "../../projects/hooks/useApplication";
import { PassportWidget } from "../../common/PassportWidget";
import { useProjectDetailsParams } from "./hooks/useProjectDetailsParams";
import {
  ApplicationFormAnswers,
  Detail,
  ProjectDetailsTabs,
  ProjectLinks,
  Sidebar,
  ProjectLogo,
  StakingBannerAndModal,
} from "./components";
import { useGetApplicationStakes } from "./hooks/useGetApplicationStakes";
import { useIsStakable } from "./components/StakingBannerAndModal/hooks/useIsStakable";
export default function ViewProjectDetails() {
  const [selectedTab, setSelectedTab] = useState(0);

  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:applicationId"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  const {
    chainId,
    roundId,
    applicationId: paramApplicationId,
  } = useProjectDetailsParams();
  const dataLayer = useDataLayer();
  const { address: walletAddress } = useAccount();

  let applicationId: string;

  /// handle URLs where the application ID is ${roundId}-${applicationId}
  if (paramApplicationId.includes("-")) {
    applicationId = paramApplicationId.split("-")[1];
  } else {
    applicationId = paramApplicationId;
  }

  const isStakableRound = useIsStakable({
    chainId: Number(chainId),
    roundId,
  });

  const {
    data: application,
    error,
    isLoading,
  } = useApplication(
    {
      chainId: Number(chainId as string),
      roundId,
      applicationId: applicationId,
    },
    dataLayer
  );
  const { data: totalStaked } = useGetApplicationStakes(
    Number(chainId),
    Number(roundId),
    application?.anchorAddress ?? "",
    isStakableRound
  );

  const { round: roundDetails } = useRoundById(Number(chainId), roundId);

  const projectToRender = application && mapApplicationToProject(application);
  const round = application && mapApplicationToRound(application);

  round && (round.chainId = Number(chainId));
  const isSybilDefenseEnabled =
    round?.roundMetadata?.quadraticFundingConfig?.sybilDefense === true ||
    round?.roundMetadata?.quadraticFundingConfig?.sybilDefense !== "none";

  const { grants, impacts } = useGap(
    projectToRender?.projectRegistryId as string
  );
  const { stats } = useOSO(
    projectToRender?.projectMetadata.projectGithub as string
  );

  const currentTime = new Date();
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime)
      ? false
      : round && round.roundEndTime <= currentTime);

  const isBeforeRoundStartDate =
    round &&
    (isInfiniteDate(round.roundStartTime)
      ? false
      : round && currentTime < round.roundStartTime);

  const alloVersion = getAlloVersion();

  useEffect(() => {
    if (
      isAfterRoundEndDate !== undefined &&
      roundId?.startsWith("0x") &&
      alloVersion === "allo-v2" &&
      !isAfterRoundEndDate
    ) {
      window.location.href = `https://explorer-v1.gitcoin.co${window.location.pathname}${window.location.hash}`;
    }
  }, [roundId, alloVersion, isAfterRoundEndDate]);

  const disableAddToCartButton =
    (alloVersion === "allo-v2" && roundId.startsWith("0x")) ||
    isAfterRoundEndDate ||
    isBeforeRoundStartDate;
  const { projects, add, remove } = useCartStorage();

  const isAlreadyInCart = projects.some(
    (project) =>
      project.grantApplicationId === applicationId &&
      project.chainId === Number(chainId) &&
      project.roundId === roundId
  );
  const cartProject = projectToRender as CartProject;

  if (cartProject !== undefined) {
    cartProject.roundId = roundId;
    cartProject.chainId = Number(chainId);
    cartProject.grantApplicationId = applicationId;
  }

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: round?.roundMetadata?.name,
      path: `/round/${chainId}/${roundId}`,
    },
    {
      name: "Project Details",
      path: `/round/${chainId}/${roundId}/${applicationId}`,
    },
  ] as BreadcrumbItem[];

  const {
    projectMetadata: { title, description = "", bannerImg },
  } = projectToRender ?? { projectMetadata: {} };
  const projectDetailsTabs = useMemo(
    () => [
      {
        name: "Project details",
        content: (
          <>
            <h3 className="text-3xl mt-8 mb-4 font-modern-era-medium text-blue-800">
              About
            </h3>
            {projectToRender ? (
              <>
                <Detail text={description} testID="project-metadata" />
                <ApplicationFormAnswers
                  answers={projectToRender.grantApplicationFormAnswers}
                  round={roundDetails}
                />
              </>
            ) : (
              <SkeletonText />
            )}
          </>
        ),
      },
      {
        name: "Impact Measurement",
        content: (
          <React.Fragment>
            <StatList stats={stats} />
            <GrantList
              grants={grants}
              displayKarmaAttribution={
                grants.length > 0 && impacts.length === 0
              }
            />
            <ImpactList
              impacts={impacts}
              displayKarmaAttribution={impacts.length > 0}
            />
          </React.Fragment>
        ),
      },
    ],
    [stats, grants, projectToRender, description, impacts, roundDetails]
  );

  const handleTabChange = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  return (
    <>
      <DefaultLayout>
        {isAfterRoundEndDate && (
          <div className="relative top-6">
            <RoundEndedBanner />
          </div>
        )}
        <div className="flex flex-row justify-between my-8">
          <div className="flex items-center pt-2" data-testid="bread-crumbs">
            <Breadcrumb items={breadCrumbs} />
          </div>
          {walletAddress && round && isSybilDefenseEnabled && (
            <div data-testid="passport-widget">
              <PassportWidget round={round} alignment="right" />
            </div>
          )}
        </div>
        <div className="mb-4 relative">
          <ProjectBanner
            bannerImgCid={bannerImg ?? null}
            classNameOverride="h-32 w-full object-cover lg:h-80 rounded md:rounded-3xl"
            resizeHeight={320}
          />
          {totalStaked && Number(totalStaked) > 0 && (
            <StakedAmountCard totalStaked={Number(totalStaked)} />
          )}
          <div className="pl-4 sm:pl-6 lg:pl-8">
            <div className="sm:flex sm:items-end sm:space-x-5">
              <div className="flex">
                <ProjectLogo {...projectToRender?.projectMetadata} />
              </div>
            </div>
          </div>
        </div>
        <div className="md:flex gap-4 flex-row-reverse">
          {round && !isDirectRound(round) && (
            <Sidebar
              isAlreadyInCart={isAlreadyInCart}
              isBeforeRoundEndDate={!disableAddToCartButton}
              removeFromCart={() => {
                remove(cartProject);
              }}
              addToCart={() => {
                add(cartProject);
              }}
            />
          )}
          <div className="flex-1">
            {error === undefined &&
            !isLoading &&
            projectToRender !== undefined ? (
              <>
                <Skeleton isLoaded={Boolean(title)}>
                  <h1 className="text-4xl font-modern-era-medium tracking-tight text-grey-500">
                    {title}
                  </h1>
                </Skeleton>
                <ProjectLinks project={projectToRender} />
                <StakingBannerAndModal />
                <ProjectDetailsTabs
                  selected={selectedTab}
                  onChange={handleTabChange}
                  tabs={projectDetailsTabs.map((tab) => tab.name)}
                />
                <div className="[&_a]:underline">
                  {projectDetailsTabs[selectedTab].content}
                </div>
              </>
            ) : (
              <p>Couldn't load project data. It may not exist.</p>
            )}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}

const StakedAmountCard = ({ totalStaked }: { totalStaked: number }) => {
  return (
    <div className="p-2 bg-white/80 rounded-2xl backdrop-blur-sm inline-flex justify-start items-center gap-2 absolute top-4 right-4">
      <div data-svg-wrapper className="relative">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.8334 8.33333V2.5L3.33337 11.6667H9.16671L9.16671 17.5L16.6667 8.33333L10.8334 8.33333Z"
            stroke="#7D67EB"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div className="inline-flex flex-col justify-start items-start">
        <div className="self-stretch inline-flex justify-start items-center gap-1">
          <div className="justify-start text-text-primary text-lg font-medium font-['DM_Mono'] leading-normal">
            {totalStaked}
          </div>
          <div className="justify-start text-text-primary text-lg font-medium font-['DM_Mono'] leading-normal">
            GTC
          </div>
        </div>
        <div className="self-stretch justify-start text-text-primary text-sm font-normal font-['DM_Mono'] leading-[14px]">
          Total staked
        </div>
      </div>
    </div>
  );
};
