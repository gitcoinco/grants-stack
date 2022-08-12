import colors from "../../styles/colors";
import { Metadata, FormInputs, Project } from "../../types";
import Calendar from "../icons/Calendar";
import LinkIcon from "../icons/LinkIcon";
import Shield from "../icons/Shield";

function Verified() {
  return (
    <div className="flex rounded bg-green-text/25 px-2 py-0.5 mt-1">
      <Shield dimension={16} color={colors["green-text"]} />{" "}
      <p className="pl-2 text-green-text text-xs font-bold">Verified</p>
    </div>
  );
}

export default function Details({
  project,
  updatedAt,
  bannerImg,
  logoImg,
  preview,
}: {
  project?: Metadata | FormInputs | Project;
  updatedAt: string;
  bannerImg: string | Blob;
  logoImg: string | Blob;
  preview?: boolean;
}) {
  return (
    <div className={`w-full ${!preview && "md:w-2/3"} mb-40`}>
      <img
        className="w-full mb-4"
        src={
          bannerImg instanceof Blob ? URL.createObjectURL(bannerImg) : bannerImg
        }
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "./assets/card-img.png";
        }}
        alt="project banner"
      />
      <div className="relative">
        <div className="flex w-full justify-start absolute -top-14 left-8">
          <div className="rounded-full h-20 w-20 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
            <img
              className="rounded-full"
              src={
                logoImg instanceof Blob ? URL.createObjectURL(logoImg) : logoImg
              }
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "./icons/lightning.svg";
              }}
              alt="project logo"
            />
          </div>
        </div>
      </div>
      <h4 className="mb-4 mt-14">{project?.title}</h4>
      <div className="grid grid-cols-2 gap-4 pb-6 mb-6">
        <a
          target="_blank"
          href={project?.website}
          className="flex items-center mr-6 text-primary-background"
          rel="noreferrer"
        >
          <LinkIcon color={colors["secondary-text"]} />{" "}
          <span className="ml-1">{project?.website}</span>
          {/* TODO add created at updated timestamp */}
        </a>
        <div>
          <p className="flex text-sm">
            <Calendar color={colors["secondary-text"]} />{" "}
            <span className="ml-2">{updatedAt}</span>
          </p>
        </div>
        {project?.projectTwitter && (
          <div className="flex justify-start items-center">
            <img
              className="h-3 mr-2 mt-1"
              src="./assets/twitter_logo.svg"
              alt="Twitter Logo"
            />
            <a
              className="mr-2 text-primary-background"
              target="_blank"
              href={`https://twitter.com/${project?.projectTwitter}`}
              rel="noreferrer"
            >
              {project?.projectTwitter}
            </a>
            {project?.credentials?.twitter && <Verified />}
          </div>
        )}
        {project?.projectGithub && (
          <div className="flex justify-start items-center">
            <img
              className="h-3 mr-2 mt-1"
              src="./assets/github_logo.png"
              alt="Github Logo"
            />
            <a
              className="mr-2 text-primary-background"
              target="_blank"
              href={`https://github.com/${project?.projectGithub}`}
              rel="noreferrer"
            >
              {project?.projectGithub}
            </a>
            {project?.credentials?.github && <Verified />}
          </div>
        )}
        {project?.projectGithub && (
          <div className="flex justify-start items-center">
            <img
              className="h-3 mr-2 mt-1"
              src="./assets/github_logo.png"
              alt="Github Logo"
            />
            <a
              className="mr-2 text-primary-background"
              target="_blank"
              href={`https://github.com/${project?.userGithub}`}
              rel="noreferrer"
            >
              {project?.userGithub}
            </a>
          </div>
        )}
      </div>

      <p className="text-xs text-primary-text mb-1">Description</p>
      <p className="mb-12">{project?.description}</p>
    </div>
  );
}
