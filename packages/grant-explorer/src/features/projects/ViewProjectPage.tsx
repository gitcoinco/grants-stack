import { datadogLogs } from "@datadog/browser-logs";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { formatDateWithOrdinal, renderToHTML } from "common";
import React, {
  ComponentPropsWithRef,
  FunctionComponent,
  PropsWithChildren,
  createElement,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useEnsName } from "wagmi";
import DefaultLogoImage from "../../assets/default_logo.png";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as EthereumIcon } from "../../assets/icons/ethereum-icon.svg";
import { ReactComponent as GlobeIcon } from "../../assets/icons/globe-icon.svg";
import { useRoundById } from "../../context/RoundContext";
import { CartProject, GrantApplicationFormAnswer, Project } from "../api/types";
import { ProjectBanner } from "../common/ProjectBanner";
import RoundEndedBanner from "../common/RoundEndedBanner";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";
import { isDirectRound, isInfiniteDate } from "../api/utils";
import { useCartStorage } from "../../store";
import { Box, Skeleton, SkeletonText, Tab, Tabs } from "@chakra-ui/react";
import { GrantList } from "../round/KarmaGrant/GrantList";
import { useGap } from "../api/gap";
import { DefaultLayout } from "../common/DefaultLayout";
import { truncate } from "../common/utils/truncate";
import { useVerifyProject } from "./hooks/useVerifyProject";
import { ProjectStats } from "./ProjectStats";
import tw from "tailwind-styled-components";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

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

export default function ViewProjectDetails() {
  const [selectedTab, setSelectedTab] = useState(0);

  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:applicationId"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  const { chainId, roundId, applicationId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(chainId!, roundId!);

  const projectToRender = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );

  const { grants } = useGap(projectToRender?.projectRegistryId as string);

  const currentTime = new Date();
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime)
      ? false
      : round && round.roundEndTime <= currentTime);
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > currentTime);

  const { projects, add, remove } = useCartStorage();

  const isAlreadyInCart = projects.some(
    (project) => project.grantApplicationId === applicationId
  );

  /*TODO: projectToRender can be undefined, casting will hide that condition.*/
  const cartProject = projectToRender as CartProject;

  if (cartProject !== undefined) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    cartProject.roundId = roundId!;
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    cartProject.chainId = Number(chainId!);
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
            <h3 className="text-3xl mt-8 mb-4 font-medium text-black">About</h3>
            {projectToRender ? (
              <>
                <Detail text={description} testID="project-metadata" />
                <ApplicationFormAnswers
                  answers={projectToRender.grantApplicationFormAnswers}
                />
              </>
            ) : (
              <SkeletonText />
            )}
          </>
        ),
      },
      {
        name: "Grants",
        content: <GrantList grants={grants} />,
      },
    ],
    [grants, projectToRender, description]
  );

  const handleTabChange = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  return (
    <>
      <DefaultLayout>
        {isAfterRoundEndDate && <RoundEndedBanner />}
        <div className="py-8 flex items-center" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
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
            <div className="min-w-[320px] mb-6">
              <ProjectStats
                chainId={chainId}
                roundId={roundId}
                applicationId={applicationId}
              />
              {isBeforeRoundEndDate && (
                <CartButtonToggle
                  isAlreadyInCart={isAlreadyInCart}
                  addToCart={() => add(cartProject)}
                  removeFromCart={() => remove(cartProject.grantApplicationId)}
                />
              )}
            </div>
          )}
          <div className="flex-1">
            <Skeleton isLoaded={Boolean(title)}>
              <h1 className="text-4xl font-medium tracking-tight text-black">
                {title}
              </h1>
            </Skeleton>
            <ProjectLinks project={projectToRender} />
            <ProjectDetailsTabs
              selected={selectedTab}
              onChange={handleTabChange}
              tabs={projectDetailsTabs.map((tab) => tab.name)}
            />
            <div>{projectDetailsTabs[selectedTab].content}</div>
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

