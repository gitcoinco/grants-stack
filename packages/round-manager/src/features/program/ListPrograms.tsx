import { Link } from "react-router-dom"

import { useWeb3 } from "../common/ProtectedRoute"
import { useListProgramsQuery } from "../api/services/program"


function ListPrograms() {
  const { account } = useWeb3()
  const { data: programs, isLoading, isSuccess } = useListProgramsQuery(account)


  const programItems = programs?.map((program, index) =>
    <Link to={`/program/${program.id}`} key={index}>
      <button className="w-60 h-60 border-4 border-black bg-gray-300 hover:bg-gray-200 text-2xl">
        {program.metadata!.name}
      </button>
    </Link>
  )

  return (
    <div className="container mx-auto px-4 py-16 h-screen">
      <header>
        <p className="mb-16">
          <span className="text-5xl">My Programs</span>
          <span className="float-right truncate">📒: {account}</span>
        </p>
      </header>
      <main>
        <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4">
          {programItems}
          {isSuccess &&
            <Link to="/program/create">
              <button className="w-60 h-60 rounded-full border-4 border-black hover:bg-gray-200 text-2xl">
                Create Program
              </button>
            </Link>}
          {isLoading && <p>Fetching your grant programs...</p>}
        </div>
      </main>
    </div>
  )
}

export default ListPrograms;