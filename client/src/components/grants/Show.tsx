import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { grantsPath, editPath } from "../../routes";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";
import Button, { ButtonVariants } from "../base/Button";
import { global } from "../../global";
import Pencil from "../icons/Pencil";
import colors from "../../styles/colors";
import LinkIcon from "../icons/LinkIcon";
import Arrow from "../icons/Arrow";
import { getProjectImage, ImgTypes } from "../../utils/components";
import { ProjectEvent } from "../../types";
import { loadProjects } from "../../actions/projects";
import Calendar from "../icons/Calendar";

function Project() {
  const [updatedAt, setUpdated] = useState("");

  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(params.id)];
    const loading = grantMetadata ? grantMetadata.loading : false;
    const bannerImg = getProjectImage(
      loading,
      ImgTypes.bannerImg,
      grantMetadata?.metadata
    );
    const logoImg = getProjectImage(
      loading,
      ImgTypes.logoImg,
      grantMetadata?.metadata
    );
    return {
      id: params.id,
      loading,
      bannerImg,
      logoImg,
      currentProject: grantMetadata?.metadata,
      projects: state.projects.projects,
    };
  }, shallowEqual);

  useEffect(() => {
    // called twice
    // 1 - when it loads or id changes (it checks if it's cached in local storage)
    // 2 - when ipfs is initialized (it fetches it if not loaded yet)
    if (params.id !== undefined && props.currentProject === undefined) {
      dispatch(fetchGrantData(Number(params.id)));
    }
  }, [dispatch, params.id, props.currentProject]);

  useEffect(() => {
    async function fetchTimeStamp(projects: ProjectEvent[], projectId: string) {
      if (global) {
        const currentProject = projects.find(
          (project) => project.id === Number(projectId)
        );
        if (currentProject) {
          const blockData = await global.web3Provider?.getBlock(
            currentProject.block
          );

          const formattedDate = new Date(
            (blockData?.timestamp ?? 0) * 1000
          ).toLocaleString();

          setUpdated(formattedDate);
        }
      }
    }

    if (props.currentProject !== undefined && props.id !== undefined) {
      fetchTimeStamp(props.projects, props.id);
    } else {
      // If user reloads Show projects will not exist
      dispatch(loadProjects());
    }
  }, [props.id, props.currentProject, global, dispatch]);

  if (
    props.currentProject === undefined &&
    props.loading &&
    props.currentProject
  ) {
    return <>Loading grant data from IPFS... </>;
  }

  return (
    <div>
      {props.currentProject && (
        <>
          <div className="flex justify-between items-center mb-6">
            <Link to={grantsPath()}>
              <h3 className="flex">
                <div className="pt-2 mr-2">
                  <Arrow color={colors["primary-text"]} />{" "}
                </div>
                Project Details
              </h3>
            </Link>
            {props.id && (
              <Link
                to={editPath(props.id)}
                className="sm:w-auto mx-w-full ml-0"
              >
                <Button
                  variant={ButtonVariants.outline}
                  styles={["sm:w-auto mx-w-full ml-0"]}
                >
                  <i className="icon mt-1">
                    <Pencil color={colors["secondary-text"]} />
                  </i>
                  &nbsp; Edit
                </Button>
              </Link>
            )}
          </div>
          <div className="w-full md:w-2/3 mb-40">
            <img
              className="w-full mb-4"
              src={getProjectImage(
                props.loading,
                ImgTypes.bannerImg,
                props.currentProject
              )}
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
                    src={props.logoImg}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "./icons/lightning.svg";
                    }}
                    alt="project logo"
                  />
                </div>
              </div>
            </div>
            <h4 className="mb-4 mt-14">{props.currentProject.title}</h4>
            <div className="flex justify-start border-b pb-6 mb-6">
              <a
                target="_blank"
                href={props.currentProject.website}
                className="flex items-center text-sm mr-6"
                rel="noreferrer"
              >
                <LinkIcon color={colors["secondary-text"]} />{" "}
                <p className="ml-1">{props.currentProject.website}</p>
                {/* TODO add created at updated timestamp */}
              </a>
              <p className="flex text-sm">
                <Calendar color={colors["secondary-text"]} /> {updatedAt}
              </p>
            </div>

            <p className="text-xs text-primary-text mb-1">Description</p>
            <p className="mb-12">{props.currentProject.description}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default Project;
