import { useContext, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { useCreateRoundMutation } from "../api/services/round"
import { useSaveToIPFSMutation } from "../api/services/ipfs"
import { RoundForm } from "../api/types"
import { FormContext } from "../common/FormWizard";

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(32).required(),
})

export function RoundApplicationsConfigForm(props: { initialData: any, stepper: any }) {
  const { currentStep, setCurrentStep, stepsCount, formData } = useContext(FormContext)
  const FormStepper = props.stepper

  const search = useLocation().search
  const programId = (new URLSearchParams(search)).get("programId")

  const navigate = useNavigate()
  const { handleSubmit, reset } = useForm<RoundForm>({
    resolver: yupResolver(schema),
  })

  const [saveToIPFS, {
    isLoading: isSavingToIPFS,
  }] = useSaveToIPFSMutation()

  const [createRound, {
    isLoading,
    isSuccess,
  }] = useCreateRoundMutation()

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate(`/program/${programId}`)
      }, 2000)
    }
  })

  const prev = () => setCurrentStep(currentStep - 1)

  const next: SubmitHandler<RoundForm> = async (values) => {
    try {
      const data = { ...formData, ...values }

      // Save round metadata to IPFS
      const metadataPointer = await saveToIPFS({
        content: JSON.stringify({ name: data.metadata?.name })
      }).unwrap()

      // Deploy round contract
      await createRound({
        ...data,
        votingContract: "0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6", // BulkVotingStrategy contract
        token: "0x21C8a148933E6CA502B47D729a485579c22E8A69", // DAI token
        ownedBy: programId!,
        store: {
          protocol: 1, // IPFS protocol ID is 1
          pointer: metadataPointer
        },
        operatorWallets: props.initialData.program!.operatorWallets
      }).unwrap()

      reset()

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <p className="text-base leading-6"><b>Application Form Configuration</b></p>
          <p className="mt-1 text-base text-gray-500">Define the acceptance criteria grant owners can
            provide to apply for your grant program round.</p>
          {(!programId || (!props.initialData.program && props.initialData.isProgramFetched)) &&
            <div className="mt-5">
              <span className="text-rose-600">Error: Missing or invalid Program ID!</span><br />
              <Link to="/" className="text-blue-600 underline">Please choose a Grant Program</Link>
            </div>
          }
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2  border border-grey-100 px-6 pt-6 pb-3.5">
          <form onSubmit={handleSubmit(next)}>
            <FormStepper
              currentStep={currentStep}
              stepsCount={stepsCount}
              prev={prev}
              disabledNext={isLoading || isSavingToIPFS || isSuccess || !props.initialData.program}
            />
          </form>
        </div>
      </div>
    </div>
  )
}