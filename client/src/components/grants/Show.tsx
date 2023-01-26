import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchGrantData } from "../../actions/grantsMetadata";
import {
  loadAllChainsProjects,
  loadProjectOwners,
} from "../../actions/projects";
import { global } from "../../global";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/grantsMetadata";
import { editPath, grantsPath } from "../../routes";
import colors from "../../styles/colors";
import { getProjectImage, ImgTypes } from "../../utils/components";
import { getProjectURIComponents } from "../../utils/utils";
import Button, { ButtonVariants } from "../base/Button";
import Arrow from "../icons/Arrow";
import Pencil from "../icons/Pencil";
import Details from "./Details";
import PageNotFound from "../base/PageNotFound";

function Project() {
  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const fullId = `${params.chainId}:${params.registryAddress}:${params.id}`;

    const grantMetadata = state.grantsMetadata[fullId];
    const owners = state.projects.owners[fullId];

    const loading = grantMetadata
      ? grantMetadata.status === Status.Loading
      : false;

    const loadingFailed =
      grantMetadata && grantMetadata.status === Status.Error;

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
      id: fullId,
      loading,
      loadingFailed,
      bannerImg,
      logoImg,
      owners,
      currentProject: grantMetadata?.metadata,
      signerAddress: state.web3.account,
      projectEvents: state.projects.events[fullId],
    };
  }, shallowEqual);

  useEffect(() => {
    // called twice
    // 1 - when it loads or id changes (it checks if it's cached in local storage)
    // 2 - when ipfs is initialized (it fetches it if not loaded yet)
    if (props.id !== undefined && props.currentProject === undefined) {
      dispatch(fetchGrantData(props.id));
    }
  }, [dispatch, props.id, props.currentProject]);

  useEffect(() => {
    if (props.projectEvents === undefined) {
      dispatch(loadAllChainsProjects(true));
    }

    if (props.owners === undefined) {
      dispatch(loadProjectOwners(props.id));
    }
  }, [props.id, props.projectEvents, global, dispatch]);

  if (
    props.currentProject === undefined &&
    props.loading &&
    props.currentProject
  ) {
    return <>Loading grant data from IPFS... </>;
  }

  function createEditPath() {
    const { chainId, registryAddress, id } = getProjectURIComponents(props.id);
    return editPath(chainId, registryAddress, id);
  }

  if (props.loadingFailed) {
    return (
      <div>
        <PageNotFound />
      </div>
    );
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
            {props.id &&
              props.owners &&
              props.owners.includes(props.signerAddress!) && (
                <Link
                  to={createEditPath()}
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
            createdAt={props.currentProject.createdAt!}
            updatedAt={props.currentProject.updatedAt!}
            logoImg={props.logoImg}
            bannerImg={props.bannerImg}
            showApplications
          />
        </>
      )}
    </div>
  );
}

export default Project;
