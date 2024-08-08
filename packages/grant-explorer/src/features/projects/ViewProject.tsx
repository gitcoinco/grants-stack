/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import {
  formatDateWithOrdinal,
  getChainById,
  NATIVE,
  renderToHTML,
  stringToBlobUrl,
  TToken,
  useAllo,
  useParams,
  useValidateCredential,
} from "common";
import React, {
  ComponentProps,
  ComponentPropsWithRef,
  createElement,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import DefaultLogoImage from "../../assets/default_logo.png";
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg";
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg";
import { ReactComponent as GlobeIcon } from "../../assets/icons/globe-icon.svg";
import { ReactComponent as CartCircleIcon } from "../../assets/icons/cart-circle.svg";
import { ReactComponent as CheckedCircleIcon } from "../../assets/icons/checked-circle.svg";
import { ProjectBanner } from "../common/ProjectBanner";
import Breadcrumb, { BreadcrumbItem } from "../common/Breadcrumb";
import { Box, Skeleton, SkeletonText, Tab, Tabs } from "@chakra-ui/react";
import {
  ProjectApplicationWithRoundAndProgram,
  useDataLayer,
  v2Project,
} from "data-layer";
import { DefaultLayout } from "../common/DefaultLayout";
import { useProject, useProjectApplications } from "./hooks/useProject";
import NotFoundPage from "../common/NotFoundPage";
import { useCartStorage } from "../../store";
import { CartProject, ProgressStatus } from "../api/types";
import { Input } from "common/src/styles";
import { PayoutTokenDropdown } from "../round/ViewCartPage/PayoutTokenDropdown";
import { useAccount, useSwitchChain } from "wagmi";
import { getVotingTokenOptions } from "../api/utils";
import ErrorModal from "../common/ErrorModal";
import ProgressModal, { errorModalDelayMs } from "../common/ProgressModal";
import { useDirectAllocation } from "./hooks/useDirectAllocation";
import { getDirectAllocationPoolId } from "common/dist/allo/backends/allo-v2";
import { Address, getAddress, zeroAddress } from "viem";
import GenericModal from "../common/GenericModal";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getBalance } from "@wagmi/core";
import { config } from "../../app/wagmi";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { Logger } from "ethers/lib/utils";
import SwitchNetworkModal from "../common/SwitchNetworkModal";

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
  const { chainId } = useAccount();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [showDirectAllocationModal, setShowDirectAllocationModal] =
    useState<boolean>(false);
  const [showSwitchNetworkModal, setShowSwitchNetworkModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalSubHeading, setErrorModalSubHeading] = useState<
    string | undefined
  >();
  const [hasNetworkSwitched, setHasNetworkSwitched] = useState(false);

  const [directDonationAmount, setDirectDonationAmount] = useState<string>("");
  const payoutTokenOptions: TToken[] = getVotingTokenOptions(
    Number(chainId)
  ).filter((p) => p.canVote);
  const [payoutToken, setPayoutToken] = useState<TToken | undefined>(
    payoutTokenOptions[0]
  );
  const [tokenBalances, setTokenBalances] = useState<
    { token: Address; balance: bigint }[]
  >([]);
  const directAllocationPoolId = getDirectAllocationPoolId(chainId ?? 1);
  const [transactionReplaced, setTransactionReplaced] = useState(false);
  const { projectId } = useParams();

  const dataLayer = useDataLayer();
  const allo = useAllo();
  const navigate = useNavigate();
  const { switchChain } = useSwitchChain();

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
    applications: projectApplications,
    error: projectApplicationsError,
    isLoading: isProjectApplicationsLoading,
  } = useProjectApplications(
    {
      projectId: projectId,
    },
    dataLayer
  );

  const {
    directAllocation,
    tokenApprovalStatus,
    fundStatus,
    indexingStatus,
    txHash,
  } = useDirectAllocation();

  useMemo(() => {
    if (!address) return;
    const runner = async () => {
      const balances = await Promise.all(
        payoutTokenOptions.map(async (token) => {
          const { value } = await getBalance(config, {
            address: getAddress(address),
            token:
              token.address === zeroAddress ||
              token.address.toLowerCase() === NATIVE.toLowerCase()
                ? undefined
                : token.address,
            chainId: chainId,
          });
          return { token: token.address, balance: value };
        })
      );

      setTokenBalances(balances);
    };

    if (address && address !== zeroAddress) runner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address]);

  const pastRroundApplications = projectApplications?.filter(
    (projectApplication) =>
      new Date(projectApplication.round.donationsEndTime) < new Date()
  );

  const project = projectData?.project;

  useEffect(() => {
    if (
      tokenApprovalStatus === ProgressStatus.IS_ERROR ||
      fundStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setErrorModalSubHeading(
          transactionReplaced
            ? "Transaction cancelled. Please try again."
            : "There was an error during the funding process. Please try again."
        );
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        // refresh
        navigate(0);
      }, 5000);
    }

    if (
      tokenApprovalStatus === ProgressStatus.IS_SUCCESS &&
      fundStatus === ProgressStatus.IS_SUCCESS &&
      txHash !== ""
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        // refresh
        navigate(0);
      }, errorModalDelayMs);
    }
  }, [
    navigate,
    tokenApprovalStatus,
    fundStatus,
    indexingStatus,
    txHash,
    transactionReplaced,
    projectId,
  ]);

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Projects",
      path: `/projects`,
    },
    {
      name: project?.metadata.title,
      path: `/projects/${projectId}`,
    },
  ] as BreadcrumbItem[];

  const progressSteps = [
    {
      name: "Token Approval",
      description: "Approving token transfer.",
      status: tokenApprovalStatus,
    },
    {
      name: "Donating",
      description: "Donating to the project.",
      status: fundStatus,
    },
    {
      name: "Indexing",
      description: "Indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

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
            {isProjectApplicationsLoading && <SkeletonText />}
            {projectApplicationsError && (
              <p className="ml-4 mt-8">Couldn't load project data.</p>
            )}
            {pastRroundApplications && pastRroundApplications?.length > 0 && (
              <>
                {pastRroundApplications.map((projectApplication) => (
                  <RoundListItem
                    key={projectApplication.id}
                    projectApplication={projectApplication}
                  />
                ))}
              </>
            )}
            {pastRroundApplications && pastRroundApplications?.length === 0 && (
              <p className="ml-4 mt-8">No past rounds found.</p>
            )}
          </>
        ),
      },
    ],
    [
      project,
      description,
      isProjectApplicationsLoading,
      projectApplicationsError,
      pastRroundApplications,
    ]
  );

  const onSwitchNetwork = () => {
    if (switchChain && project?.chainId) {
      switchChain({ chainId: project?.chainId });
      setHasNetworkSwitched(true);
    }
  };

  useEffect(() => {
    if (hasNetworkSwitched) {
      if (chainId === project?.chainId) {
        setShowSwitchNetworkModal(false);
        setShowDirectAllocationModal(true);
      }
    }
  }, [chainId, project?.chainId, hasNetworkSwitched]);

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
            <div className="mb-4">
              <Sidebar
                projectApplications={projectApplications}
                directAllocationPoolId={directAllocationPoolId}
                isConnected={isConnected}
                chainId={Number(chainId)}
                project={project}
                setShowSwitchNetworkModal={setShowSwitchNetworkModal}
                setShowDirectAllocationModal={setShowDirectAllocationModal}
                openConnectModal={openConnectModal}
              />
            </div>
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
            <DonationModals />
          </div>
        </DefaultLayout>
      ) : (
        <NotFoundPage />
      )}
    </>
  );

  function DonationModals() {
    return (
      <>
        <SwitchNetworkModal
          networkName={getChainById(project?.chainId ?? 1)?.name ?? ""}
          onSwitchNetwork={onSwitchNetwork}
          action="donate to this project"
          isOpen={showSwitchNetworkModal}
          setIsOpen={setShowSwitchNetworkModal}
        />
        <GenericModal
          body={
            <DirectDonationModalComponent
              chainId={chainId!}
              address={address!}
              directDonationAmount={directDonationAmount}
              setDirectDonationAmount={setDirectDonationAmount}
              payoutToken={payoutToken}
              setPayoutToken={setPayoutToken}
              payoutTokenOptions={payoutTokenOptions}
              tokenBalances={tokenBalances}
              projectData={{ project: project! }}
              handleDonate={handleDonate}
            />
          }
          isOpen={showDirectAllocationModal}
          setIsOpen={setShowDirectAllocationModal}
        ></GenericModal>
        <ProgressModal
          isOpen={openProgressModal}
          subheading={"Please hold while we donate your funds to the project."}
          steps={progressSteps}
        />
        <ErrorModal
          isOpen={openErrorModal}
          setIsOpen={setOpenErrorModal}
          onTryAgain={handleDonate}
          subheading={errorModalSubHeading}
        />
      </>
    );
  }

  async function handleDonate() {
    if (
      directDonationAmount === undefined ||
      allo === null ||
      payoutToken === undefined
    ) {
      return;
    }

    setShowDirectAllocationModal(false);
    setOpenProgressModal(true);

    try {
      let requireTokenApproval = false;

      const poolId = getDirectAllocationPoolId(chainId ?? 1)?.toString();

      const recipient = project?.roles?.filter(
        (role) => role.role === "OWNER"
      )[0].address;

      const nonce = project?.nonce;

      if (
        poolId === undefined ||
        recipient === undefined ||
        nonce === undefined
      ) {
        console.error("handleDonation - project", projectId, "missing data");
        return;
      }

      if (
        payoutToken?.address !== undefined &&
        payoutToken?.address !== zeroAddress
      ) {
        requireTokenApproval = true;
      }

      await directAllocation({
        allo,
        poolId,
        fundAmount: Number(
          parseFloat(directDonationAmount).toFixed(payoutToken.decimals)
        ),
        payoutToken,
        recipient,
        nonce,
        requireTokenApproval,
      });
    } catch (error) {
      if (error === Logger.errors.TRANSACTION_REPLACED) {
        setTransactionReplaced(true);
      } else {
        console.error("handleDonation - project", projectId, error);
      }
    }
  }
}

