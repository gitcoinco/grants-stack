import { useForm, SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

import { useWeb3 } from "../common/ProtectedRoute"
import { useCreateProgramMutation } from "../api/services/program"
import { useSaveToIPFSMutation } from "../api/services/ipfs"
import { TextInput, Button } from "../common/styles"


type FormData = {
  name: string;
  operatorWallet1: string;
  operatorWallet2: string;
  operatorWallet3: string;
}

export default function CreateProgram() {
  const [saveToIPFS, {
    error: ipfsError,
    isError: isIPFSError,
    isLoading: isSavingToIPFS,
    isSuccess: isSavedToIPFS
  }] = useSaveToIPFSMutation()

  const [createProgram, {
    error: programError,
    isLoading,
    isSuccess,
    isError: isProgramError
  }] = useCreateProgramMutation()

  const { account } = useWeb3()
  const navigate = useNavigate()
  const { register, formState, handleSubmit } = useForm<FormData>()
  const { errors } = formState

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate("/")
      }, 2000)
    }
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Save program metadata to IPFS
      const metadataPointer = await saveToIPFS({
        content: JSON.stringify({ name: data.name })
      }).unwrap()

      // Deploy program contract
      await createProgram({
        store: {
          protocol: 1, // IPFS protocol ID is 1
          pointer: metadataPointer
        },
        operatorWallets: Object.entries(data).slice(1, 4).map(entry => entry[1])
      }).unwrap()

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="container mx-auto h-screen px-4 py-16">
      <header>
        <h1 className="text-5xl mb-16">Create a Grant Program</h1>
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
          <Button type="submit" disabled={isLoading || isSavingToIPFS || isSuccess}>
            {isLoading || isSavingToIPFS ? "Creating..." : "Create"}
          </Button>

          {/* Display relevant status updates */}
          {isSavingToIPFS && <p className="text-orange-500">⌛ Saving metadata in IPFS...</p>}
          {isSavedToIPFS && <p className="text-green-600">✅ Metadata saved to IPFS!</p>}
          {isLoading && <p className="text-orange-500">⌛ Deploying contract to Goerli + awaiting 1 confirmation...</p>}
          {isSuccess && <p className="text-green-600">✅ Congratulations! your grant program was successfully created!</p>}
          {(isIPFSError || isProgramError) && <p className="text-rose-600">Error: {JSON.stringify(ipfsError || programError)}!</p>}
        </form>
      </main>
    </div>
  )
}