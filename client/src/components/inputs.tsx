type InputProps = {
  label: string,
  name: string,
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

type RadioInputProps = {
  name: string
  value: boolean
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function TextInput(props: InputProps) {
  return (
    <div style={{display: "block"}}>
      <label>{props.label}</label>
      <input
        style={{display: "block"}}
        type='text'
        name={props.name}
        onChange={props.changeHandler}
      />
    </div>
  )
}

export function RadioInput(props: RadioInputProps) {
  return (
    <div style={{display: "block"}}>
      <input
        type='radio'
        name={props.name}
        value={String(props.value)}
        onChange={props.changeHandler}
      /> {props.value ? 'Yes': 'No'}
    </div>
  )
}