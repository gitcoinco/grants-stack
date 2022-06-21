import { ReactComponent as SpinnerLogo } from "../../assets/spinner.svg";


type SpinnerProps = {
  text: string
}

export function Spinner(props: SpinnerProps) {
  return (
    <div className="grid">
      <SpinnerLogo className="w-12 mb-4 mx-auto" />
      <p className="mx-auto">{ props.text }</p>
    </div>
  )
}