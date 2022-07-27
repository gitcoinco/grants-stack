import { useForm, SubmitHandler, useFieldArray } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { PlusSmIcon, TrashIcon, XIcon } from "@heroicons/react/solid"

import { useWeb3 } from "../common/ProtectedRoute"
import { useCreateProgramMutation } from "../api/services/program"
import { useSaveToIPFSMutation } from "../api/services/ipfs"
import { Input, Button } from "../common/styles"
import Navbar from "../common/Navbar"


type FormData = {
  name: string;
  operators: [{ wallet: string }];
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
  const { register, control, formState, handleSubmit } = useForm<FormData>({
    defaultValues: {
      operators: [{ wallet: account }]
    }
  })
  const { fields, append, remove } = useFieldArray({
    name: "operators",
    control
  })

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
        content: { name: data.name },
        metadata: {
          name: "program-metadata"
        }
      }).unwrap()

      // Deploy program contract
      await createProgram({
        store: {
          protocol: 1, // IPFS protocol ID is 1
          pointer: metadataPointer
        },
        operatorWallets: data.operators.map(op => op.wallet)
      }).unwrap()

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto h-screen px-4 py-16">
        <header>
          <div className="flow-root">
            <h1 className="float-left text-[32px] mb-7">Create Grant Program</h1>
            <Button
              type="button"
              $variant="outline"
              className="inline-flex float-right py-2 px-4 text-sm text-grey-400"
              onClick={() => navigate('/')}>
              <XIcon className="h-5 w-5 mr-1" aria-hidden="true" />
              Exit
            </Button>
          </div>
        </header>

        <main className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-base leading-6"><b>Details</b></p>
            <p className="mt-1 text-base text-gray-500">
              Provide the name of the program as well as the round operators' wallet addresses.
            </p>

            <div className="mt-5">
              {/* Display relevant status updates */}
              {isSavingToIPFS && <p className="text-orange-500">⌛ Saving metadata in IPFS...</p>}
              {isSavedToIPFS && <p className="text-green-600">✅ Metadata saved to IPFS!</p>}
              {isLoading && <p className="text-orange-500">⌛ Deploying contract to Goerli + awaiting 1 confirmation...</p>}
              {isSuccess && <p className="text-green-600">✅ Congratulations! your grant program was successfully created!</p>}
              {(isIPFSError || isProgramError) && <p className="text-rose-600">Error: {JSON.stringify(ipfsError || programError)}!</p>}
            </div>

          </div>

          <div className="col-span-2">

            <form
              className="grid grid-cols-1 gap-4 sm:items-start sm:border sm:border-gray-200 py-5 sm:px-10"
              onSubmit={handleSubmit(onSubmit)}
            >

              <div className="sm:flex sm:flex-rows">
                <div className="sm:basis-2/3">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700">Name</label>
                  <Input
                    {...register("name", { required: true })}
                    $hasError={errors.name}
                    type="text"
                    disabled={isLoading}
                    placeholder="Program name"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name?.message}</p>}
                </div>
              </div>


              <div>
                <label htmlFor="operators" className="block text-xs font-medium text-gray-700">
                  Additional Operator Wallets
                </label>

                <ul>
                  {fields.map((item, index) => (
                    <li key={item.id} className="flex flex-rows">
                      <Input
                        {...register(`operators.${index}.wallet` as "operators.0.wallet")}
                        type="text"
                        disabled={isLoading}
                        className="basis:3/4 md:basis-2/3"
                        placeholder="Enter wallet address"
                      />

                      <div className="basis-1/4 ml-3">
                        <Button
                          type="button"
                          $variant="outline"
                          className="inline-flex items-center px-2.5 py-2 mt-1 border shadow-sm text-xs font-medium rounded text-gray-500 bg-white"
                          onClick={() => remove(index)}
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-2 mb-6 text-sm text-gray-500">
                  You can't edit operator wallets after the grant is deployed.
                </p>

                <Button
                  type="button"
                  $variant="outline"
                  className="inline-flex items-center px-4 py-1.5 border border-grey-100 shadow-sm text-xs font-medium rounded text-grey-500 bg-white"
                  onClick={() => {
                    append({ wallet: "" });
                  }}
                >
                  <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  Add Operator
                </Button>

              </div>

              <div>
                <Button className="float-right" type="submit" disabled={isLoading || isSavingToIPFS || isSuccess}>
                  {isLoading || isSavingToIPFS ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>

        </main>
      </div>
    </>
  )
}