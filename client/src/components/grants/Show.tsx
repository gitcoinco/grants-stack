import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchGrantData } from "../../actions/grantsMetadata";
import { loadProjects } from "../../actions/projects";
import { addressesByChainID } from "../../contracts/deployments";
import { global } from "../../global";
import { RootState } from "../../reducers";
import { Status } from "../../reducers/grantsMetadata";
import { editPath, grantsPath } from "../../routes";
import colors from "../../styles/colors";
import { getProjectImage, ImgTypes } from "../../utils/components";
import Button, { ButtonVariants } from "../base/Button";
import Arrow from "../icons/Arrow";
import Pencil from "../icons/Pencil";
import Details from "./Details";

const formattedDate = (timestamp: number | undefined) =>
  new Date((timestamp ?? 0) * 1000).toLocaleString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function Project() {
  const [updatedAt, setUpdatedAt] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const dispatch = useDispatch();
  // FIXME: params.id doesn't change if the location hash is changed manually.
  const params = useParams();

  const props = useSelector((state: RootState) => {
    const { chainID } = state.web3;
    const addresses = addressesByChainID(chainID!);
    if (
      params.registryAddress?.toLowerCase() !==
      addresses.projectRegistry?.toLowerCase()
    ) {
      throw new Error("Invalid registry address");
    }
    const fullId = `${params.chainId}:${params.registryAddress}:${params.id}`;

    const grantMetadata = state.grantsMetadata[fullId];

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
      id: fullId,
      loading,
      bannerImg,
      logoImg,
      currentProject: grantMetadata?.metadata,
      projectEvents: state.projects.events[params.id!],
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
    let unloaded = false;
    console.log("DASA", props.projectEvents);
    if (props.projectEvents !== undefined) {
      const { createdAtBlock, updatedAtBlock } = props.projectEvents;
      if (createdAtBlock !== undefined) {
        global.web3Provider?.getBlock(createdAtBlock).then((data) => {
          if (!unloaded) {
            setCreatedAt(formattedDate(data?.timestamp));
          }
        });
      }

      if (updatedAtBlock !== undefined) {
        global.web3Provider?.getBlock(updatedAtBlock).then((data) => {
          if (!unloaded) {
            setUpdatedAt(formattedDate(data?.timestamp));
          }
        });
      }
    } else {
      // If user reloads Show projects will not exist
      dispatch(loadProjects(true));
    }

    return () => {
      unloaded = true;
    };
  }, [props.id, props.projectEvents, global, dispatch]);

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
                to={editPath(
                  props.id.split(":")[0],
                  props.id.split(":")[1],
                  props.id.split(":")[2]
                )}
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
            showApplications
          />
        </>
      )}
    </div>
  );
}

export default Project;
