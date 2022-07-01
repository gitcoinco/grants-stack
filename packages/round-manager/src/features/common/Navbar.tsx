import { Link } from "react-router-dom"
import { PlusSmIcon } from "@heroicons/react/solid"

import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-white.svg"


export interface NavbarProps {
  programCta?: boolean;
}


export default function Navbar({ programCta = false }: NavbarProps) {

  return (
    <nav className="bg-grey-500">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <GitcoinLogo className="block h-8 w-auto" />
              <h5 className="pl-2.5 md:pl-6 text-white hidden lg:block md:block">Round Manager</h5>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              { programCta &&
                <Link to="/program/create">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-1.5 border border-white shadow-sm text-xs font-medium rounded text-grey-500 bg-white hover:bg-gray-50"
                  >
                    <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                    Create Program
                  </button>
                </Link>
              }
            </div>
            <div>
              <span className="text-white pl-2.5">Connected 🟢</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}