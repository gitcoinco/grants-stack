import { Link } from "react-router-dom";
import { renderToPlainText } from "common";

import { CartProject, Project, Round } from "../../api/types";

import { ProjectBanner, ProjectLogo } from "../../common/ProjectBanner";
import {
  BasicCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../common/styles";

import { useCartStorage } from "../../../store";
import { CartButton } from "./CartButton";
import { useIsStakable } from "../ViewProjectDetails/components/StakingBannerAndModal/hooks/useIsStakable";

export function ProjectCard(props: {
  project: Project;
  roundRoutePath: string;
  showProjectCardFooter?: boolean;
  isBeforeRoundEndDate?: boolean;
  roundId: string;
  round: Round;
  chainId: number;
  setCurrentProjectAddedToCart: React.Dispatch<React.SetStateAction<Project>>;
  setShowCartNotification: React.Dispatch<React.SetStateAction<boolean>>;
  crowdfundedUSD: number;
  uniqueContributorsCount: number;
  totalStaked?: number;
}) {
  const { project, roundRoutePath } = props;

  const { projects, add, remove } = useCartStorage();
  const isStakableRound = useIsStakable({
    chainId: Number(props.chainId),
    roundId: props.roundId,
  });

  const isStakingPeriodStarted = props.showProjectCardFooter;

  const isAlreadyInCart =
    project &&
    projects.some(
      (cartProject) =>
        cartProject.chainId === Number(props.chainId) &&
        cartProject.grantApplicationId === project.grantApplicationId &&
        cartProject.roundId === props.roundId
    );
  if (!project) return null;
  const projectRecipient =
    project.recipient.slice(0, 5) + "..." + project.recipient.slice(-4);

  const cartProject = project as CartProject;
  cartProject.roundId = props.roundId;
  cartProject.chainId = Number(props.chainId);

  return (
    <BasicCard
      className={`relative w-full ${props.showProjectCardFooter ? "h-[370px]" : "h-[310px]"}`}
      data-testid="project-card"
    >
      <Link
        to={`${roundRoutePath}/${project.grantApplicationId}`}
        data-testid="project-detail-link"
      >
        <CardHeader className="relative">
          <ProjectBanner
            bannerImgCid={project.projectMetadata.bannerImg ?? null}
            classNameOverride={
              "bg-black h-[108px] w-full object-cover rounded-t"
            }
            resizeHeight={108}
          />
          {isStakableRound &&
            props.totalStaked !== undefined &&
            isStakingPeriodStarted && (
              <StakedAmountCard totalStaked={props.totalStaked} />
            )}
        </CardHeader>

        <CardContent className="px-2 relative">
          {project.projectMetadata.logoImg && (
            <ProjectLogo
              imageCid={project.projectMetadata.logoImg}
              size={48}
              className="ml-2 border-solid border-2 border-white absolute  -top-[24px] "
            />
          )}
          <div>
            <CardTitle data-testid="project-title" className="text-xl">
              {project.projectMetadata.title}
            </CardTitle>
            <CardDescription
              className="mb-2 mt-0 !text-sm"
              data-testid="project-owner"
            >
              by <span className="font-mono">{projectRecipient}</span>
            </CardDescription>
          </div>
          <CardDescription
            data-testid="project-description"
            className={`mb-1 !text-sm`}
          >
            {renderToPlainText(project.projectMetadata.description)}
          </CardDescription>
        </CardContent>
      </Link>
      {props.showProjectCardFooter && (
        <CardFooter className="bg-white">
          <CardContent className="px-2 text-xs ">
            <div className="border-t pt-1 flex items-center justify-between ">
              <div>
                <p>
                  $
                  {props.crowdfundedUSD?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-[11px] font-mono">
                  total raised by {props.uniqueContributorsCount} contributors
                </p>
              </div>
              {props.isBeforeRoundEndDate && (
                <CartButton
                  project={project}
                  isAlreadyInCart={isAlreadyInCart}
                  removeFromCart={() => {
                    remove(cartProject);
                  }}
                  addToCart={() => {
                    add(cartProject);
                  }}
                  setCurrentProjectAddedToCart={
                    props.setCurrentProjectAddedToCart
                  }
                  setShowCartNotification={props.setShowCartNotification}
                />
              )}
            </div>
          </CardContent>
        </CardFooter>
      )}
    </BasicCard>
  );
}

const StakedAmountCard = ({ totalStaked }: { totalStaked: number }) => {
  return (
    <div className="p-2 bg-white bg-opacity-80 rounded-2xl backdrop-blur-sm inline-flex justify-start items-center gap-2 absolute top-4 right-4">
      <div className="w-5 h-5 relative overflow-hidden">
        <div data-svg-wrapper className="left-[3.33px] top-[2.50px] absolute">
          <svg
            width="16"
            height="18"
            viewBox="0 0 16 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.83337 7.33333V1.5L1.33337 10.6667H7.16671L7.16671 16.5L14.6667 7.33333L8.83337 7.33333Z"
              stroke="#7D67EB"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="inline-flex flex-col justify-start items-start">
        <div className="self-stretch inline-flex justify-start items-center gap-1">
          <div className="justify-start text-text-primary text-sm font-medium font-mono leading-normal">
            {totalStaked.toFixed(3)}
          </div>
          <div className="justify-start text-text-primary text-sm font-medium font-mono leading-normal">
            GTC
          </div>
        </div>
        <div className="self-stretch justify-start text-text-primary text-xs font-normal font-mono leading-[14px]">
          Total staked
        </div>
      </div>
    </div>
  );
};
