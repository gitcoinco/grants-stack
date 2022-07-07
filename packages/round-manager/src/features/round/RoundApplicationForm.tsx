import { useContext, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { useCreateRoundMutation } from "../api/services/round"
import { useSaveToIPFSMutation } from "../api/services/ipfs"
import { Round } from "../api/types"
import { FormContext } from "../common/FormWizard"
import { Input } from "../common/styles"
import { generateApplicationSchema } from "../api/utils"


const ValidationSchema = yup.object().shape({
  applicationMetadata: yup.object({
    walletAddress: yup.string().min(40, "Please enter a valid wallet address."),
    project: yup.object({
      name: yup.string(),
      description: yup.string(),
      website: yup.string(),
      twitter: yup.string(),
      github: yup.string(),
    }),
    contact: yup.object({
      name: yup.string(),
      email: yup.string(),
      teamDescription: yup.string(),
    }),
    grant: yup.object({
      fundingRequested: yup.string(),
      budgetBreakdown: yup.string(),
    }),
    customQuestion: yup.object({
      label: yup.string(),
      helper: yup.string(),
    })
  })
})


export function RoundApplicationForm(props: { initialData: any, stepper: any }) {
  const { currentStep, setCurrentStep, stepsCount, formData } = useContext(FormContext)
  const FormStepper = props.stepper

  const search = useLocation().search
  const programId = (new URLSearchParams(search)).get("programId")

  const navigate = useNavigate()
  const { register, reset, handleSubmit, formState: { errors } } = useForm<Round>({
    defaultValues: formData,
    resolver: yupResolver(ValidationSchema),
  })

  const [saveToIPFS, {
    error: ipfsError,
    isLoading: isSavingToIPFS,
    isSuccess: isSavedToIPFS,
    isError: isIPFSError,
  }] = useSaveToIPFSMutation()

  const [createRound, {
    error: roundError,
    isLoading,
    isSuccess,
    isError: isRoundError,
  }] = useCreateRoundMutation()

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate(`/program/${programId}`)
      }, 2000)
    }
  })

  const prev = () => setCurrentStep(currentStep - 1)

  const next: SubmitHandler<Round> = async (values) => {
    try {
      const data = { ...formData, ...values }

      // Save round and application metadata to IPFS
      const [
        metadataPointer,
        applicationMetadataPointer
      ] = await Promise.all([
        saveToIPFS({
          content: data.metadata,
          metadata: {
            name: "round-metadata"
          }
        }).unwrap(),
        saveToIPFS({
          content: {
            lastUpdatedOn: Date.now(),
            applicationSchema: generateApplicationSchema(data.applicationMetadata)
          },
          metadata: {
            name: "application-schema"
          }
        }).unwrap()
      ])

      // Deploy round contract
      await createRound({
        ...data,
        votingStrategy: "0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6", // BulkVotingStrategy contract
        token: "0x21C8a148933E6CA502B47D729a485579c22E8A69", // DAI token
        ownedBy: programId!,
        store: {
          protocol: 1, // IPFS protocol ID is 1
          pointer: metadataPointer
        },
        applicationStore: {
          protocol: 1, // IPFS protocol ID is 1
          pointer: applicationMetadataPointer
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

          {/* Display relevant status updates */}
          <div className="mt-5">
            {isSavingToIPFS && <p className="text-orange-500">⌛ Saving metadata in IPFS...</p>}
            {isSavedToIPFS && <p className="text-green-600">✅ Metadata saved to IPFS!</p>}
            {isLoading && <p className="text-orange-500">⌛ Deploying contract to Goerli + awaiting 1 confirmation...</p>}
            {isSuccess && <p className="text-green-600">✅ Congratulations! your round was successfully created!</p>}
            {(isIPFSError || isRoundError) && <p className="text-rose-600">Error: {JSON.stringify(ipfsError || roundError)}!</p>}
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2  border border-grey-100 px-6 pt-6 pb-3.5">
          <form onSubmit={handleSubmit(next)}>
            <p className="mt-4 mb-2"><b>Default information</b></p>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <Input
                  type="text"
                  value="Project Name"
                  disabled
                  $disabled
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <Input
                  type="text"
                  value="Wallet Address"
                  disabled
                  $disabled
                />
              </div>
            </div>
            <p className="text-xs">This information will be collected from all Owners applying to the Grant.</p>
            <hr className="my-6" />

            <p className="mt-4 mb-2"><b>Add Additional Questions</b></p>

            {/* PROJECT INFO */}

            <p className="mt-4 mb-2"><b>Project</b></p>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.project.description"
                  className="block text-xs font-medium text-gray-700">
                  Description
                </label>
                <Input
                  {...register("applicationMetadata.project.description")}
                  $hasError={errors.applicationMetadata?.project?.description}
                  type="text"
                  placeholder='e.g "Tell us more about your project"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.project?.description
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.project?.description?.message}
                  </p>
                }
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.project.website"
                  className="block text-xs font-medium text-gray-700">
                  Website
                </label>
                <Input
                  {...register("applicationMetadata.project.website")}
                  $hasError={errors.applicationMetadata?.project?.website}
                  type="text"
                  placeholder='e.g "https://www.project-website-url.com"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.project?.website
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.project?.website?.message}
                  </p>
                }
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.project.twitter"
                  className="block text-xs font-medium text-gray-700">
                  Twitter
                </label>
                <Input
                  {...register("applicationMetadata.project.twitter")}
                  $hasError={errors.applicationMetadata?.project?.twitter}
                  type="text"
                  placeholder='e.g "twitter.com/user-handle"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.project?.twitter
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.project?.twitter?.message}
                  </p>
                }
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.project.github"
                  className="block text-xs font-medium text-gray-700">
                  GitHub
                </label>
                <Input
                  {...register("applicationMetadata.project.github")}
                  $hasError={errors.applicationMetadata?.project?.github}
                  type="text"
                  placeholder='e.g "@github-handle"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.project?.github
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.project?.github?.message}
                  </p>
                }
              </div>
            </div>

            {/* CONTACT INFO */}

            <p className="mt-4 mb-2"><b>Contact</b></p>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.contact.name"
                  className="block text-xs font-medium text-gray-700">
                  Name
                </label>
                <Input
                  {...register("applicationMetadata.contact.name")}
                  $hasError={errors.applicationMetadata?.contact?.name}
                  type="text"
                  placeholder='e.g "Enter your first and last name"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.contact?.name
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.contact?.name?.message}
                  </p>
                }
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.contact.email"
                  className="block text-xs font-medium text-gray-700">
                  Email
                </label>
                <Input
                  {...register("applicationMetadata.contact.email")}
                  $hasError={errors.applicationMetadata?.contact?.email}
                  type="text"
                  placeholder='e.g "email@domain.com"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.contact?.email
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.contact?.email?.message}
                  </p>
                }
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.contact.teamDescription"
                  className="block text-xs font-medium text-gray-700">
                  Team Description
                </label>
                <Input
                  {...register("applicationMetadata.contact.teamDescription")}
                  $hasError={errors.applicationMetadata?.contact?.teamDescription}
                  type="text"
                  placeholder='e.g "Tell us more about your team structure"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.contact?.teamDescription
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.contact?.teamDescription?.message}
                  </p>
                }
              </div>
            </div>

            {/* GRANT INFO */}

            <p className="mt-4 mb-2"><b>Grant</b></p>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.grant.fundingRequested"
                  className="block text-xs font-medium text-gray-700">
                  Funding Requested
                </label>
                <Input
                  {...register("applicationMetadata.grant.fundingRequested")}
                  $hasError={errors.applicationMetadata?.grant?.fundingRequested}
                  type="text"
                  placeholder='e.g "Enter the request amount in USD"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.grant?.fundingRequested
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.grant?.fundingRequested?.message}
                  </p>
                }
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.grant.budgetBreakdown"
                  className="block text-xs font-medium text-gray-700">
                  Budget Breakdown
                </label>
                <Input
                  {...register("applicationMetadata.grant.budgetBreakdown")}
                  $hasError={errors.applicationMetadata?.grant?.budgetBreakdown}
                  type="text"
                  placeholder='e.g "How will the funds be allocated?"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.grant?.budgetBreakdown
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.grant?.budgetBreakdown?.message}
                  </p>
                }
              </div>
            </div>

            <p className="mt-4 mb-2"><b>Custom Question</b></p>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestion.label"
                  className="block text-xs font-medium text-gray-700">
                  Text Field (Label)
                </label>
                <Input
                  {...register("applicationMetadata.customQuestion.label")}
                  $hasError={errors.applicationMetadata?.customQuestion?.label}
                  type="text"
                  placeholder="Enter question label"
                />
                {errors.applicationMetadata?.customQuestion?.label
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestion?.label?.message}
                  </p>
                }
              </div>
            </div>
            <div className="grid grid-cols-6 gap-6 mt-4">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestion.helper"
                  className="block text-xs font-medium text-gray-700">
                  Text Field (Helper Copy)
                </label>
                <Input
                  {...register("applicationMetadata.customQuestion.helper")}
                  $hasError={errors.applicationMetadata?.customQuestion?.helper}
                  type="text"
                  placeholder="Enter a short description or example"
                />
                {errors.applicationMetadata?.customQuestion?.helper
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestion?.helper?.message}
                  </p>
                }
              </div>
            </div>

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