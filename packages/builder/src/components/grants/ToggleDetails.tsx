import { DefaultProjectBanner, DefaultProjectLogo } from "../../assets";
import { Metadata, Project } from "../../types";
import { getProjectImage, ImgTypes } from "../../utils/components";

function Section({ title, text }: { title: string; text: string | undefined }) {
  return (
    <div className="flex flex-col items-left justify-left mb-4">
      <label htmlFor={title} className="text-sm">
        {title}
      </label>
      <input className="text-sm" id={title} type="text" value={text} disabled />
    </div>
  );
}

export default function ToggleDetails({
  project,
}: {
  project?: Metadata | Project;
}) {
  return (
    <div className="w-full h-full">
      <Section title="Project Website" text={project?.website} />
      <Section title="Project Twitter" text={project?.projectTwitter} />
      <Section title="Your Github Username" text={project?.userGithub} />
      <Section
        title="Project Github Organization"
        text={project?.projectGithub}
      />
      <div className="w-full mt-2">
        <div className="flex flex-col items-left justify-left mt-4 mb-1">
          <span className="text-sm">Project Banner</span>
        </div>
        <img
          className="w-full mb-4"
          src={getProjectImage(false, ImgTypes.bannerImg, project)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DefaultProjectBanner;
          }}
          alt="project banner"
        />
      </div>
      <div>
        <div className="flex flex-col items-left justify-left mt-4 mb-1">
          <span className="text-sm">Project Logo</span>
        </div>
        <div className="rounded-full h-20 w-20 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
          <img
            className="rounded-full"
            src={getProjectImage(false, ImgTypes.logoImg, project)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DefaultProjectLogo;
            }}
            alt="project logo"
          />
        </div>
      </div>
      <Section title="Project Description" text={project?.description} />
    </div>
  );
}
