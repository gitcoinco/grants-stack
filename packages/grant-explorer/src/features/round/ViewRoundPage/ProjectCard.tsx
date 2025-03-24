import { Link } from "react-router-dom";
import { renderToPlainText, useTokenPrice, TToken } from "common";

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
}) {
  const { project, roundRoutePath } = props;
  const projectRecipient =
    project.recipient.slice(0, 5) + "..." + project.recipient.slice(-4);

  const { projects, add, remove } = useCartStorage();

  const isAlreadyInCart = projects.some(
    (cartProject) =>
      cartProject.chainId === Number(props.chainId) &&
      cartProject.grantApplicationId === project.grantApplicationId &&
      cartProject.roundId === props.roundId
  );

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
        <CardHeader>
          <ProjectBanner
            bannerImgCid={project.projectMetadata.bannerImg ?? null}
            classNameOverride={
              "bg-black h-[108px] w-full object-cover rounded-t"
            }
            resizeHeight={108}
          />
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
