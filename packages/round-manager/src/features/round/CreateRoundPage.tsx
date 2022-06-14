import { useEffect } from "react"
import { Controller, useForm, SubmitHandler } from "react-hook-form"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Datetime from "react-datetime"
import "react-datetime/css/react-datetime.css";

import { useWeb3 } from "../common/ProtectedRoute"
import { useCreateRoundMutation } from "../api/services/round"
import { useSaveToIPFSMutation } from "../api/services/ipfs"
import { useListProgramsQuery } from "../api/services/program"
import { Round } from "../api/types"
import { TextInput, Button } from "../common/styles"


export default function CreateRound() {
  const { account } = useWeb3()
  const search = useLocation().search
  const programId = (new URLSearchParams(search)).get("programId")

  const { program, isSuccess: isProgramFetched } = useListProgramsQuery(account, {
    selectFromResult: ({ data, isSuccess }) => ({
      program: data?.find((program) => program.id === programId),
      isSuccess
    })
  })
  const navigate = useNavigate()
  const { control, register, handleSubmit, formState: { errors } } = useForm<Round>()

  const [saveToIPFS, {
    error: ipfsError,
    isError: isIPFSError,
    isLoading: isSavingToIPFS,
    isSuccess: isSavedToIPFS
  }] = useSaveToIPFSMutation()

  const [createRound, {
    error: roundError,
    isLoading,
    isSuccess,
    isError: isRoundError
  }] = useCreateRoundMutation()

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate(`/program/${programId}`)
      }, 2000)
    }
  })

  const onSubmit: SubmitHandler<Round> = async (data) => {
    try {
      // Save round metadata to IPFS
      const metadataPointer = await saveToIPFS({
        content: JSON.stringify({ name: data.metadata?.name })
      }).unwrap()

      // Deploy round contract
      await createRound({
        ...data,
        votingContract: "0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6", // BulkVote contract
        token: "0x21C8a148933E6CA502B47D729a485579c22E8A69", // DAI token
        ownedBy: programId!,
        store: {
          protocol: 1, // IPFS protocol ID is 1
          pointer: metadataPointer
        },
        operatorWallets: program!.operatorWallets
      }).unwrap()

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="container mx-auto h-screen px-4 py-16">
      <header>
        <h1 className="text-5xl mb-16">Create a Round</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit(onSubmit)}>
          {(!programId || (!program && isProgramFetched)) &&
            <div>
              <span className="text-rose-600">Error: Missing or invalid Program ID!</span><br />
              <Link to="/" className="text-blue-600 underline">Please choose a Grant Program</Link>
            </div>
          }
          <TextInput
            {...register("metadata.name", { required: true })}
            $hasError={errors.metadata?.name}
            type="text"
            disabled={isLoading}
            placeholder="Round name" />
          <br />
          <Controller
            control={control}
            name="applicationStartTime"
            render={({ field }) => (
              <Datetime
                {...field}
                closeOnSelect
                inputProps={{
                  placeholder: "Application Start Date",
                  required: true,
                  className: "md:w-96 md:h-14 w-full border-4 border-black px-2 mt-4 text-2xl"
                }}
              />
            )} />
          <br />
          <Controller
            control={control}
            name="startTime"
            render={({ field }) => (
              <Datetime
                {...field}
                closeOnSelect
                inputProps={{
                  placeholder: "Round Start Date",
                  required: true,
                  className: "md:w-96 md:h-14 w-full border-4 border-black px-2 my-4 text-2xl"
                }}
              />
            )} />
          <br />
          <Controller
            control={control}
            name="endTime"
            render={({ field }) => (
              <Datetime
                {...field}
                closeOnSelect
                inputProps={{
                  placeholder: "Round End Date",
                  required: true,
                  className: "md:w-96 md:h-14 w-full border-4 border-black px-2 text-2xl"
                }}
              />
            )} />
          <br />
          <Button type="submit" disabled={isLoading || isSavingToIPFS || isSuccess || !program}>
            {isLoading || isSavingToIPFS ? "Deploying..." : "Deploy Round"}
          </Button>

          {/* Display relevant status updates */}
          {isSavingToIPFS && <p className="text-orange-500">⌛ Saving metadata in IPFS...</p>}
          {isSavedToIPFS && <p className="text-green-600">✅ Metadata saved to IPFS!</p>}
          {isLoading && <p className="text-orange-500">⌛ Deploying contract to Goerli + awaiting 1 confirmation...</p>}
          {isSuccess && <p className="text-green-600">✅ Congratulations! your round was successfully created!</p>}
          {(isIPFSError || isRoundError) && <p className="text-rose-600">Error: {JSON.stringify(ipfsError || roundError)}!</p>}
        </form>
      </main>
    </div >
  )
}