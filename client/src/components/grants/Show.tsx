import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { grantsPath, editPath } from "../../routes";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";
import Button, { ButtonVariants } from "../base/Button";
import Pencil from "../icons/Pencil";
import colors from "../../styles/colors";
import LinkIcon from "../icons/LinkIcon";
import Arrow from "../icons/Arrow";
import { getProjectImage } from "../../utils/components";

function Project() {
  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(params.id)];
    return {
      id: params.id,
      loading: grantMetadata ? grantMetadata.loading : false,
      currentProject: grantMetadata?.metadata,
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
          <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start mb-6 w-full">
            <h3 className="flex mb-4">
              <div className="pt-2 mr-2">
                <Link to={grantsPath()}>
                  <Arrow color={colors["primary-text"]} />
                </Link>{" "}
              </div>
              Project Details
            </h3>
            {props.id && (
              <Link
                to={editPath(props.id)}
                className="w-full sm:w-auto mx-w-full ml-0"
              >
                <Button
                  variant={ButtonVariants.outline}
                  styles={["w-full sm:w-auto mx-w-full ml-0"]}
                >
                  <div className="flex justify-center w-full">
                    <div className="m-1">
                      <Pencil color={colors["secondary-text"]} />
                    </div>
                    Edit
                  </div>
                </Button>
              </Link>
            )}
          </div>
          <div className="w-full md:w-1/3" />
          <div className="w-full md:w-2/3">
            <img
              className="w-full mb-4  h-32 object-contain"
              src={getProjectImage(props.loading, props.currentProject)}
              alt="project banner"
            />
            <h4 className="mb-4">{props.currentProject.title}</h4>
            <div className="flex items-center pb-6 mb-6 border-b">
              <LinkIcon color={colors["secondary-text"]} />{" "}
              <p className="ml-1">{props.currentProject.website}</p>
              {/* TODO add created at updated timestamp */}
            </div>
            <p className="text-xs text-primary-text mb-1">Description</p>
            <p className="mb-12">{props.currentProject.description}</p>
            <p className="text-xs text-primary-text mb-1">Project Roadmap</p>
            <p className="mb-12">{props.currentProject.roadmap}</p>
            <p className="text-xs text-primary-text mb-1">Project Roadmap</p>
            <p className="mb-12">{props.currentProject.challenges}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default Project;
