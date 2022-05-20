import React, { useState, useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { TextInput, RadioInput } from "../grants/inputs";
import { startIPFS, saveFileToIPFS } from "../../actions/ipfs";
import { RootState } from "../../reducers";
import GrantPreview from "../grants/Preview";
import { Metadata } from "../../types";
import Button from "./Button";

export interface FormInputs {
  title: string;
  description: string;
  website: string;
  chain: string;
  wallet: string;
  receivedFunding?: boolean;
}

type TextInputProps = {
  label: string;
  name: keyof Metadata;
  value?: string;
};
type RadioInputProps = {
  name: string;
  value: boolean;
};

function ProjectForm({ existingGrantId }: { existingGrantId?: string }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startIPFS());
  });

  const props = useSelector((state: RootState) => {
    const grantMetadata = state.grantsMetadata[Number(existingGrantId)];
    return {
      currentGrant: grantMetadata,
      ipfsLastFileSavedURL: state.ipfs.lastFileSavedURL,
      ipfsInitialized: state.ipfs.initialized,
      newFileSaved: state.ipfs.newFileSaved,
    };
  }, shallowEqual);

  const defaultTextInputs: TextInputProps[] = [
    {
      label: "Title",
      name: "title",
    },
    {
      label: "Description",
      name: "description",
    },
    {
      label: "Website",
      name: "website",
    },
    {
      label: "Chain",
      name: "chain",
    },
    {
      label: "Wallet",
      name: "wallet",
    },
  ];

  const defaultRadioInputs: RadioInputProps[] = [
    {
      name: "receivedFunding",
      value: true,
    },
    {
      name: "receivedFunding",
      value: false,
    },
  ];

  const [formInputs, setFormInputs] = useState<FormInputs>({
    title: "",
    description: "",
    website: "",
    chain: "",
    wallet: "",
    receivedFunding: false,
  });

  const [disabled, setDisabled] = useState(true);
  const [radioInputs, setRadioInputs] = useState(defaultRadioInputs);
  const [textInputs, setTextInputs] = useState(defaultTextInputs);

  const saveGrantDataToIPFS = () => {
    dispatch(saveFileToIPFS("test.txt", JSON.stringify(formInputs)));
  };

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    let value: boolean | string;
    if (event.target.name === "receivedFunding") {
      value = event.target.value === "true";
    } else {
      value = event.target.value;
    }

    const inputs = textInputs.map((input: TextInputProps) => {
      const currentInput = input;
      if (
        input.name !== event.target.name ||
        event.target.name === "receivedFunding"
      ) {
        return input;
      }

      currentInput.value = event.target.value;
      return currentInput;
    });
    setTextInputs(inputs);
    setFormInputs({ ...formInputs, [event.target.name]: value });
  }

  useEffect(() => {
    if (props?.currentGrant?.metadata) {
      const { metadata } = props.currentGrant;
      const existingTextInputs = textInputs.map((input: TextInputProps) => {
        if (input.name === "receivedFunding" || input.name === "id") {
          return input;
        }
        return {
          ...input,
          value: metadata[input.name],
        };
      });

      setTextInputs(existingTextInputs);
    }
  }, []);

  useEffect(() => {
    const validValues = Object.values(formInputs).filter((value) => {
      if (typeof value === "string") {
        return value.length > 0;
      }
      return false;
    });
    setDisabled(validValues.length !== 5 || !props.ipfsInitialized);
    setRadioInputs(defaultRadioInputs);
  }, [formInputs, props.ipfsInitialized]);

  if (props.newFileSaved) {
    // FIXME: we could check something like state.newGrant.saved to see if it has been saved
    return <GrantPreview grant={formInputs} />;
  }

  return (
    <form className="w-1/2" onSubmit={(e) => e.preventDefault()}>
      {textInputs.map((input: TextInputProps) => (
        <TextInput
          key={input.name}
          label={input.label}
          name={input.name}
          value={input.value}
          changeHandler={(e) => handleInput(e)}
        />
      ))}
      Have you raised external funding?
      {formInputs.receivedFunding ? "Yes" : "No"}
      {radioInputs.map((input: RadioInputProps) => (
        <RadioInput
          key={`radio-${input.value}`}
          name={input.name}
          value={input.value}
          changeHandler={(e) => handleInput(e)}
        />
      ))}
      <Button
        disabled={disabled}
        variant="outline"
        onClick={saveGrantDataToIPFS}
      >
        Save Data
      </Button>
    </form>
  );
}

export default ProjectForm;
