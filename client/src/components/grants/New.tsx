import React, { useState, useEffect } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { TextInput, RadioInput } from "./inputs";
import { startIPFS, saveFileToIPFS } from "../../actions/ipfs";
import { RootState } from "../../reducers";
import GrantPreview from "./Preview";

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
  name: string;
};
type RadioInputProps = {
  name: string;
  value: boolean;
};

function NewGrant() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startIPFS());
  });

  const props = useSelector(
    (state: RootState) => ({
      ipfsLastFileSavedURL: state.ipfs.lastFileSavedURL,
      ipfsInitialized: state.ipfs.initialized,
    }),
    shallowEqual
  );

  const textInputs: TextInputProps[] = [
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

  const radioInputs: RadioInputProps[] = [
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

  const saveGrantDataToIPFS = () => {
    dispatch(saveFileToIPFS("test.txt", JSON.stringify(formInputs)));
  };

  const [disabled, setDisabled] = useState(true);

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    let value: boolean | string;
    if (event.target.name === "receivedFunding") {
      value = event.target.value === "true";
    } else {
      value = event.target.value;
    }
    setFormInputs({ ...formInputs, [event.target.name]: value });
  }

  useEffect(() => {
    const validValues = Object.values(formInputs).filter((value) => {
      if (typeof value === "string") {
        return value.length > 0;
      }
      return false;
    });
    setDisabled(validValues.length !== 5 || !props.ipfsInitialized);
  }, [formInputs, props.ipfsInitialized]);

  if (props.ipfsLastFileSavedURL) {
    // FIXME: we could check something like state.newGrant.saved to see if it has been saved
    return <GrantPreview grant={formInputs} url={props.ipfsLastFileSavedURL} />;
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {textInputs.map((input) => (
        <TextInput
          key={input.name}
          label={input.label}
          name={input.name}
          changeHandler={(e) => handleInput(e)}
        />
      ))}
      Have you raised external funding?
      {formInputs.receivedFunding ? "Yes" : "No"}
      {radioInputs.map((input) => (
        <RadioInput
          key={`radio-${input.value}`}
          name={input.name}
          value={input.value}
          changeHandler={(e) => handleInput(e)}
        />
      ))}
      <button type="button" disabled={disabled} onClick={saveGrantDataToIPFS}>
        Save Grant Data
      </button>
    </form>
  );
}

export default NewGrant;
