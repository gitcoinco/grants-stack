import React, { useState } from 'react'
import { TextInput, RadioInput } from './inputs'

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

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    let value: boolean | string
    if (event.target.name === 'receivedFunding') {
      value = event.target.value === 'true'
    } else {
      value = event.target.value
    }
    setFormInputs({...formInputs,[event.target.name] : value});
  }

  return (
    <form>
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
    </form>
  )
}