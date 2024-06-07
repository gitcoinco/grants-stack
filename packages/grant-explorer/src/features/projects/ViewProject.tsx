import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import {
  formatDateWithOrdinal,
  renderToHTML,
  useParams,
  useValidateCredential,
} from "common";
import React, {
  ComponentProps,
  ComponentPropsWithRef,
  createElement,
  FunctionComponent,
  PropsWithChildren,
  useMemo,
  useState,
} from "react";
import DefaultLogoImage from "../../assets/default_logo.png";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as GlobeIcon } from "../../assets/icons/globe-icon.svg";
import { ProjectBanner } from "../common/ProjectBanner";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";
import {
  Box,
  Skeleton,
  SkeletonText,
  Tab,
  Tabs,
  Spinner,
} from "@chakra-ui/react";
import {
  ProjectApplicationWithRoundAndProgram,
  useDataLayer,
  v2Project,
} from "data-layer";
import { DefaultLayout } from "../common/DefaultLayout";
import { useProject, useProjectApplications } from "./hooks/useProject";
import NotFoundPage from "../common/NotFoundPage";

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

export default function ViewProject() {
  const [selectedTab, setSelectedTab] = useState(0);

  const { projectId } = useParams();

  const dataLayer = useDataLayer();

  const {
    data: projectData,
    error: projectError,
    isLoading: isProjectDataLoading,
  } = useProject(
    {
      projectId: projectId,
    },
    dataLayer
  );

  const {
    data: projectApplications,
    error: projectApplicationsError,
    isLoading: isProjectApplicationsLoading,
  } = useProjectApplications(
    {
      projectId: projectId,
    },
    dataLayer
  );

  console.log("projectApplications", projectApplications);
  console.log("projectApplicationsError", projectApplicationsError);
  console.log("isProjectApplicationsLoading", isProjectApplicationsLoading);

  const project = projectData?.project;

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Projects",
      path: `/projects/`,
    },
    {
      name: project?.metadata.title,
      path: `/projects/${projectId}`,
    },
  ] as BreadcrumbItem[];

  const {
    metadata: { title, description = "", bannerImg },
  } = project ?? { metadata: {} };
  const projectDetailsTabs = useMemo(
    () => [
      {
        name: "Overview",
        content: (
          <>
            <h3 className="text-3xl mt-8 mb-4 font-modern-era-medium text-blue-800">
              About
            </h3>
            {project ? (
              <>
                <Detail text={description} testID="project-metadata" />
              </>
            ) : (
              <SkeletonText />
            )}
          </>
        ),
      },
      {
        name: "Past rounds",
        content: (
          <>
            {projectApplications ? (
              <>
                <Round projectApplication={projectApplications[0]} />
              </>
            ) : (
              <SkeletonText />
            )}
          </>
        ),
      },
    ],
    [project, description, projectApplications]
  );

  const handleTabChange = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  return (
    <>
      {projectData !== undefined || isProjectDataLoading ? (
        <DefaultLayout>
          <div className="flex flex-row justify-between my-8">
            <div className="flex items-center pt-2" data-testid="bread-crumbs">
              <Breadcrumb items={breadCrumbs} />
            </div>
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
                  <ProjectLogo {...project?.metadata} />
                </div>
              </div>
            </div>
          </div>
          <div className="md:flex gap-4 flex-row-reverse">
            <Sidebar />
            <div className="flex-1">
              {projectError === undefined ? (
                <>
                  <Skeleton
                    isLoaded={
                      projectData !== undefined && projectError === undefined
                    }
                  >
                    <h1 className="text-4xl font-modern-era-medium tracking-tight text-grey-500">
                      {title}
                    </h1>
                  </Skeleton>
                  <ProjectLinks project={project} />
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
                <p>Couldn't load project data.</p>
              )}
            </div>
          </div>
        </DefaultLayout>
      ) : (
        <NotFoundPage />
      )}
    </>
  );
}

function ProjectDetailsTabs(props: {
  tabs: string[];
  onChange?: (tabIndex: number) => void;
  selected: number;
}) {
  return (
    <Box className="" bottom={0.5}>
      {props.tabs.length > 0 && (
        <Tabs
          display="flex"
          onChange={props.onChange}
          defaultIndex={props.selected}
        >
          {props.tabs.map((tab, index) => (
            <Tab key={index}>{tab}</Tab>
          ))}
        </Tabs>
      )}
    </Box>
  );
}

