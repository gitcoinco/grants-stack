import { useEffect, useState } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { TextArea, TextInput, WebsiteInput } from "../grants/inputs";
import { RootState } from "../../reducers";
import { fetchGrantData } from "../../actions/grantsMetadata";
import Button, { ButtonVariants } from "./Button";
import { startIPFS, saveFileToIPFS } from "../../actions/ipfs";
import { publishGrant } from "../../actions/newGrant";
import TXLoading from "./TXLoading";

function ProjectForm({ currentGrantId }: { currentGrantId?: string }) {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(currentGrantId)];
    return {
      id: currentGrantId,
      loading: grantMetadata ? grantMetadata.loading : false,
      currentGrant: grantMetadata?.metadata,
      ipfsInitialized: state.ipfs.initialized,
      ipfsInitializationError: state.ipfs.initializationError,
      savingFile: state.ipfs.ipfsSavingFile,
      lastFileSaved: state.ipfs.lastFileSavedURL,
      txStatus: state.newGrant.txStatus,
    };
  }, shallowEqual);

  const [disabled, setDisabled] = useState(true);
  const [formInputs, setFormInputs] = useState({
    title: "",
    description: "",
    website: "",
    challenges: "",
    roadmap: "",
  });
  const publishProject = async () => {
    await dispatch(saveFileToIPFS("test.txt", JSON.stringify(formInputs)));
    dispatch(publishGrant(currentGrantId));
  };

  const handleInput = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setFormInputs({ ...formInputs, [e.target.name]: value });
    const validValues = Object.values(formInputs).filter((input) => {
      if (typeof input === "string") {
        return input.length > 0;
      }
      return false;
    });

    setDisabled(validValues.length < 5 || !props.ipfsInitialized);
  };

  // TODO: feels like this could be extracted to a component
  useEffect(() => {
    dispatch(startIPFS());
    if (props.ipfsInitialized && currentGrantId) {
      dispatch(fetchGrantData(Number(currentGrantId)));
    }
    const { currentGrant } = props;
    if (currentGrant) {
      setFormInputs({
        title: currentGrant.title,
        description: currentGrant.description,
        website: currentGrant.website,
        challenges: currentGrant.challenges,
        roadmap: currentGrant.roadmap,
      });
    }
  }, [dispatch, props.ipfsInitialized, currentGrantId, props.currentGrant]);

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
    <div className="border border-solid border-tertiary-text rounded text-primary-text p-4">
      <form onSubmit={(e) => e.preventDefault()}>
        <TextInput
          label="Project Name"
          name="title"
          placeholder="Stop destruction in Ukraine"
          value={formInputs.title}
          changeHandler={(e) => handleInput(e)}
        />
        <WebsiteInput
          label="Project Website"
          name="website"
          value={formInputs.website}
          changeHandler={(e) => handleInput(e)}
        />
        <TextArea
          label="Project Description"
          name="description"
          placeholder="What is the project about and what kind of impact does it aim to have?"
          value={formInputs.description}
          changeHandler={(e) => handleInput(e)}
        />
        <TextArea
          label="Project Roadmap"
          name="roadmap"
          placeholder="What are the dependencies and project goals? What are the timelines per milestone or deliverable?"
          value={formInputs.roadmap}
          changeHandler={(e) => handleInput(e)}
        />
        <TextArea
          label="Project Challenges"
          name="challenges"
          placeholder="What are some of the risks you see ahead? How do you plan to prepare?"
          value={formInputs.challenges}
          changeHandler={(e) => handleInput(e)}
        />
        <div className="flex w-full justify-end mt-6">
          <Button
            disabled={disabled}
            variant={ButtonVariants.primary}
            onClick={publishProject}
          >
            Save &amp; Publish
          </Button>
        </div>
      </form>
      {props.savingFile && !props.lastFileSaved && (
        <p>Your file is being saved to IPFS</p>
      )}
      {!props.savingFile && props.lastFileSaved && (
        <>
          <p>
            Your file has being saved to IPFS and can be accessed here:{" "}
            {props.lastFileSaved}
          </p>
          {props.txStatus && <TXLoading status={props.txStatus} />}
        </>
      )}
    </div>
  );
}

export default ProjectForm;
