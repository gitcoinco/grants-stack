type SpinnerProps = {
  text: string
}

export function Spinner(props: SpinnerProps) {
  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <p>{props.text}</p>
      </div>
    </div>
  )
}