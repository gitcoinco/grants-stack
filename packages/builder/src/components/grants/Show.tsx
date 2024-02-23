import { useDataLayer } from "data-layer";
import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/grantsMetadata";
import { editPath, grantsPath } from "../../routes";
import colors from "../../styles/colors";
import { ImgTypes, getProjectImage } from "../../utils/components";
import Button, { ButtonVariants } from "../base/Button";
import PageNotFound from "../base/PageNotFound";
import Arrow from "../icons/Arrow";
import Pencil from "../icons/Pencil";
import Details from "./Details";

function Project() {
  const dataLayer = useDataLayer();

  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[params.id!];
    const chainId = grantMetadata?.metadata?.chainId;
    const owners = state.projects.owners[params.id!];
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
      id: params.id,
      chainId,
      loading,
      loadingFailed,
      bannerImg,
      logoImg,
      owners,
      currentProject: grantMetadata?.metadata,
      signerAddress: state.web3.account,
    };
  }, shallowEqual);

  useEffect(() => {
    // called twice
    // 1 - when it loads or id changes (it checks if it's cached in local storage)
    // 2 - when ipfs is initialized (it fetches it if not loaded yet)
    if (props.id !== undefined && props.currentProject === undefined) {
      dispatch(fetchGrantData(props.id, dataLayer));
    }
  }, [dispatch, props.id, props.currentProject]);

  function createEditPath() {
    const registryAddress = "0x"; // TODO: fix (technically, we dont need the regsitry address anymore)
    return editPath(props.chainId!.toString(), registryAddress, props.id!);
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
            showTabs
          />
        </>
      )}
    </div>
  );
}

export default Project;
