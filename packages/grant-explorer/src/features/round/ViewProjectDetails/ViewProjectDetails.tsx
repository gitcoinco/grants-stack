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
import CopyToClipboard from "common/src/components/CopyToClipboard";
import { PassportWidget } from "../../common/PassportWidget";

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 0C3.44772 0 3 0.447715 3 1V2H2C0.895431 2 0 2.89543 0 4V14C0 15.1046 0.895431 16 2 16H14C15.1046 16 16 15.1046 16 14V4C16 2.89543 15.1046 2 14 2H13V1C13 0.447715 12.5523 0 12 0C11.4477 0 11 0.447715 11 1V2H5V1C5 0.447715 4.55228 0 4 0ZM4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H12C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5H4Z"
        fill="currentColor"
      />
    </svg>
  );
};

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
        <div className="mb-4">
          <ProjectBanner
            bannerImgCid={bannerImg ?? null}
            classNameOverride="h-32 w-full object-cover lg:h-80 rounded md:rounded-3xl"
            resizeHeight={320}
          />
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