export function DirectDonationModalComponent(props: {
  chainId: number;
  address: string;
  directDonationAmount: string;
  setDirectDonationAmount: (value: string) => void;
  payoutToken: TToken | undefined;
  setPayoutToken: (token: TToken | undefined) => void;
  payoutTokenOptions: TToken[];
  tokenBalances: { token: Address; balance: bigint }[];
  projectData: { project: v2Project };
  handleDonate: () => void;
}) {
  const [hasEnoughFunds, setHasEnoughFunds] = useState(false);

  useMemo(() => {
    setHasEnoughFunds(
      Number(props.directDonationAmount) <=
        Number(
          ethers.utils.formatUnits(
            props.tokenBalances.find(
              (balance) =>
                balance.token.toLowerCase() ===
                (props.payoutToken?.address ?? "").toLowerCase()
            )?.balance ?? 0n,
            props.payoutToken?.decimals ?? 18
          )
        )
    );
  }, [props.directDonationAmount, props.tokenBalances, props.payoutToken]);

  const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
  const [isEmptyInput, setIsEmptyInput] = useState(false);

  useEffect(() => {
    if (
      props.directDonationAmount === "" ||
      Number(props.directDonationAmount) === 0
    ) {
      setIsEmptyInput(true);
    } else {
      setIsEmptyInput(false);
    }
  }, [props.directDonationAmount]);

  return (
    <>
      <div>
        <p className="mb-4 text-lg font-bold">
          <BoltIcon className="w-4 h-4 mb-1 inline-block mr-2" />
          Direct Donation
        </p>
        <p className="mb-2">
          This is a direct donation to the project. Please note that as the
          donation is outside of a quadratic funding round it doesn't receive
          any matching funds.
        </p>
      </div>

      <div className="mb-4 flex flex-col lg:flex-row justify-between sm:px-2 px-2 py-4 rounded-md">
        <div className="flex">
          <div className="flex relative overflow-hidden bg-no-repeat bg-cover mt-auto mb-auto">
            <img
              className="inline-block rounded-full w-10 my-auto mr-2"
              src={
                props.projectData?.project.metadata.logoImg
                  ? `${ipfsGateway}/ipfs/${props.projectData?.project.metadata.logoImg}`
                  : DefaultLogoImage
              }
              alt={"Project Logo"}
            />
            <p className="font-semibold text-md my-auto text-ellipsis line-clamp-1 max-w-[100px]">
              {props.projectData?.project?.metadata.title}
            </p>
          </div>
        </div>
        <div className="flex sm:space-x-4 space-x-2 h-16 sm:pl-4 pt-3 justify-center">
          <p className="mt-4 md:mt-3 text-xs md:text-sm amount-text font-medium">
            Amount
          </p>
          <Input
            aria-label={"Donation amount for all projects "}
            id={"input-donationamount"}
            min="0"
            type="text"
            value={props.directDonationAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(",", ".");
              if (/^\d*\.?\d*$/.test(value) || value === "") {
                props.setDirectDonationAmount(value);
              }
            }}
            className="w-16 lg:w-18"
          />
          <PayoutTokenDropdown
            selectedPayoutToken={props.payoutToken}
            setSelectedPayoutToken={(token) => {
              props.setPayoutToken(token);
            }}
            payoutTokenOptions={props.payoutTokenOptions}
            style="max-h-16"
          />
        </div>
      </div>
      {isEmptyInput && hasClickedSubmit && (
        <p
          data-testid="emptyInput"
          className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
        >
          <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
          <span>You must enter donation for the project</span>
        </p>
      )}
      {!hasEnoughFunds && (
        <p
          data-testid="hasEnoughFunds"
          className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
        >
          <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
          <span>You don't have enough funds</span>
        </p>
      )}

      <button
        type="button"
        className="w-full font-normal rounded-lg bg-gitcoin-violet-400 text-white focus-visible:outline-indigo-600 py-2 leading-6"
        onClick={() => {
          if (isEmptyInput) {
            setHasClickedSubmit(true);
            return;
          }
          props.handleDonate();
        }}
        disabled={!hasEnoughFunds}
      >
        Submit your donation
      </button>
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

function Sidebar(props: {
  projectApplications?: ProjectApplicationWithRoundAndProgram[];
  directAllocationPoolId: number | undefined;
  isConnected: boolean;
  chainId: number;
  project?: v2Project;
  setShowSwitchNetworkModal: (value: boolean) => void;
  setShowDirectAllocationModal: (value: boolean) => void;
  openConnectModal?: () => void;
}) {
  const activeQFRoundApplications = props.projectApplications?.filter(
    (projectApplication) =>
      new Date(projectApplication.round.donationsEndTime) > new Date() &&
      projectApplication.round.strategyName ===
        "allov2.DonationVotingMerkleDistributionDirectTransferStrategy"
  );
  const { projects, add, remove } = useCartStorage();
  return (
    <div className="flex flex-col">
      <div className="min-w-[320px] h-fit mb-6 rounded-3xl bg-gray-50">
        <ProjectStats projectApplications={props.projectApplications} />
      </div>
      {props.directAllocationPoolId && (
        <button
          type="button"
          data-testid="direct-allocation-button"
          className="w-full block mb-8 mx-1 bg-gitcoin-violet-100 py-2 text-center text-sm font-semibold rounded-lg leading-6 text-gitcoin-violet-400 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => {
            if (!props.isConnected) {
              props.openConnectModal?.();
              return;
            }
            if (props.project?.chainId === undefined) {
              console.error("project chainId is undefined");
              return;
            }
            if (props.chainId !== props.project?.chainId) {
              props.setShowSwitchNetworkModal(true);
            } else {
              props.setShowDirectAllocationModal(true);
            }
          }}
        >
          <BoltIcon className="w-4 h-4 inline-block mr-1 mb-1" />
          Donate
        </button>
      )}
      {activeQFRoundApplications && activeQFRoundApplications?.length > 0 && (
        <>
          <h4 className="text-xl font-medium">Active rounds</h4>
          <p className="text-md mt-2 text-gray-500 max-w-[320px]">
            The project is currently participating in the below active rounds.
            Donating to the project in these rounds will help it receive
            matching funds.
          </p>
        </>
      )}
      <div className="mt-4 max-w-[320px] h-fit rounded-3xl ">
        {activeQFRoundApplications?.map((projectApplication) => (
          <ActiveRoundComponent
            key={projectApplication.id}
            projectApplication={projectApplication}
            addToCart={add}
            removeFromCart={remove}
            projectsInCart={projects}
          />
        ))}
      </div>
    </div>
  );
}