function ProjectLinks({ project }: { project?: v2Project }) {
  const {
    metadata: {
      createdAt,
      updatedAt,
      website,
      projectTwitter,
      projectGithub,
      userGithub,
      credentials,
    },
  } = project ?? { metadata: {} };

  const { isValid: validTwitterCredential } = useValidateCredential(
    credentials?.twitter,
    projectTwitter
  );

  const { isValid: validGithubCredential } = useValidateCredential(
    credentials?.github,
    projectGithub
  );

  const createdOn =
    createdAt &&
    `Created on: ${formatDateWithOrdinal(new Date(createdAt ?? 0))}`;

  const updatedOn =
    updatedAt &&
    `Last edited: ${formatDateWithOrdinal(new Date(updatedAt ?? 0))}`;

  return (
    <div
      className={`grid md:grid-cols-2 gap-4  border-y-[2px] py-4 my-4 ${
        // isLoading?
        createdAt ? "" : "bg-grey-100 animate-pulse"
      }`}
    >
      <ProjectLink url={website} icon={GlobeIcon}>
        {website}
      </ProjectLink>
      <ProjectLink icon={CalendarIcon}>{createdOn}</ProjectLink>
      {projectTwitter !== undefined && (
        <ProjectLink
          url={`https://twitter.com/${projectTwitter}`}
          icon={TwitterIcon}
          isVerified={validTwitterCredential}
        >
          {projectTwitter}
        </ProjectLink>
      )}
      <ProjectLink icon={CalendarIcon}>{updatedOn}</ProjectLink>
      {projectGithub !== undefined && (
        <ProjectLink
          url={`https://github.com/${projectGithub}`}
          icon={GithubIcon}
          isVerified={validGithubCredential}
        >
          {projectGithub}
        </ProjectLink>
      )}
      {userGithub !== undefined && (
        <ProjectLink url={`https://github.com/${userGithub}`} icon={GithubIcon}>
          {userGithub}
        </ProjectLink>
      )}
    </div>
  );
}

function ProjectLink({
  icon,
  children,
  url,
  isVerified,
}: PropsWithChildren<{
  icon: FunctionComponent<ComponentPropsWithRef<"svg">>;
  url?: string;
  isVerified?: boolean;
}>) {
  return children ? (
    <div className="flex items-center gap-2">
      <div>{createElement(icon, { className: "w-4 h-4 text-grey-400" })}</div>
      <div className="flex gap-2">
        {url ? (
          <a
            href={url}
            target="_blank"
            className="text-blue-300 hover:underline"
          >
            {children}
          </a>
        ) : (
          <div className="text-blue-300 hover:underline">{children}</div>
        )}
        {isVerified && <VerifiedBadge />}
      </div>
    </div>
  ) : null;
}

function VerifiedBadge() {
  return (
    <span className="bg-teal-100 flex gap-2 rounded-full px-2 text-xs items-center font-modern-era-medium text-teal-500">
      <ShieldCheckIcon className="w-4 h-4" />
      Verified
    </span>
  );
}

function Detail(props: { text: string; testID: string }) {
  return (
    <p
      dangerouslySetInnerHTML={{
        __html: renderToHTML(props.text.replace(/\n/g, "\n\n")),
      }}
      className="text-blue-800 text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600 max-w-full"
      data-testid={props.testID}
    />
  );
}

const ipfsGateway = process.env.REACT_APP_IPFS_BASE_URL;

function ProjectLogo({ logoImg }: { logoImg?: string }) {
  const src = logoImg ? `${ipfsGateway}/ipfs/${logoImg}` : DefaultLogoImage;

  return (
    <img
      className={"-mt-16 h-32 w-32 rounded-full ring-4 ring-white bg-white"}
      src={src}
      alt="Project Logo"
    />
  );
}

function Sidebar() {
  return (
    <div className="min-w-[320px] h-fit mb-6 rounded-3xl bg-gray-50">
      <ProjectStats />
    </div>
  );
}

export function ProjectStats() {
  const totalFundingReceived = 120;
  const totalMatchingAmountReceived = 300;
  const totalContributions = 14;
  const totalUniqueDonors = 10;
  const totalRoundsParticipated = 1;

  return (
    <div className="rounded-3xl flex-auto p-3 md:p-4 gap-4 flex flex-col text-blue-800">
      <h4 className="text-2xl">All-time stats</h4>
      <Stat isLoading={false} value={`$${totalFundingReceived}`}>
        funding received
      </Stat>
      <Stat isLoading={false} value={`$${totalMatchingAmountReceived}`}>
        matching funds received
      </Stat>
      <Stat isLoading={false} value={totalContributions}>
        contributions
      </Stat>
      <Stat isLoading={false} value={totalUniqueDonors}>
        unique contributors
      </Stat>
      <Stat isLoading={false} value={totalRoundsParticipated}>
        rounds participated
      </Stat>
    </div>
  );
}

export function Stat({
  value,
  children,
  isLoading,
  className,
}: {
  value?: string | number | null;
  isLoading?: boolean;
} & ComponentProps<"div">) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Skeleton isLoaded={!isLoading} height={"36px"}>
        <h4 className="text-3xl">{value}</h4>
      </Skeleton>
      <span className="text-sm md:text-base">{children}</span>
    </div>
  );
}

export function Round({
  projectApplication,
}: {
  projectApplication: ProjectApplicationWithRoundAndProgram;
}) {
  return (
    <Box>
      <Box className="w-full my-8 lg:flex md:flex basis-0 justify-between items-center text-[14px] text-gitcoin-grey-400">
        <Box className="flex-1 my-2">
          <span>{projectApplication.round.project.name}</span>
        </Box>
        <Box className="flex-1 my-2">
          <span>{projectApplication.round.roundMetadata.name}</span>
        </Box>
        <Box className="flex-1 my-2">
          <span>Jan 9, 2024 - Jan 31, 2024</span>
        </Box>
        <Box className="flex-1 my-2">
          <span>Quadratic funding</span>
        </Box>
      </Box>
    </Box>
  );
}