function ProjectLinks({ project }: { project?: Project }) {
  const {
    recipient,
    projectMetadata: {
      createdAt,
      website,
      projectTwitter,
      projectGithub,
      userGithub,
    },
  } = project ?? { projectMetadata: {} };

  // @ts-expect-error Temp until viem (could also cast recipient as Address or update the type)
  const ens = useEnsName({ address: recipient, enabled: Boolean(recipient) });

  const verified = useVerifyProject(project);

  const createdOn =
    createdAt &&
    `Created on: ${formatDateWithOrdinal(new Date(createdAt ?? 0))}`;

  return (
    <div
      className={`grid md:grid-cols-2 gap-4  border-y-[2px] py-4 my-4 ${
        // isLoading?
        createdAt ? "" : "bg-grey-100 animate-pulse"
      }`}
    >
      <ProjectLink icon={EthereumIcon}>
        {ens.data || truncate(recipient)}
      </ProjectLink>
      <ProjectLink icon={CalendarIcon}>{createdOn}</ProjectLink>
      <ProjectLink url={website} icon={GlobeIcon}>
        {website}
      </ProjectLink>
      <ProjectLink
        url={projectTwitter}
        icon={TwitterIcon}
        isVerified={verified.data?.twitter}
      >
        {projectTwitter}
      </ProjectLink>
      <ProjectLink
        url={projectGithub}
        icon={GithubIcon}
        isVerified={verified.data?.github}
      >
        {projectGithub}
      </ProjectLink>
      <ProjectLink url={userGithub} icon={GithubIcon}>
        {userGithub}
      </ProjectLink>
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
      <div>{createElement(icon, { className: "w-4 h-4 opacity-80" })}</div>
      <div className="flex gap-2">
        <Component
          href={url}
          target="_blank"
          className={url && "text-blue-200 hover:underline"}
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
    <span className="bg-teal-100 flex gap-2 rounded-full px-2 text-xs items-center font-medium text-teal-500">
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
      className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600 max-w-full"
      data-testid={props.testID}
    />
  );
}

function ApplicationFormAnswers(props: {
  answers: GrantApplicationFormAnswer[];
}) {
  // only show answers that are not empty and are not marked as hidden
  const answers = props.answers.filter((a) => !!a.answer && !a.hidden);

  if (answers.length === 0) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl mt-8 font-thin text-black">
        Additional Information
      </h1>
      <div>
        {answers.map((answer) => {
          const answerText = Array.isArray(answer.answer)
            ? answer.answer.join(", ")
            : answer.answer;
          return (
            <div key={answer.questionId}>
              <p className="text-md mt-8 mb-3 font-semibold text-black">
                {answer.question}
              </p>
              {answer.type === "paragraph" ? (
                <p
                  dangerouslySetInnerHTML={{
                    __html: renderToHTML(answerText.replace(/\n/g, "\n\n")),
                  }}
                  className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
                ></p>
              ) : (
                <p className="text-base text-black">
                  {answerText.replace(/\n/g, "<br/>")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ipfsGateway = process.env.REACT_APP_PINATA_GATEWAY;
function ProjectLogo({ logoImg }: { logoImg?: string }) {
  const src = logoImg
    ? `https://${ipfsGateway}/ipfs/${logoImg}`
    : DefaultLogoImage;

  return (
    <img
      className={"-mt-16 h-32 w-32 rounded-full ring-4 ring-white bg-white"}
      src={src}
      alt="Project Logo"
    />
  );
}

const CartButton = tw.button<{ variant?: "danger" | "default" }>`
border
w-full
items-center
justify-center
rounded-full
px-4
py-2
font-medium
inline-flex
gap-2
${(props) =>
  props.variant === "danger"
    ? `border-red-200 hover:bg-red-50`
    : `border-blue-200 hover:bg-blue-50`}
`;
function CartButtonToggle(props: {
  isAlreadyInCart: boolean;
  addToCart: () => void;
  removeFromCart: () => void;
}) {
  return (
    <CartButton
      data-testid={props.isAlreadyInCart ? "remove-from-cart" : "add-to-cart"}
      variant={props.isAlreadyInCart ? "danger" : "default"}
      onClick={() =>
        props.isAlreadyInCart ? props.removeFromCart() : props.addToCart()
      }
    >
      <ShoppingCartIcon className="w-4 h-4" />
      {props.isAlreadyInCart ? "Remove from cart" : "Add to cart"}
    </CartButton>
  );
}
