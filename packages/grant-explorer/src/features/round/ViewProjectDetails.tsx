import { datadogLogs } from "@datadog/browser-logs";
import {
  VerifiableCredential,
  PROVIDER_ID,
} from "@gitcoinco/passport-sdk-types";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { Client } from "allo-indexer-client";
import { formatDateWithOrdinal, renderToHTML } from "common";
import { formatDistanceToNowStrict } from "date-fns";
import React, {
  ComponentProps,
  ComponentPropsWithRef,
  FunctionComponent,
  PropsWithChildren,
  createElement,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
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
import { getAddress } from "viem";
import { Box, Skeleton, SkeletonText, Tab, Tabs } from "@chakra-ui/react";
import { GrantList } from "./KarmaGrant/GrantList";
import { useGap } from "../api/gap";
import { DefaultLayout } from "../common/DefaultLayout";
import { truncate } from "../common/utils/truncate";
import tw from "tailwind-styled-components";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { DataLayer, useDataLayer } from "data-layer";

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

enum VerifiedCredentialState {
  VALID,
  INVALID,
  PENDING,
}

const boundFetch = fetch.bind(window);

export const IAM_SERVER =
  "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

export default function ViewProjectDetails() {
  const [selectedTab, setSelectedTab] = useState(0);

  datadogLogs.logger.info(
    "====> Route: /round/:chainId/:roundId/:applicationId"
  );
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);
  const { chainId, roundId, applicationId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(Number(chainId), roundId!);

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
            <Sidebar
              isAlreadyInCart={isAlreadyInCart}
              isBeforeRoundEndDate={isBeforeRoundEndDate}
              removeFromCart={() => {
                remove(cartProject.grantApplicationId);
              }}
              addToCart={() => {
                add(cartProject);
              }}
            />
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
          // className="text-blue-300"
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

function useVerifyProject(project?: Project) {
  const { credentials = {} } = project?.projectMetadata ?? {};
  const dataLayer = useDataLayer();

  // Return data as { twitter?: boolean, ... }
  return useSWR<{ [K in Lowercase<PROVIDER_ID>]?: boolean }>(credentials, () =>
    Promise.all(
      // Check verifications for all credentials in project metadata
      Object.entries(credentials).map(async ([provider, credential]) => ({
        provider,
        verified: await isVerified({
          dataLayer,
          verifiableCredential: credential,
          provider,
          project,
        }),
      }))
    ).then((verifications) =>
      // Convert to object ({ [provider]: isVerified })
      verifications.reduce(
        (acc, x) => ({
          ...acc,
          [x.provider]: x.verified === VerifiedCredentialState.VALID,
        }),
        {}
      )
    )
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
      <div>{createElement(icon, { className: "w-4 h-4 text-grey-400" })}</div>
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

function Sidebar(props: {
  isAlreadyInCart: boolean;
  isBeforeRoundEndDate?: boolean;
  removeFromCart: () => void;
  addToCart: () => void;
}) {
  return (
    <div className="min-w-[320px] mb-6">
      <ProjectStats />
      {props.isBeforeRoundEndDate && (
        <CartButtonToggle
          isAlreadyInCart={props.isAlreadyInCart}
          addToCart={props.addToCart}
          removeFromCart={props.removeFromCart}
        />
      )}
    </div>
  );
}

// NOTE: Consider moving this
export function useRoundApprovedApplication(
  chainId: number,
  roundId: string,
  projectId: string
) {
  // use chain id and project id from url params
  const client = new Client(
    boundFetch,
    process.env.REACT_APP_ALLO_API_URL ?? "",
    chainId
  );

  return useSWR([roundId, "/projects"], async ([roundId]) => {
    const applications = await client.getRoundApplications(
      getAddress(roundId.toLowerCase())
    );

    return applications.find(
      (app) => app.projectId === projectId && app.status === "APPROVED"
    );
  });
}

export function ProjectStats() {
  const { chainId, roundId, applicationId } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(Number(chainId), roundId!);

  const projectToRender = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );

  const { data: application } = useRoundApprovedApplication(
    Number(chainId),
    roundId as string,
    projectToRender?.projectRegistryId as string
  );

  const timeRemaining =
    round?.roundEndTime && !isInfiniteDate(round?.roundEndTime)
      ? formatDistanceToNowStrict(round.roundEndTime)
      : null;
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > new Date());

  return (
    <div
      className={
        "rounded-3xl bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      }
    >
      <Stat
        isLoading={!application}
        value={`$${application?.amountUSD.toFixed(2)}`}
      >
        funding received in current round
      </Stat>
      <Stat isLoading={!application} value={application?.uniqueContributors}>
        contributors
      </Stat>

      <Stat
        isLoading={isBeforeRoundEndDate === undefined}
        value={timeRemaining}
        className={
          // Explicitly check for true - could be undefined if round hasn't been loaded yet
          isBeforeRoundEndDate === true || isBeforeRoundEndDate === undefined
            ? ""
            : "flex-col-reverse"
        }
      >
        {
          // If loading - render empty
          isBeforeRoundEndDate === undefined
            ? ""
            : isBeforeRoundEndDate
            ? "to go"
            : "Round ended"
        }
      </Stat>
    </div>
  );
}

function Stat({
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

function vcProviderMatchesProject(
  provider: string,
  verifiableCredential: VerifiableCredential,
  project: Project | undefined
) {
  let vcProviderMatchesProject = false;
  if (provider === "twitter") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() ===
      project?.projectMetadata.projectTwitter?.toLowerCase();
  } else if (provider === "github") {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split("#")[1]
        .toLowerCase() ===
      project?.projectMetadata.projectGithub?.toLowerCase();
  }
  return vcProviderMatchesProject;
}

function vcIssuedToAddress(vc: VerifiableCredential, address: string) {
  const vcIdSplit = vc.credentialSubject.id.split(":");
  const addressFromId = vcIdSplit[vcIdSplit.length - 1];
  return addressFromId === address;
}

async function isVerified(args: {
  verifiableCredential: VerifiableCredential;
  provider: string;
  project: Project | undefined;
  dataLayer: DataLayer;
}) {
  const { verifiableCredential, provider, project, dataLayer } = args;

  const { isVerified: vcHasValidProof } =
    await dataLayer.verifyPassportCredential(verifiableCredential);

  const vcIssuedByValidIAMServer = verifiableCredential.issuer === IAM_SERVER;
  const providerMatchesProject = vcProviderMatchesProject(
    provider,
    verifiableCredential,
    project
  );
  const vcIssuedToAtLeastOneProjectOwner = (
    project?.projectMetadata?.owners ?? []
  ).some((owner) => vcIssuedToAddress(verifiableCredential, owner.address));

  return vcHasValidProof &&
    vcIssuedByValidIAMServer &&
    providerMatchesProject &&
    vcIssuedToAtLeastOneProjectOwner
    ? VerifiedCredentialState.VALID
    : VerifiedCredentialState.INVALID;
}
