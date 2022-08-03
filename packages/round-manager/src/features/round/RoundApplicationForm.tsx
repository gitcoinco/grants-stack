import { useContext, useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { useCreateRoundMutation } from "../api/services/round"
import { useSaveToIPFSMutation } from "../api/services/ipfs"
import { Round } from "../api/types"
import { FormContext } from "../common/FormWizard"
import { Input } from "../common/styles"
import { generateApplicationSchema } from "../api/utils"
import { useWallet } from "../common/Auth"
import ProgressModal from "../common/ProgressModal"


const ValidationSchema = yup.object().shape({
  applicationMetadata: yup.object({
    customQuestions: yup.object({
      email: yup.string(),
      twitter: yup.string(),
      github: yup.string(),
      githubOrganization: yup.string(),
      fundingSource: yup.string(),
      profit2022: yup.string(),
      teamSize: yup.string(),
    })
  })
})


export function RoundApplicationForm(props: { initialData: any, stepper: any }) {
  const [openProgressModal, setOpenProgressModal] = useState(false)
  const { currentStep, setCurrentStep, stepsCount, formData } = useContext(FormContext)
  const FormStepper = props.stepper

  const search = useLocation().search
  const programId = (new URLSearchParams(search)).get("programId")

  const navigate = useNavigate()
  const { register, reset, handleSubmit, formState: { errors } } = useForm<Round>({
    defaultValues: formData,
    resolver: yupResolver(ValidationSchema),
  })

  const { chain, signer } = useWallet()

  const [saveToIPFS, {
    // error: ipfsError,
    isLoading: isSavingToIPFS,
    isSuccess: isSavedToIPFS,
    isError: isIPFSError,
  }] = useSaveToIPFSMutation()

  const [createRound, {
    // error: roundError,
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

    if (isLoading) {
      setOpenProgressModal(true)
    }
  }, [isSuccess, isLoading, programId, navigate])

  useEffect(() => {
    if (isIPFSError || isRoundError) {
      setOpenProgressModal(false)
    }
  }, [isIPFSError, isRoundError])

  const prev = () => setCurrentStep(currentStep - 1)

  const next: SubmitHandler<Round> = async (values) => {
    try {
      setOpenProgressModal(true)

      const data = { ...formData, ...values }

      // Save round and application metadata to IPFS
      const [
        metadataPointer,
        applicationMetadataPointer
      ] = await Promise.all([
        saveToIPFS({
          content: data.roundMetadata,
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
        round: {
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
        },
        signerOrProvider: signer
      }).unwrap()

      reset()

    } catch (e) {
      console.error(e)
    }
  }

  const progressSteps: any = [
    {
      name: "Storing",
      description: "The metadata is being saved in a safe place.",
      status: isSavedToIPFS ? "complete" : (isSavingToIPFS ? "current" : "upcoming")
    },
    {
      name: "Deploying",
      description: `Connecting to the ${chain.name} blockchain.`,
      status: isSuccess ? "complete" : (isLoading ? "current" : "upcoming")
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status: isSuccess ? "current" : "upcoming"
    }
  ]

  return (
    <div className="md:grid md:grid-cols-3 md:gap-10">
      <div className="md:col-span-1">
        <p className="text-base leading-6">Application Form Configuration</p>
        <p className="mt-1 text-sm text-grey-400">
          Define the acceptance criteria grant owners can provide to apply for your grant program round.
        </p>
      </div>

      <div className="mt-5 md:mt-0 md:col-span-2">
        <form onSubmit={handleSubmit(next)} className="shadow-sm text-grey-500">
          <div className="pt-7 pb-10 sm:px-6 bg-white">
            <p className="mb-2"><b>Basic information</b></p>
            <p className="text-base text-grey-400 mb-6">
              This information will be collected from all Owners applying to the Grant and some personal identifiable information will be stored publicly.
            </p>
            <p className="text-base italic">
              Note: The information entered in the fields below will be displayed in the Grant Application.
            </p>

            <p className="mt-6"><b>Project</b></p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Name */}
              <div className="mt-2">
                <label className="block text-xs font-medium">
                  Name
                </label>
                <Input
                  type="text"
                  value='i.e. "What do you call your project?"'
                  className="text-grey-400"
                  disabled
                  $disabled
                />
              </div>

              {/* Website */}
              <div className="mt-2">
                <label
                  className="block text-xs font-medium">
                  Website
                </label>
                <Input
                  type="text"
                  value="i.e. www.domain.com"
                  className="text-grey-400"
                  disabled
                  $disabled
                />
              </div>

              {/* Logo */}
              <div className="col-span-1 sm:col-span-3 mt-2">
                <label
                  className="block text-xs font-medium mb-2">
                  Logo Image
                </label>

                <div className="max-w-md flex px-20 py-7 border border-gray-300 border-dashed rounded-md">
                  <div className="text-grey-400 text-xs text-center">
                    <span>Owners will upload or drag and drop</span><br />
                    <span>PNG or JPG (Recommended: 200x300px)</span>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="col-span-1 sm:col-span-3 mt-2">
                <label
                  className="block text-xs font-medium mb-2">
                  Banner Image
                </label>

                <div className="max-w-md flex px-20 py-7 border border-gray-300 border-dashed rounded-md">
                  <div className="text-grey-400 text-xs text-center">
                    <span>Owners will upload or drag and drop</span><br />
                    <span>PNG or JPG (Recommended: 1044x600px)</span>
                  </div>
                </div>

              </div>

              {/* Description */}
              <div className="sm:col-start-1 sm:col-span-3 mt-2">
                <label className="block text-xs font-medium mb-2">
                  Description
                </label>
                <Input
                  type="text"
                  value='i.e. "Tell us more about your project."'
                  className="text-grey-400"
                  disabled
                  $disabled
                />
              </div>
            </div>

            <p className="my-6"><b>Additional Questions</b></p>

            <div className="grid grid-cols-6 gap-6">

              {/* Email */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.contact.email"
                  className="block text-xs font-medium">
                  Email
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.email")}
                  $hasError={errors.applicationMetadata?.customQuestions?.email}
                  type="text"
                  placeholder='i.e. "email@domain.com"'
                />
                {errors.applicationMetadata?.customQuestions?.email
                  && <p className="text-xs text-pink-500">
                    {errors.applicationMetadata?.customQuestions?.email?.message}
                  </p>
                }
              </div>

              {/* Twitter */}
              <div className="col-span-6 sm:col-span-3 sm:col-start-1">
                <label
                  htmlFor="applicationMetadata.customQuestions.twitter"
                  className="block text-xs font-medium">
                  Twitter
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.twitter")}
                  $hasError={errors.applicationMetadata?.customQuestions?.email}
                  type="text"
                  placeholder='i.e. "twitter.com/user-handle"'
                />
                {errors.applicationMetadata?.customQuestions?.twitter
                  && <p className="text-xs text-pink-500">
                    {errors.applicationMetadata?.customQuestions?.twitter?.message}
                  </p>
                }
              </div>

              {/* Github */}
              <div className="col-span-6 sm:col-span-3 sm:col-start-1">
                <label
                  htmlFor="applicationMetadata.customQuestions.github"
                  className="block text-xs font-medium">
                  GitHub
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.github")}
                  $hasError={errors.applicationMetadata?.customQuestions?.github}
                  type="text"
                  placeholder='i.e. "twitter.com/user-handle"'
                />
                {errors.applicationMetadata?.customQuestions?.github
                  && <p className="text-xs text-pink-500">
                    {errors.applicationMetadata?.customQuestions?.github?.message}
                  </p>
                }
              </div>

              {/* Github Organization */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.githubOrganization"
                  className="block text-xs font-medium">
                  GitHub Organization
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.githubOrganization")}
                  $hasError={errors.applicationMetadata?.customQuestions?.githubOrganization}
                  type="text"
                  placeholder='i.e "@github-handle"'
                />
                {errors.applicationMetadata?.customQuestions?.githubOrganization
                  && <p className="text-xs text-pink-500">
                    {errors.applicationMetadata?.customQuestions?.githubOrganization?.message}
                  </p>
                }
              </div>

              {/* Funding Sources */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.fundingSources"
                  className="block text-xs font-medium">
                  Funding Sources
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.fundingSource")}
                  $hasError={errors.applicationMetadata?.customQuestions?.fundingSource}
                  type="text"
                  placeholder='i.e. "What sources of funding do you currently have?"'
                />
                {errors.applicationMetadata?.customQuestions?.fundingSource
                  && <p className="text-xs text-pink-500">
                    {errors.applicationMetadata?.customQuestions?.fundingSource?.message}
                  </p>
                }
              </div>

              {/* 2022 Profit */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.profit2022"
                  className="block text-xs font-medium">
                  2022 Profit
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.profit2022")}
                  $hasError={errors.applicationMetadata?.customQuestions?.profit2022}
                  type="text"
                  placeholder='i.e. "Please enter your profit for 2022."'
                />
                {errors.applicationMetadata?.customQuestions?.profit2022
                  && <p className="text-xs text-pink-500">
                    {errors.applicationMetadata?.customQuestions?.profit2022?.message}
                  </p>
                }
              </div>

              {/* Team Size */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="applicationMetadata.customQuestions.teamSize"
                  className="block text-xs font-medium">
                  Team Size
                </label>
                <Input
                  {...register("applicationMetadata.customQuestions.teamSize")}
                  $hasError={errors.applicationMetadata?.customQuestions?.teamSize}
                  type="text"
                  placeholder='i.e. "What is the size of your team"'
                />
                {errors.applicationMetadata?.customQuestions?.teamSize
                  && <p className="text-xs text-pink-500">
                    {errors.applicationMetadata?.customQuestions?.teamSize?.message}
                  </p>
                }
              </div>
            </div>
          </div>

          <div className="px-6 align-middle py-3.5 shadow-md">
            <FormStepper
              currentStep={currentStep}
              stepsCount={stepsCount}
              prev={prev}
              disabledNext={isLoading || isSavingToIPFS || isSuccess || !props.initialData.program}
            />
          </div>
        </form>
        <ProgressModal
          show={openProgressModal}
          subheading={"Please hold while we create your Grant Round."}
          steps={progressSteps}
        />
      </div>
    </div>
  )
}
