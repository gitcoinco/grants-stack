import React, { useState, useEffect } from 'react'
import { TextInput, RadioInput } from './inputs'
import { startIPFS, saveFileToIPFS } from "./../actions/ipfs";
import { RootState } from '../reducers';
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';
import { Dispatch } from 'redux';

interface FormInputs {
  title: string
  description: string
  website: string
  chain: string
  wallet: string
  receivedFunding?: boolean
}

type TextInputProps = {
  label: string
  name: string
}
type RadioInputProps = {
  name: string
  value: boolean
}

export function CreatGrant() {
  useEffect(() => {
    dispatch(startIPFS());
  });

  const props = useSelector((state: RootState) => ({
    ipfsLastFileSavedURL: state.ipfs.lastFileSavedURL,
    ipfsInitialized: state.ipfs.initialized,
  }), shallowEqual);

  const dispatch = useDispatch();
  const saveGrantDataToIPFS = () => {
    dispatch(saveFileToIPFS("test.txt", JSON.stringify(formInputs)));
  }
  

  const textInputs: TextInputProps[] = [
    {
      label: 'Title',
      name:  'title',
    },
    {
      label: 'Description',
      name:  'description',
    },
    {
      label: 'Website',
      name:  'website',
    },
    {
      label: 'Chain',
      name:  'chain',
    },
    {
      label: 'Wallet',
      name:  'wallet',
    }
  ]


  const radioInputs: RadioInputProps[] = [
    {
      name: 'receivedFunding',
      value: true
    },
    {
      name: 'receivedFunding',
      value: false
    }
  ]
  const [formInputs, setFormInputs] = useState<FormInputs>({
    title: '',
    description: '',
    website: '',
    chain: '',
    wallet: '',
    receivedFunding: false
  })
  const [disabled, setDisabled] = useState(true)

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    let value: boolean | string
    if (event.target.name === 'receivedFunding') {
      value = event.target.value === 'true'
    } else {
      value = event.target.value
    }
    setFormInputs({...formInputs,[event.target.name] : value});
  }

  useEffect(() => {
    const validValues = Object.values(formInputs).filter((value) => {
      if (typeof value === 'string') {
        return value.length > 0
      }
    })
    setDisabled(validValues.length !== 5 || !props.ipfsInitialized)
  }, [formInputs])

  if (props.ipfsLastFileSavedURL) {
    return (
      <div>Your grant data has been saved to IPFS! And can be accessed here: <a target="_blank" rel="noreferrer" href={props.ipfsLastFileSavedURL}>{props.ipfsLastFileSavedURL}</a></div>
    )
  }
  return (
    <form onSubmit={e => e.preventDefault()}>
      {textInputs.map((input) => (
        <TextInput
          key={input.name}
          label={input.label}
          name={input.name}
          changeHandler={handleInput}
        />
      ))}
      <label>Have you raised external funding? {formInputs.receivedFunding ? 'Yes': 'No'}</label>
      {radioInputs.map((input, i) => (
        <RadioInput
          key={`radio-${input.name}-${i}`}
          name={input.name}
          value={input.value}
          changeHandler={handleInput}
        />
      ))}
      <button
        disabled={disabled}
        onClick={saveGrantDataToIPFS}
      >
        Save Grant Data
      </button>
    </form>
  )
}