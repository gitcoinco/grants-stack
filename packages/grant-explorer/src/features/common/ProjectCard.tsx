import { v2Project } from "data-layer";
import { BasicCard, CardContent, CardDescription, CardHeader } from "./styles";
import { projectPath } from "common/src/routes/explorer";
import { ProjectBanner, ProjectLogo } from "./ProjectBanner";

export function ProjectCard(props: { project: v2Project }): JSX.Element {
  const { project } = props;

  return (
    <BasicCard className="w-full hover:opacity-90 transition hover:shadow-none">
      <a
        target="_blank"
        href={projectPath({
          projectId: project.id,
        })}
        data-track-event="project-card"
      >
        <CardHeader className="relative">
          <ProjectBanner
            bannerImgCid={project.metadata.bannerImg ?? null}
            classNameOverride={
              "bg-black h-[120px] w-full object-cover rounded-t"
            }
            resizeHeight={120}
          />
        </CardHeader>
        <CardContent className="relative">
          {project.metadata.logoImg !== undefined && (
            <ProjectLogo
              className="border-solid border-2 border-white absolute -top-[24px] "
              imageCid={project.metadata.logoImg}
              size={48}
            />
          )}
          <div className="truncate mt-4">{project.name}</div>
          <CardDescription className=" min-h-[96px]">
            <div className="text-sm line-clamp-4">
              {project.metadata.description}
            </div>
          </CardDescription>
        </CardContent>
      </a>
    </BasicCard>
  );
}