export function ProjectStats(props: {
  projectApplications?: ProjectApplicationWithRoundAndProgram[];
}) {
  const totalFundingReceived =
    props.projectApplications
      ?.reduce(
        (acc, projectApplication) =>
          acc + projectApplication.totalAmountDonatedInUsd,
        0
      )
      .toFixed() ?? "0";
  const totalContributions =
    props.projectApplications
      ?.reduce(
        (acc, projectApplication) =>
          acc + projectApplication.totalDonationsCount,
        0
      )
      .toFixed() ?? "0";
  const totalUniqueDonors =
    props.projectApplications
      ?.reduce(
        (acc, projectApplication) => acc + projectApplication.uniqueDonorsCount,
        0
      )
      .toFixed() ?? "0";
  const totalRoundsParticipated = props.projectApplications?.length ?? 0;

  return (
    <div className="flex flex-col">
      <div className="rounded-3xl flex-auto p-3 md:p-4 gap-4 flex flex-col text-blue-800">
        <h4 className="text-2xl">All-time stats</h4>
        <Stat isLoading={false} value={`$${totalFundingReceived}`}>
          funding received
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

export function RoundListItem({
  projectApplication,
}: {
  projectApplication: ProjectApplicationWithRoundAndProgram;
}) {
  const applicationsStartTime = new Date(
    projectApplication.round.applicationsStartTime
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const donationsEndTime = new Date(
    projectApplication.round.donationsEndTime
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const roundType =
    projectApplication.round.strategyName === "allov1.Direct" ||
    projectApplication.round.strategyName ===
      "allov2.DirectGrantsSimpleStrategy" ||
    projectApplication.round.strategyName === "allov2.DirectGrantsLiteStrategy"
      ? "Direct grants"
      : "Quadratic funding";

  return (
    <div className="w-full my-8 flex flex-col md:flex-row justify-between items-center text-sm px-2 border-b border-gray-400">
      <div className="flex md:flex-auto my-2 md:w-24 truncate mr-4">
        <span className="text-black-400 font-semibold">
          {projectApplication.round.project.name}
        </span>
      </div>
      <div className="flex md:flex-auto my-2 md:w-24 truncate mr-4">
        <span className="text-black-400 font-semibold">
          {projectApplication.round.roundMetadata.name}
        </span>
      </div>
      {roundType === "Quadratic funding" ? (
        <div className="flex-1 my-2 mr-4 text-gray-500">
          <span>
            {applicationsStartTime} - {donationsEndTime}
          </span>
        </div>
      ) : (
        <div className="flex-1 my-2 mr-4 text-gray-500">
          <span>{applicationsStartTime}</span>
        </div>
      )}
      <div className="flex-1 my-2">
        <span
          className={`flex justify-center ${roundType === "Quadratic funding" ? "bg-green-100" : "bg-yellow-100"} items-center text-md rounded-full p-2 font-medium`}
        >
          <span className="text-black font-medium">{roundType}</span>
        </span>
      </div>
    </div>
  );
}

export function ActiveRoundComponent(props: {
  projectApplication: ProjectApplicationWithRoundAndProgram;
  addToCart: (project: CartProject) => void;
  removeFromCart: (project: CartProject) => void;
  projectsInCart: CartProject[];
}) {
  const roundName = props.projectApplication.round.roundMetadata.name;
  const roundStartDate = new Date(
    props.projectApplication.round.donationsStartTime
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const roundEndDate = new Date(
    props.projectApplication.round.donationsEndTime
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const cartProject: CartProject = {
    grantApplicationId: props.projectApplication.id,
    projectRegistryId: props.projectApplication.projectId,
    anchorAddress: props.projectApplication.anchorAddress,
    recipient: props.projectApplication.metadata.application.recipient,
    projectMetadata: props.projectApplication.metadata.application.project,
    grantApplicationFormAnswers: [],
    status: props.projectApplication.status,
    applicationIndex: Number(props.projectApplication.id),
    roundId: props.projectApplication.roundId,
    chainId: props.projectApplication.chainId,
    amount: "0",
  };
  const roundLink = `https://explorer.gitcoin.co/#/round/${props.projectApplication.chainId}/${props.projectApplication.roundId}`;
  const roundChain = getChainById(props.projectApplication.chainId);
  const isProjectInCart = props.projectsInCart.some(
    (project) => project.projectRegistryId === cartProject.projectRegistryId
  );

  return (
    <div className="p-4 bg-gray-50 rounded-3xl flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {roundName}
          </div>
          <div className="text-gray-500mb-4">
            {roundStartDate} - {roundEndDate}
          </div>
        </div>
        <img
          className="mt-2 ml-2 inline-block h-9 w-9"
          src={stringToBlobUrl(roundChain.icon)}
          alt={"Chain Logo"}
        />
      </div>
      <div className="flex justify-between gap-2">
        <a
          href={roundLink}
          target="_blank"
          className="flex justify-center bg-green-100 text-black-500 rounded-xl px-4 py-2 w-3/4"
        >
          View round
        </a>
        {isProjectInCart ? (
          <div
            onClick={() => props.removeFromCart(cartProject)}
            className="flex text-black-500 w-1/4 justify-center cursor-pointer"
          >
            <CheckedCircleIcon className="w-10" />
          </div>
        ) : (
          <div
            onClick={() => props.addToCart(cartProject)}
            className="flex text-black-500 w-1/4 justify-center cursor-pointer"
          >
            <CartCircleIcon className="w-10" />
          </div>
        )}
      </div>
    </div>
  );
}
