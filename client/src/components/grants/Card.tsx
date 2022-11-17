import { useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { grantPath } from "../../routes";
import TextLoading from "../base/TextLoading";
import { getProjectImage, ImgTypes } from "../../utils/components";
import { Status } from "../../reducers/grantsMetadata";

function Card({ projectId }: { projectId: number }) {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[projectId];
    const status = grantMetadata?.status || Status.Undefined;
    const loading = grantMetadata
      ? grantMetadata.status === Status.Loading
      : false;
    const project = grantMetadata?.metadata;
    const bannerImg = getProjectImage(loading, ImgTypes.bannerImg, project);
    const logoImg = getProjectImage(loading, ImgTypes.logoImg, project);

    return {
      id: projectId,
      loading,
      currentProject: project,
      bannerImg,
      logoImg,
      status,
    };
  }, shallowEqual);

  useEffect(() => {
    if (projectId !== undefined && props.status === Status.Undefined) {
      dispatch(fetchGrantData(projectId));
    }
  }, [dispatch, projectId, props.currentProject, props.status]);

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg my-6">
      <Link to={grantPath(projectId)}>
        <img
          className="w-full h-32 object-cover"
          src={props.bannerImg}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "./assets/default-project-banner.png";
          }}
          alt="project banner"
        />
        <div className="p-6 relative text-start">
          <div className="flex w-full justify-start absolute -top-6">
            <div className="rounded-full h-12 w-12 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
              <img
                className="rounded-full"
                src={props.logoImg}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "./assets/default-project-logo.png";
                }}
                alt="project logo"
              />
            </div>
          </div>
          {props.loading ? (
            <TextLoading />
          ) : (
            <div className="pt-4">
              <div className="font-semi-bold text-xl mb-2 line-clamp-2">
                {props.currentProject?.title}
              </div>
              <p className="text-gray-700 text-base min-h-18 line-clamp-3">
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
