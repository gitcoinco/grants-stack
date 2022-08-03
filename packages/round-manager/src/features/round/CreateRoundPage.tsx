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


export default function CreateRound() {
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
      <div className="container mx-auto h-screen px-4 py-16">
        <header>
          <div className="flow-root">
            <h1 className="float-left text-[32px] mb-7">Create Round</h1>
            <Button
              type="button"
              $variant="outline"
              className="inline-flex float-right py-2 px-4 text-sm text-grey-400"
              onClick={() => navigate(`/program/${programId}`)}>
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
    </>
  )
}