import { useNavigate, useParams, Link } from "react-router-dom"

import { Button } from "../common/styles"
import { useWeb3 } from "../common/ProtectedRoute"
import { useListProgramsQuery } from "../api/services/program"
import { useListRoundsQuery } from "../api/services/round"
import { ArrowLeftIcon, ArrowNarrowRightIcon, PencilIcon, UserIcon } from "@heroicons/react/solid"
import { RefreshIcon } from "@heroicons/react/outline"


export default function ViewProgram() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { account } = useWeb3()
  const { program } = useListProgramsQuery(account, {
    selectFromResult: ({ data }) => ({ program: data?.find((program) => program.id === id) }),
  })

  const {
    data: rounds,
    isLoading: isRoundsLoading,
    isSuccess: isRoundsFetched
  } = useListRoundsQuery({ account, programId: id })

  const roundItems = rounds?.map((round, index) =>

    <div
      key={index}
      className="relative rounded-sm border border-gray-300 bg-white px-6 py-4 my-4 shadow-lg drop-shadow-sm flex items-center space-x-3"
    >

      <div className="flex-1 min-w-0">
        <p className="text-sm mb-1 font-medium text-gray-900">
          {round.metadata!.name}
        </p>
      </div>

      <Link className="text-sm flex gap-2" to={`/round/${round.id}`} key={index}>
        <span>View Details</span>
        <ArrowNarrowRightIcon className="h-5 w-5" />
      </Link>

    </div>
  )

  const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate("/")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <header>
        <div className="mb-7 flex justify-between">
          <div className="flex flex-rows">
            <Link to={`/`}>
              <ArrowLeftIcon className="h-6 w-6 mr-3 mt-1" aria-hidden="true" />
            </Link>

            <h1 className="text-[30px] sm:text-[32px]">
              Program Details
            </h1>
          </div>

          {/* TODO: Edit Form */}
          <Button
            type="button"
            $variant="outline"
            className="inline-flex float-right py-2 px-4 text-sm text-grey-400"
            onClick={ goBack }>
              <PencilIcon className="h-5 w-5 mr-1" aria-hidden="true" />
              Edit
          </Button>

        </div>
      </header>

      <main>
        <div>

          <div className="sm:flex sm:justify-between">
            <div className="sm:basis-2/3 sm:mr-3">
              {/* TODO: background */}
              <img src="https://storageapi.fleek.co/thelostone-mc-team-bucket/1500x500-1.jpg" aria-hidden="true" alt="program image" />
            </div>

            <div className="sm:basis-1/3 text-center border px-8 sm:ml-3">
              <RefreshIcon className="h-11 w-11 mt-8 mx-auto" aria-hidden="true"></RefreshIcon>
              <h3 className="text-[16px] my-3">
                Grant Round
              </h3>
              <p className="text-gray-500 text-[12px]">
                Manage date details and acceptance criteria for your Grant Program Round.
              </p>
              <Link to={`/round/create?programId=${program?.id}`}>
                <Button className="my-4">
                  Create Round
                </Button>
              </Link>
            </div>
  
          </div>

          <h1 className="text-[32px] my-7">
            { program?.metadata?.name || "..." }
          </h1>

        </div>


        <div>
          <h2 className="text-[15px] mb-3">Operators</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            {
              program?.operatorWallets.map((operatorWallet, index) =>
                <div className="bg-white text-grey-500 border sm:text-center	py-2 px-1">
                  <UserIcon className="inline-flex h-4 w-4 text-black mr-1" />
                  <span className="text-[10px] sm:text-[13px] text-gray-500" key={index}>{operatorWallet}</span>     
                </div>         
              ) || (
                <p className="text-gray-500 text-[14px]">
                  Fetching operator wallets...
                </p>
              )
            }
          </div>

          <p className="text-gray-500 border-b text-[14px] py-4">
            You can’t edit operator wallets after the round is deployed.
          </p>


          <h2 className="text-[15px] my-4">My Rounds</h2>

          <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4 mb-8">
            {isRoundsFetched && roundItems}
            {isRoundsLoading && <p>Fetching your rounds...</p>}
          </div>

        </div>
      </main>
    </div >
  )
}