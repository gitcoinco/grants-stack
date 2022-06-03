import { useForm, SubmitHandler } from "react-hook-form"
import tw from "tailwind-styled-components"

import { useWeb3 } from "../common/ProtectedRoute"


type FormData = {
  name: string,
  operatorWallet1: string,
  operatorWallet2: string,
  operatorWallet3: string
}

type TextInputProps = {
  $hasError: boolean
}

const TextInput = tw.input<TextInputProps>`
  md:w-96
  md:h-14
  w-full
  border-4
  border-black
  px-2
  my-4
  text-2xl
  ${(p: TextInputProps) => (
    p.$hasError ? "focus:outline-none focus:ring focus:ring-rose-600" : ""
  )}
`

const Button = tw.button`
  md:w-64
  md:h-14
  w-full
  rounded-2xl
  border-4
  border-black
  my-6
  hover:bg-gray-200
  text-2xl
`

export default function CreateProgram() {

  const { account } = useWeb3()
  const { register, formState, handleSubmit } = useForm<FormData>()
  const { errors } = formState

  const onSubmit: SubmitHandler<FormData> = data => setTimeout(() => console.log(data), 2000);

  return (
    <div className="container mx-auto h-screen px-4 py-16">
      <header>
        <h1 className="text-5xl mb-16">Create a Program</h1>
      </header>
      <main className="">
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            {...register("name", { required: true })}
            $hasError={errors.name}
            type="text"
            placeholder="Program name" />
          <br />
          <TextInput
            {...register("operatorWallet1", { required: true })}
            $hasError={errors.operatorWallet1}
            type="text"
            placeholder="Operator wallet 1"
            defaultValue={account} />
          <br />
          <TextInput
            {...register("operatorWallet2")}
            type="text"
            placeholder="Operator wallet 2" />
          <br />
          <TextInput
            {...register("operatorWallet3")}
            type="text"
            placeholder="Operator wallet 3" />
          <br />
          <Button type="submit">Save</Button>
        </form>
      </main>
    </div>
  )
}