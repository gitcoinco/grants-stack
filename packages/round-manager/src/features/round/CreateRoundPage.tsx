import { useLocation, useNavigate } from "react-router-dom"
import "react-datetime/css/react-datetime.css"
import { XIcon } from "@heroicons/react/solid"

import { useWallet } from "../common/Auth"
import { useListProgramsQuery } from "../api/services/program"
import { FormWizard } from "../common/FormWizard"
import { RoundDetailForm } from "./RoundDetailForm"
import { RoundApplicationForm } from "./RoundApplicationForm"
import { Button } from "../common/styles"
import Navbar from "../common/Navbar"
import Footer from "../common/Footer"
import { datadogLogs } from "@datadog/browser-logs"

export default function CreateRound() {

  datadogLogs.logger.info('====> Route: /round/create')
  datadogLogs.logger.info(`====> URL: ${window.location.href}`)

  const { address, provider } = useWallet()
  const search = useLocation().search
  const programId = (new URLSearchParams(search)).get("programId")

  const {
    program,
    isSuccess: isProgramFetched
  } = useListProgramsQuery({ address, signerOrProvider: provider }, {
    selectFromResult: ({ data, isSuccess }) => ({
      program: data?.find((program) => program.id === programId),
      isSuccess
    })
  })

  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <div className="bg-[#F3F3F5]">
        <div className="pb-10 container mx-auto px-4 pt-8">
          <header>
            <div className="flow-root">
              <h1 className="float-left text-[32px] mb-7">Create a Round</h1>
              <Button
                type="button"
                $variant="outline"
                className="inline-flex float-right py-2 px-4 text-sm text-pink-500"
                onClick={() => navigate('/')}>
                <XIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                Exit
              </Button>
            </div>
          </header>
          <main>
            <FormWizard
              steps={[RoundDetailForm, RoundApplicationForm]}
              initialData={{ program, isProgramFetched, programId }}
            />
          </main>
        </div>
        <Footer />
      </div>
    </>
  )
}
