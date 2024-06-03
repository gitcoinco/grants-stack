import { useDataLayer } from "data-layer";
import { Badge, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getChainById,
  renderToPlainText,
  stringToBlobUrl,
  TChain,
} from "common";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { DefaultProjectBanner, DefaultProjectLogo } from "../../assets";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/grantsMetadata";
import { projectPath } from "../../routes";
import { getProjectImage, ImgTypes } from "../../utils/components";
import LoadingCard from "./LoadingCard";

function Card({ projectId }: { projectId: string }) {
  const dataLayer = useDataLayer();
  const dispatch = useDispatch();

  const [chain, setChain] = useState<TChain | undefined>(undefined);

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[projectId];
    const chainId = grantMetadata?.metadata?.chainId!;
    const status = grantMetadata?.status || Status.Undefined;
    const loading = grantMetadata
      ? grantMetadata.status === Status.Loading
      : false;
    const project = grantMetadata?.metadata;
    const bannerImg = getProjectImage(loading, ImgTypes.bannerImg, project);
    const logoImg = getProjectImage(loading, ImgTypes.logoImg, project);

    return {
      id: projectId,
      chainId,
      loading,
      currentProject: project,
      bannerImg,
      logoImg,
      status,
    };
  }, shallowEqual);

  useEffect(() => {
    if (projectId !== undefined && props.status === Status.Undefined) {
      dispatch(fetchGrantData(projectId, dataLayer));
    } else {
      setChain(getChainById(props.chainId));
    }
  }, [dispatch, projectId, props.currentProject, props.status]);

  function createProjectPath() {
    if (!props.chainId) return "";
    const registryAddress = "0x"; // TODO: fix (technically, we dont need the regsitry address anymore)
    return projectPath(props.chainId.toString(), registryAddress, props.id);
  }

  const projectDescription = renderToPlainText(
    props.currentProject?.description || ""
  ).slice(0, 100);

  return (
    <div className="container grid grid-cols-1 max-w-sm rounded overflow-hidden shadow-lg my-6">
      {props.loading ? (
        <LoadingCard />
      ) : (
        <>
          <Link to={createProjectPath()}>
            <img
              className="w-full h-32 object-cover"
              src={props.bannerImg}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DefaultProjectBanner;
              }}
              alt="project banner"
            />
            <div className="flex p-6 relative">
              <div className="flex w-full justify-between absolute -top-6">
                <div className="rounded-full h-12 w-12 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
                  <img
                    className="rounded-full"
                    src={props.logoImg}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DefaultProjectLogo;
                    }}
                    alt="project logo"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-between mt-4">
                <div className="font-semi-bold text-xl mb-2 line-clamp-2">
                  {props.currentProject?.title}
                </div>
                <p className="text-gray-700 text-base line-clamp-3">
                  {projectDescription}
                </p>
              </div>
            </div>
          </Link>

          {chain && (
            <div className="flex justify-end w-fit mt-auto">
              <Badge
                className="flex flex-row bg-gitcoin-grey-50 ml-6 mb-4 px-3 py-1 shadow-lg"
                borderRadius="full"
              >
                <Image
                  src={stringToBlobUrl(chain.icon)}
                  alt="chain icon"
                  className="flex flex-row h-4 mr-1 mt-[1px] rounded-full"
                />
                {chain.prettyName}
              </Badge>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Card;
