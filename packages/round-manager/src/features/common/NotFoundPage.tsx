import { Link } from 'react-router-dom'
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Button } from "../common/styles"
import { HomeIcon } from "@heroicons/react/solid"


export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="flex h-screen">
          <div className="m-auto">
            <h1 className="my-5">Error 404</h1>
            <h2 className="my-5">Page Not Found</h2>
            <Link to="/">
              <Button
                $variant="solid"
                type="button"
                className="inline-flex items-center px-20 py-2.5 my-3 shadow-sm text-sm rounded"
              >
                <HomeIcon className="h-5 w-5 mr-2.5" aria-hidden="true" />
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
