import { useForm, SubmitHandler } from "react-hook-form"
import tw from "tailwind-styled-components"

import { useWeb3 } from "../common/ProtectedRoute"
import { useCreateProgramMutation } from "../api/programService"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"


type FormData = {
  name: string;
  operatorWallet1: string;
  operatorWallet2: string;
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
    p.$hasError ? "focus:outline-none focus:border-none focus:ring focus:ring-rose-600" : ""
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
  text-2xl
  hover:bg-gray-200
  disabled:bg-slate-50
  disabled:text-slate-500
  disabled:border-slate-200
  disabled:shadow-none
`

export default function CreateProgram() {
  const [createProgram, { error, isLoading, isSuccess, isError }] = useCreateProgramMutation()
  const { account } = useWeb3()
  const navigate = useNavigate()
  const { register, formState, handleSubmit } = useForm<FormData>()
  const { errors } = formState

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const fulfilled = await createProgram({
        name: data.name,
        operatorWallets: Object.entries(data).slice(1, 4).map(entry => entry[1])
      }).unwrap()
      console.log(fulfilled)
    } catch (e) {
      console.error(e)
    }
  }

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
            disabled={isLoading}
            placeholder="Program name" />
          <br />
          <TextInput
            {...register("operatorWallet1", { required: true })}
            $hasError={errors.operatorWallet1}
            type="text"
            disabled={isLoading}
            placeholder="Operator wallet 1"
            defaultValue={account} />
          <br />
          <TextInput
            {...register("operatorWallet2")}
            type="text"
            disabled={isLoading}
            placeholder="Operator wallet 2" />
          <br />
          <TextInput
            {...register("operatorWallet3")}
            type="text"
            disabled={isLoading}
            placeholder="Operator wallet 3" />
          <br />
          <Button type="submit" disabled={isLoading || isSuccess}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
          {isSuccess && <p className="text-green-600">Congratulations! your grant program was successfully created!</p>}
          {isError && <p className="text-rose-600">Error: {JSON.stringify(error)}!</p>}
        </form>
      </main>
    </div>
  )
}