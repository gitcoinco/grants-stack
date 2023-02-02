import { Link } from "react-router-dom";
import { FourZeroFour } from "../../assets";

function PageNotFound() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full lg:w-3/5 sm:w-2/3">
        <div className="p-8 flex flex-col">
          <p className="text-sm font-normal text-gitcoin-pink-400 uppercase text-center">
            404 Error
          </p>
          <p className="mt-2 w-full text-center text-4xl font-medium text-black tracking-wide">
            Uh oh! You might be a little lost.
          </p>
          <p className="mt-2 mb-6 w-full text-center text-gray-400">
            It looks like the page you are looking for doesn&apos;t exist.
            <br />
            For support, contact us on{" "}
            <a
              className="text-primary-background font-medium"
              href="https://discord.gg/gitcoin"
            >
              Discord
            </a>
          </p>
          <div className="w-full flex justify-center">
            <Link
              to="/"
              className="bg-gitcoin-violet-100 hover:bg-gitcoin-violet-400  hover:text-white text-blue-700 py-2 px-4 rounded"
            >
              Go back home
            </Link>
          </div>
        </div>
        <img alt="404 Page not Found" src={FourZeroFour} />
      </div>
    </div>
  );
}

export default PageNotFound;
