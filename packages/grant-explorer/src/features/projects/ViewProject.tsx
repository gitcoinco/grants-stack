import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { formatDateWithOrdinal, renderToHTML, useParams } from "common";
import React, {
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
import { Box, Skeleton, SkeletonText, Tab, Tabs } from "@chakra-ui/react";
import {
  ProjectApplicationWithRound,
  useDataLayer,
  v2Project,
} from "data-layer";
import { DefaultLayout } from "../common/DefaultLayout";
import { useProject } from "./hooks/useProject";

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

  const { data, error } = useProject(
    {
      projectId: projectId,
    },
    dataLayer
  );

  const project = data?.project;

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
        name: "Project details",
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
        name: "Stats",
        content: (
          <>
            {project ? (
              <>
                <ProjectStats project={project} />
              </>
            ) : (
              <SkeletonText />
            )}
          </>
        ),
      },
      {
        name: "Rounds",
        content: (
          <>
            <h5 className="text-2xl mt-8 mb-4 font-modern-era-medium text-blue-800">
              Active Rounds
            </h5>
            {project ? (
              <>
                <Detail text="No data" testID="project-rounds" />
              </>
            ) : (
              <SkeletonText />
            )}
          </>
        ),
      },
    ],
    [project, description]
  );

  const handleTabChange = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  return (
    <>
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
          <div className="flex-1">
            {error === undefined ? (
              <>
                <Skeleton isLoaded={Boolean(title)}>
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
    },
  } = project ?? { metadata: {} };

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
          isVerified={false}
        >
          {projectTwitter}
        </ProjectLink>
      )}
      <ProjectLink icon={CalendarIcon}>{updatedOn}</ProjectLink>
      {projectGithub !== undefined && (
        <ProjectLink
          url={`https://github.com/${projectGithub}`}
          icon={GithubIcon}
          isVerified={false}
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
  const Component = url ? "a" : "div";
  return children ? (
    <div className="flex items-center gap-2">
      <div>{createElement(icon, { className: "w-4 h-4 text-grey-400" })}</div>
      <div className="flex gap-2">
        <Component
          href={url}
          target="_blank"
          className={url && "text-blue-300 hover:underline"}
        >
          {children}
        </Component>
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

//----------------- Rounds Tab -----------------

export enum RoundDisplayType {
  Active = "active",
  Past = "past",
}

const displayHeaders = {
  [RoundDisplayType.Active]: "Active Rounds",
  [RoundDisplayType.Past]: "Past Rounds",
};

function secondsSinceEpoch(): number {
  const date = new Date();
  return Math.floor(date.getTime() / 1000);
}

export function Rounds({
  applications,
}: {
  applications: ProjectApplicationWithRound[];
}) {
  const params = useParams();

  const renderStatGroup = (
    displayType: RoundDisplayType,
    userApplications: ProjectApplicationWithRound[]
  ) => (
    <div>
      <span className="text-gitcoin-grey-500 text-[12px] font-normal">
        {displayHeaders[displayType]}
      </span>
      {userApplications.length > 0 ? (
        userApplications.map((app) => (
          <div key={app.roundId}>
            {/* <RoundListItem
                applicationData={app}
                displayType={displayType as RoundDisplayType}
                projectId={props.fullId}
              />
              <Divider className="" borderColor="#F3F3F5" /> */}
          </div>
        ))
      ) : (
        <div className="text-base text-gitcoin-grey-400 flex flex-col items-center justify-center p-10">
          <span> No Data </span>
        </div>
      )}

      {/* <Divider className="mb-8" borderColor="#E2E0E7" /> */}
    </div>
  );

  return (
    <div className="w-full mb-4">
      <div className="flex-col">
        {Object.values(RoundDisplayType).map((displayType) => (
          <div key={displayType}>
            {/* {renderStatGroup(
                displayType as RoundDisplayType,
                // when props.applications is undefined, we are still loading, when it's not undefined, we check if any of the rounds are still loading
                props.mappedApplications?.flatMap(({ app, category }) =>
                  category === displayType ? [app] : []
                ) ?? []
              )} */}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectStats({ project }: { project: v2Project }) {
  // const [allTimeStats, setAllTimeStats] = useState({
  //   allTimeReceived: 0,
  //   allTimeContributions: 0,
  //   roundsLength: 0,
  // });

  // const [details, setDetails] = useState<
  //   { round: any; stats: any }[]
  // >([]);

  return (
    <>
      <div
        className="mt-8 max-w-[53rem] m-auto w-full bg-green-50
        text-black rounded-2xl py-8 px-2 flex justify-center
        items-center gap-8 flex-wrap mb-16"
      >
        <div className="text-xl sm:text-2xl font-medium">
          Want to check out more stats?
        </div>
        <a
          href={`https://gitcoindonordata.xyz/projects/${slugify(
            project?.metadata.title ?? ""
          )}`}
          rel="noreferrer"
          target="_blank"
          className="rounded-lg px-4 py-2.5 font-mono bg-green-200
           hover:bg-green-300 text-white transition-all flex items-center justify-center gap-2"
          data-testid="share-results-footer"
        >
          <span>Project stats dashboard</span>
        </a>
      </div>
    </>
  );
}

export const slugify = (input: string): string =>
  input
    .trim() // Remove whitespace
    .replace(/\s+/g, "-") // Replace space w/ dash
    .replace(/[^a-zA-Z0-9-]/g, "") // Remove non-alphanumeric chars
    .toLowerCase();
