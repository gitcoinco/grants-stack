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
    customQuestions: yup.object({
      email: yup.string(),
      twitter: yup.string(),
      github: yup.string(),
      fundingSource: yup.string(),
      profit2022: yup.string(),
      teamSize: yup.string(),
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
            <p className="mt-4 mb-2"><b>Basic information</b></p>
            <p className="text-sm text-gray-500 mb-2">
              This information will be collected from all Owners applying to the Grant and some personal identifiable information will be stored publicly.
            </p>
            <p className="text-sm">
              Note: The information entered in the fields below will be displayed in the Grant Application.
            </p>

            <p className="mt-4 mb-2"><b>Project</b></p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Name
                </label>
                <Input
                  type="text"
                  value="i.e. What do you call your customQuestions?"
                  disabled
                  $disabled
                />
              </div>

              {/* Website */}
              <div>
                <label
                  className="block text-xs font-medium text-gray-700">
                  Website
                </label>
                <Input
                  type="text"
                  value="i.e. email@domain.com"
                  disabled
                  $disabled
                />
              </div>

              {/* Logo */}
              <div className="col-span-1 sm:col-span-3">
                <label
                  className="block text-xs font-medium text-gray-700">
                  Logo
                </label>

                <div className="mt-1 max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-xs text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                      </label>
                      <p className="pl-1">Owners will upload or drag and drop PNG or JPG</p>
                    </div>
                    <p className="text-xs text-gray-500">(Recommended: 200x300px)</p>
                  </div>
                </div>

              </div>

              {/* Banner */}
              <div className="col-span-1 sm:col-span-3">
                <label
                  className="block text-xs font-medium text-gray-700">
                  Banner
                </label>

                <div className="mt-1 max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-xs text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                      </label>
                      <p className="pl-1">Owners will upload or drag and drop PNG or JPG</p>
                    </div>
                    <p className="text-xs text-gray-500">(Recommended: 1044x600px)</p>
                  </div>
                </div>

              </div>

              {/* Description */}
              <div className="sm:col-start-1 sm:col-span-3">
                <label className="block text-xs font-medium text-gray-700">
                  Description
                </label>
                <Input
                  type="text"
                  value="i.e. “Tell us more about your project.“"
                  disabled
                  $disabled
                />
              </div>

              {/* Roadmap */}
              <div className="sm:col-start-1">
                <label className="block text-xs font-medium text-gray-700">
                  Roadmap
                </label>
                <Input
                  type="text"
                  value="i.e. “What are the dependencies and project goals?"
                  disabled
                  $disabled
                />
              </div>

              {/* Challenges */}
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Challenges
                </label>
                <Input
                  type="text"
                  value="i.e. “What are some of the risks you see ahead?"
                  disabled
                  $disabled
                />
              </div>

            </div>

            <p className="mt-4 mb-2"><b>Additional Questions</b></p>

            <div className="grid grid-cols-6 gap-6">

              {/* Email */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.contact.email"
                  className="block text-xs font-medium text-gray-700">
                  Email
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.email")}
                  $hasError={errors.applicationMetadata?.customQuestions?.email}
                  type="text"
                  placeholder='i.e. "email@domain.com"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.customQuestions?.email
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestions?.email?.message}
                  </p>
                }
              </div>

              {/* Twitter */}
              <div className="col-span-6 sm:col-span-3 sm:col-start-1">
                <label
                  htmlFor="applicationMetadata.customQuestions.twitter"
                  className="block text-xs font-medium text-gray-700">
                  Twitter
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.twitter")}
                  $hasError={errors.applicationMetadata?.customQuestions?.twitter}
                  type="text"
                  placeholder='i.e. "twitter.com/user-handle"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.customQuestions?.twitter
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestions?.twitter?.message}
                  </p>
                }
              </div>

              {/* Github */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.github"
                  className="block text-xs font-medium text-gray-700">
                  GitHub
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.github")}
                  $hasError={errors.applicationMetadata?.customQuestions?.github}
                  type="text"
                  placeholder='i.e "@github-handle"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.customQuestions?.github
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestions?.github?.message}
                  </p>
                }
              </div>

              <div className="col-span-6">
                <p className="text-sm my-0 text-gray-500">Twitter and Github will require verification.</p>
              </div>

              {/* Funding Sources */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.fundingSources"
                  className="block text-xs font-medium text-gray-700">
                  Funding Sources
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.fundingSource")}
                  $hasError={errors.applicationMetadata?.customQuestions?.fundingSource}
                  type="text"
                  placeholder='i.e. "What sources of funding do you currently have?"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.customQuestions?.fundingSource
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestions?.fundingSource?.message}
                  </p>
                }
              </div>

              {/* 2022 Profit */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.profit2022"
                  className="block text-xs font-medium text-gray-700">
                  2022 Profit
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.profit2022")}
                  $hasError={errors.applicationMetadata?.customQuestions?.profit2022}
                  type="text"
                  placeholder='i.e. "Please enter your profit for 2022."'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.customQuestions?.profit2022
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestions?.profit2022?.message}
                  </p>
                }
              </div>

              {/* Team Size */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.teamSize"
                  className="block text-xs font-medium text-gray-700">
                  Team Size
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.teamSize")}
                  $hasError={errors.applicationMetadata?.customQuestions?.teamSize}
                  type="text"
                  placeholder='i.e. "What is the size of your team"'
                  className="placeholder:italic"
                />
                {errors.applicationMetadata?.customQuestions?.teamSize
                  && <p className="text-sm text-red-600">
                    {errors.applicationMetadata?.customQuestions?.teamSize?.message}
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