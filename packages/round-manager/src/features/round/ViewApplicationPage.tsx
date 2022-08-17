import { ArrowNarrowLeftIcon, CheckIcon, MailIcon, ShieldCheckIcon, XCircleIcon, XIcon } from "@heroicons/react/solid"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useListGrantApplicationsQuery, useUpdateGrantApplicationMutation } from "../api/services/grantApplication"
import { useListRoundsQuery } from "../api/services/round"
import ConfirmationModal from "../common/ConfirmationModal"
import Navbar from "../common/Navbar"
import { useWallet } from "../common/Auth"
import { Button } from "../common/styles"
import { ReactComponent as TwitterIcon } from "../../assets/twitter-logo.svg"
import { ReactComponent as GithubIcon } from "../../assets/github-logo.svg"
import Footer from "../common/Footer"
import { datadogLogs } from "@datadog/browser-logs"
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier"
import { ProjectCredentials } from "../api/types"

type ApplicationStatus = "APPROVED" | "REJECTED"

enum VerifiedCredentialState {
  VALID,
  INVALID,
  PENDING
}

export default function ViewApplicationPage() {

  datadogLogs.logger.info('====> Route: /program/create')
  datadogLogs.logger.info(`====> URL: ${window.location.href}`)

  const [reviewDecision, setReviewDecision] = useState<ApplicationStatus | undefined>(undefined)
  const [openModal, setOpenModal] = useState(false)
  const [verifiedProviders, setVerifiedProviders] = useState<{ [key: string]: VerifiedCredentialState }>({
    github: VerifiedCredentialState.PENDING,
    twitter: VerifiedCredentialState.PENDING
  })

  const { roundId, id } = useParams()
  const { address, provider, signer } = useWallet()
  const navigate = useNavigate()
  const verifier = new PassportVerifier()

  const {
    application,
    isLoading
  } = useListGrantApplicationsQuery({ roundId: roundId!, signerOrProvider: provider, id }, {
    selectFromResult: ({ data, isLoading }) => ({
      application: data?.find((application) => application.id === id),
      isLoading
    })
  })

  const credentials: ProjectCredentials = application?.project.credentials ?? {}

  useEffect(() => {
    if (!credentials) {
      return
    }
    const verify = async () => {
      const newVerifiedProviders: { [key: string]: VerifiedCredentialState } = { ...verifiedProviders }
      for (const provider of Object.keys(verifiedProviders)) {
        const verifiableCredential = credentials[provider]
        if (!!verifiableCredential) {
          newVerifiedProviders[provider] = await verifier.verifyCredential(verifiableCredential)
            ? VerifiedCredentialState.VALID
            : VerifiedCredentialState.INVALID
        }
      }

      setVerifiedProviders(newVerifiedProviders)
    }

    verify()
  }, [])


  const { round } = useListRoundsQuery({ address, signerOrProvider: provider }, {
    selectFromResult: ({ data }) => ({
      round: data?.find((round) => round.id === roundId)
    }),
  })

  const [updateGrantApplication, {
    isLoading: updating,
  }] = useUpdateGrantApplicationMutation()

  const handleUpdateGrantApplication = async () => {
    try {
      setOpenModal(false)

      await updateGrantApplication({
        roundId: roundId!,
        application: {
          status: reviewDecision!,
          id: application!.id,
          round: roundId!,
          recipient: application!.recipient,
          projectsMetaPtr: application!.projectsMetaPtr,
        },
        signer,
        provider
      }).unwrap()

      navigate(0)

    } catch (e) {
      console.error(e)
    }
  }

  const confirmReviewDecision = (status: ApplicationStatus) => {
    setReviewDecision(status)
    setOpenModal(true)
  }

  const handleCancelModal = () => {
    setOpenModal(false)
    setTimeout(() => setReviewDecision(undefined), 500)
  }

  const getAnswer = (question: string) => {
    return application?.answers!.find((answer) => answer.question === question)?.answer || "N/A"
  }

  const getVerifiableCredentialVerificationResultView = (provider: string) => {
    switch (verifiedProviders[provider]) {
      case VerifiedCredentialState.VALID:
        return (
          <span className="rounded-full bg-teal-100 px-3 inline-flex flex-row justify-center items-center">
            <ShieldCheckIcon className="w-5 h-5 text-teal-500 mr-2"
                             data-testid={ `${ provider }-verifiable-credential` }/>
            <p className="text-teal-500 font-medium text-xs">Verified</p>
          </span>
        )
      case VerifiedCredentialState.INVALID:
        return (
          <span className="rounded-full bg-red-100 px-3 inline-flex flex-row justify-center items-center">
            <XCircleIcon className="w-5 h-5 text-white mr-2"
                             data-testid={ `${ provider }-verifiable-credential-unverified` }/>
            <p className="text-white font-medium text-xs">Invalid</p>
          </span>
        )
      default:
        return <></>
    }
  }

  return (
    <>
      <Navbar/>
      <div className="container mx-auto h-screen px-4 py-7">
        <header>
          <div className="flex gap-2 mb-6">
            <ArrowNarrowLeftIcon className="h-3 w-3 mt-1 bigger"/>
            <Link className="text-sm gap-2" to={ `/round/${ round?.id }` }>
              <span>
                { round?.roundMetadata?.name || "..." }
              </span>
            </Link>
          </div>
          <div>
            <div>
              <img
                className="h-32 w-full object-cover lg:h-80 rounded"
                src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${application?.project!.bannerImg}`}
                alt=""
              />
            </div>
            <div className="pl-4 sm:pl-6 lg:pl-8">
              <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                <div className="flex">
                  <img
                    className="h-24 w-24 rounded-full ring-4 ring-white bg-white sm:h-32 sm:w-32"
                    src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${application?.project!.logoImg}`}
                    alt=""
                  />
                </div>
                <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                  <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Button
                      type="button"
                      $variant={ application?.status === "APPROVED" ? "solid" : "outline" }
                      className="inline-flex justify-center px-4 py-2 text-sm"
                      disabled={ isLoading || updating }
                      onClick={ () => confirmReviewDecision("APPROVED") }
                    >
                      <CheckIcon className="h-5 w-5 mr-1" aria-hidden="true"/>
                      { application?.status === "APPROVED" ? "Approved" : "Approve" }
                    </Button>
                    <Button
                      type="button"
                      $variant={ application?.status === "REJECTED" ? "solid" : "outline" }
                      className={ "inline-flex justify-center px-4 py-2 text-sm" + (application?.status === "REJECTED" ? "" : "text-grey-500") }
                      disabled={ isLoading || updating }
                      onClick={ () => confirmReviewDecision("REJECTED") }
                    >
                      <XIcon className="h-5 w-5 mr-1" aria-hidden="true"/>
                      { application?.status === "REJECTED" ? "Rejected" : "Reject" }
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ConfirmationModal
            body={`You have ${reviewDecision?.toLowerCase()} a Grant Application. This will carry gas fees based on the selected network`}
            confirmButtonAction={handleUpdateGrantApplication}
            cancelButtonAction={handleCancelModal}
            isOpen={openModal}
            setIsOpen={setOpenModal}
          />
        </header>

        <main>
          <h1 className="text-2xl mt-6">{application?.project!.title || "..."}</h1>
          <div className="sm:flex sm:justify-between my-6">
            <div className="sm:basis-3/4 sm:mr-3">
              <div className="grid sm:grid-cols-3 gap-2 md:gap-10">
                <div className="text-grey-500 truncate block">
                  <MailIcon className="inline-flex h-4 w-4 text-grey-500 mr-1"/>
                  <span className="text-xs text-grey-400">{ getAnswer("Email") }</span>
                </div>
                <span className="text-grey-500 flex flex-row justify-start items-center" data-testid="twitter-info">
                  <TwitterIcon className="h-4 w-4 mr-2"/>
                  <span className="text-sm text-violet-400 mr-2">{ getAnswer("Twitter") }</span>
                  {
                    getVerifiableCredentialVerificationResultView("twitter")
                  }

                </span>

                <span className="text-grey-500 flex flex-row justify-start items-center" data-testid="github-info">
                  <GithubIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm text-violet-400 mr-2">{ getAnswer("Github") }</span>
                  {
                    getVerifiableCredentialVerificationResultView("github")
                  }
                </span>

              </div>

              <hr className="my-6"/>

              <h2 className="text-xs mb-2">Description</h2>
              <p className="text-base">{application?.project!.description}</p>

              <hr className="my-6"/>

              <h2 className="text-xs mb-2">Funding Sources</h2>
              <p className="text-base mb-6">{ getAnswer("Funding Source") }</p>

              <h2 className="text-xs mb-2">Funding Profit</h2>
              <p className="text-base mb-6">{ getAnswer("Profit2022") }</p>

              <h2 className="text-xs mb-2">Team Size</h2>
              <p className="text-base mb-6">{ getAnswer("Team Size") }</p>
            </div>
            <div className="sm:basis-1/4 text-center sm:ml-3"></div>
          </div>

          {/* <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4 mb-8">
            {
              isRoundsLoading &&
              <p>Fetching round information...</p>
            }
          </div> */ }

        </main>
        <Footer/>
      </div>
    </>
  )
}
