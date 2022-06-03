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

function Project() {
  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(params.id)];
    return {
      id: params.id,
      loading: grantMetadata ? grantMetadata.loading : false,
      currentGrant: grantMetadata?.metadata,
      ipfsInitialized: state.ipfs.initialized,
      ipfsInitializationError: state.ipfs.initializationError,
    };
  }, shallowEqual);

  useEffect(() => {
    if (props.ipfsInitialized && params.id) {
      dispatch(fetchGrantData(Number(params.id)));
    }
  }, [dispatch, props.ipfsInitialized, params.id]);

  if (props.ipfsInitializationError) {
    return <>Error initializing IPFS. Reload the page and try again.</>;
  }

  if (!props.ipfsInitialized) {
    return <>Initializing ipfs...</>;
  }

  if (props.loading && props.currentGrant === undefined) {
    return <>Loading grant data from IPFS... </>;
  }

  return (
    <div>
      {props.currentGrant && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="flex">
              <Link to={grantsPath()}>
                <Arrow color={colors["primary-text"]} />
              </Link>{" "}
              Project Details
            </h3>
            {props.id && (
              <Link to={editPath(props.id)}>
                <Button variant={ButtonVariants.outline}>
                  <Pencil color={colors["secondary-text"]} /> Edit
                </Button>
              </Link>
            )}
          </div>
          <div className="w-full md:w-2/3">
            <img
              className="w-full mb-4"
              src="./assets/card-img.png"
              alt="project banner"
            />
            <h4 className="mb-4">{props.currentGrant.title}</h4>
            <div className="flex items-center pb-6 mb-6 border-b">
              <LinkIcon color={colors["secondary-text"]} />{" "}
              <p className="ml-1">{props.currentGrant.website}</p>
              {/* TODO add created at updated timestamp */}
            </div>
            <p className="text-xs text-primary-text mb-1">Description</p>
            <p className="mb-12">{props.currentGrant.description}</p>
            <p className="text-xs text-primary-text mb-1">Project Roadmap</p>
            <p className="mb-12">{props.currentGrant.roadmap}</p>
            <p className="text-xs text-primary-text mb-1">Project Roadmap</p>
            <p className="mb-12">{props.currentGrant.challenges}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default Project;
