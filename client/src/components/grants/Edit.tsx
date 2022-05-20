import { useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import ProjectForm from "../base/ProjectForm";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";

function EditProject() {
  const params = useParams();
  const dispatch = useDispatch();

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

  // TODO: feels like this could be extracted to a component
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
  // /TODO

  return (
    <>
      <h3>Edit a Project</h3>
      <ProjectForm existingGrantId={props.id} />
    </>
  );
}

export default EditProject;
