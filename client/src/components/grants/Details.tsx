import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "../../actions/ui";
import useLocalStorage from "../../hooks/useLocalStorage";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/roundApplication";
import colors from "../../styles/colors";
import { FormInputs, Metadata, Project } from "../../types";
import { AlertContainer } from "../base/Alert";
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
  createdAt,
  updatedAt,
  bannerImg,
  logoImg,
  preview,
}: {
  project?: Metadata | FormInputs | Project;
  updatedAt: string;
  createdAt: string;
  bannerImg: string | Blob;
  logoImg: string | Blob;
  preview?: boolean;
}) {
  const [roundToApply] = useLocalStorage("roundToApply", null);
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => {
    let roundAddress;
    if (roundToApply) {
      // eslint-disable-next-line prefer-destructuring
      roundAddress = roundToApply.split(":")[1];
    }
    const { alerts } = state.ui;
    const application = state.roundApplication[roundAddress];
    const projectId = application?.projectsIDs[0];

    return {
      alerts,
      projectId,
      application,
    };
  });

  const discordLink: JSX.Element = (
    <a className="text-purple-500" href="https://discord.gg/nwYzGuuruJ">
      Grant Hub Discord!
    </a>
  );
  // todo: add round name to tile and body
  // FIXME: the teal is not showing up
  const applicationSuccessTitle: JSX.Element = (
    <p className="text-gitcoin-teal-500">Thank you for applying to </p>
  );
  const applicationErrorTitle: JSX.Element = (
    <p className="text-gitcoin-pink-500">Error submitting application</p>
  );
  const applicationSuccessBody: JSX.Element = (
    <p className="text-black">
      Your application will be reviewed by the grant round team and you will
      receive an email if your project is approved for the grant round. If you
      have any questions or feedback, feel free to reach us out on the{" "}
      {discordLink}
    </p>
  );
  const applicationErrorBody: JSX.Element = (
    <p className="text-black">
      Please try again or reach out to us on the {discordLink}
    </p>
  );

  useEffect(() => {
    if (props.application?.status === Status.Sent) {
      dispatch(
        addAlert("success", applicationSuccessTitle, applicationSuccessBody)
      );
    } else if (props.application?.status === Status.Error) {
      dispatch(addAlert("error", applicationErrorTitle, applicationErrorBody));
    }
  }, []);

  return (
    <div className={`w-full ${!preview && "md:w-2/3"} mb-40`}>
      <AlertContainer alerts={props.alerts} />
      <img
        className="w-full mb-4"
        src={
          bannerImg instanceof Blob ? URL.createObjectURL(bannerImg) : bannerImg
        }
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "./assets/default-project-logo.png";
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
                e.currentTarget.src = "./assets/default-project-logo.png";
              }}
              alt="project logo"
            />
          </div>
        </div>
      </div>
      <h4 className="mb-4 mt-14">{project?.title}</h4>
      <div className="grid grid-cols-2 gap-4 pb-6 mb-6">
        <div>
          <a
            target="_blank"
            href={project?.website}
            className="flex items-center mr-6 text-primary-background"
            rel="noreferrer"
          >
            <LinkIcon color={colors["secondary-text"]} />{" "}
            <span className="ml-1">{project?.website}</span>
          </a>
        </div>
        <div>
          <p className="flex text-sm">
            <Calendar color={colors["secondary-text"]} />
            <span className="ml-1">Created on: {createdAt}</span>
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

        <div>
          <p className="flex text-sm">
            <Calendar color={colors["secondary-text"]} />
            <span className="ml-1">Last Edited: {updatedAt}</span>
          </p>
        </div>
        {project?.projectGithub && (
          <div className="flex justify-start items-center">
            <img
              className="h-4 mr-2 mt-1"
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
              className="h-4 mr-2 mt-1"
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

      <p className="text-primary-text mb-1 font-bold">Description</p>
      <p className="mb-12">{project?.description}</p>
    </div>
  );
}
