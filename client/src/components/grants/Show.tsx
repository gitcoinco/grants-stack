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
import { getProjectImage } from "../../utils/components";
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
    return {
      id: params.id,
      loading: grantMetadata ? grantMetadata.loading : false,
      currentProject: grantMetadata?.metadata,
      projects: state.projects.projects,
      ipfsInitialized: state.ipfs.initialized,
      ipfsInitializationError: state.ipfs.initializationError,
    };
  }, shallowEqual);

  useEffect(() => {
    // called twice
    // 1 - when it loads or id changes (it checks if it's cached in local storage)
    // 2 - when ipfs is initialized (it fetches it if not loaded yet)
    if (params.id !== undefined && props.currentProject === undefined) {
      dispatch(fetchGrantData(Number(params.id)));
    }
  }, [dispatch, props.ipfsInitialized, params.id, props.currentProject]);

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

  if (props.currentProject === undefined && props.ipfsInitializationError) {
    return <>Error initializing IPFS. Reload the page and try again.</>;
  }

  if (props.currentProject === undefined && !props.ipfsInitialized) {
    return <>Initializing ipfs...</>;
  }

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
                className="w-full sm:w-auto mx-w-full ml-0"
              >
                <Button
                  variant={ButtonVariants.outline}
                  styles={["w-full sm:w-auto mx-w-full ml-0"]}
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
              className="w-full mb-4  h-32 object-contain"
              src={getProjectImage(props.loading, props.currentProject)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "./assets/card-img.png";
              }}
              alt="project banner"
            />
            <h4 className="mb-4">{props.currentProject.title}</h4>
            <div className="flex justify-start border-b  pb-6 mb-6">
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
