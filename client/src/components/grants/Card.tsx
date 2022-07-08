import { useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { grantPath } from "../../routes";
import Lightning from "../icons/Lightning";
import colors from "../../styles/colors";
import TextLoading from "../base/TextLoading";
import { getProjectImage } from "../../utils/components";

function Card({ projectId }: { projectId: number }) {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[projectId];
    return {
      id: projectId,
      loading: grantMetadata ? grantMetadata.loading : true,
      currentProject: grantMetadata?.metadata,
      ipfsInitialized: state.ipfs.initialized,
    };
  }, shallowEqual);

  useEffect(() => {
    // called twice
    // 1 - when it loads or projectId changes (it checks if it's cached in local storage)
    // 2 - when ipfs is initialized (it fetches it if not loaded yet)
    if (projectId !== undefined && props.currentProject === undefined) {
      dispatch(fetchGrantData(projectId));
    }
  }, [dispatch, props.ipfsInitialized, projectId, props.currentProject]);

  useEffect(() => {
    // Called to capture updates to projectmetadata after project edit
    // props.currentProject will be defined, but it will reference cached values
    if (projectId !== undefined) {
      dispatch(fetchGrantData(projectId));
    }
  }, [projectId, props.ipfsInitialized]);

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg my-6">
      <Link to={grantPath(projectId)}>
        <img
          className="w-full h-32 object-cover"
          src={getProjectImage(props.loading, props.currentProject)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "./assets/card-img.png";
          }}
          alt="project banner"
        />
        <div className="py-4 relative text-center">
          <div className="flex w-full justify-center absolute -top-6">
            <div className="rounded-full h-12 w-12 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
              <Lightning color={colors["primary-text"]} />
            </div>
          </div>
          {props.loading ? (
            <TextLoading />
          ) : (
            <div className="px-6 pt-4">
              <div className="font-bold text-xl mb-2">
                {props.currentProject?.title}
              </div>
              <p className="text-gray-700 text-base h-20">
                {props.currentProject?.description}
              </p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default Card;
