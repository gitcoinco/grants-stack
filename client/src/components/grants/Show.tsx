import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { loadAllChainsProjects } from "../../actions/projects";
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
import ProjectRegistryABI from "../../contracts/abis/ProjectRegistry.json";
import { addressesByChainID } from "../../contracts/deployments";
import PageNotFound from "../base/PageNotFound";

function Project() {
  const { data: signer } = useSigner();
  const [owners, setOwners] = useState<string[]>([]);
  const [signerAddress, setSignerAddress] = useState<null | string>(null);

  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const fullId = `${params.chainId}:${params.registryAddress}:${params.id}`;

    const grantMetadata = state.grantsMetadata[fullId];

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
      currentProject: grantMetadata?.metadata,
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
  }, [props.id, props.projectEvents, global, dispatch]);

  // Fetch the project owners
  useEffect(() => {
    if (!signer) {
      return;
    }

    const fetchOwners = async (chainId: number, projectId: string) => {
      const addresses = addressesByChainID(chainId);

      const projectRegistry = new ethers.Contract(
        addresses.projectRegistry,
        ProjectRegistryABI,
        signer
      );

      return projectRegistry.getProjectOwners(projectId);
    };

    fetchOwners(Number(params.chainId), params.id!).then((newOwners) => {
      setOwners(newOwners);
    });
  }, [props.id, signer, global, dispatch]);

  // Set the signer address
  useEffect(() => {
    signer?.getAddress().then((address) => setSignerAddress(address));
  }, [signer]);

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
            {props.id && owners.includes(signerAddress!) && (
              <Link to={createEditPath()} className="sm:w-auto mx-w-full ml-0">
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
