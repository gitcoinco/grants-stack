import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { loadProjects } from "../../actions/projects";
import { global } from "../../global";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/grantsMetadata";
import { editPath, grantsPath } from "../../routes";
import colors from "../../styles/colors";
import { ProjectEvent } from "../../types";
import { getProjectImage, ImgTypes } from "../../utils/components";
import Button, { ButtonVariants } from "../base/Button";
import Arrow from "../icons/Arrow";
import Pencil from "../icons/Pencil";
import Details from "./Details";

function Project() {
  const [updatedAt, setUpdatedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(params.id)];
    const loading = grantMetadata
      ? grantMetadata.status === Status.Loading
      : false;
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
          const updatedBlockData = await global.web3Provider?.getBlock(
            currentProject.block
          );

          const createdBlockData = await global.web3Provider?.getBlock(
            currentProject.createdAtBlock!
          );

          const formattedUpdatedAtDate = new Date(
            (updatedBlockData?.timestamp ?? 0) * 1000
          ).toLocaleString();

          const formattedCreatedAtDate = new Date(
            (createdBlockData?.timestamp ?? 0) * 1000
          ).toLocaleString();

          setUpdatedAt(formattedUpdatedAtDate);
          setCreatedAt(formattedCreatedAtDate);
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
          <Details
            project={props.currentProject}
            createdAt={createdAt}
            updatedAt={updatedAt}
            logoImg={props.logoImg}
            bannerImg={props.bannerImg}
          />
        </>
      )}
    </div>
  );
}

export default Project;
