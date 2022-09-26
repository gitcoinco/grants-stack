import { Link } from "react-router-dom";
import Button, { ButtonVariants } from "./Button";

function PageNotFound() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full lg:w-3/5 sm:w-2/3">
        <div className="p-8 flex flex-col">
          <p className="font-semibold text-red-700 uppercase text-center">
            404 Error
          </p>
          <p className="mt-2 w-full text-center">
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
            <Link to="/">
              <Button
                styles={["justify-center"]}
                variant={ButtonVariants.secondary}
              >
                Go back Home
              </Button>
            </Link>
          </div>
        </div>
        <img alt="404 Page not Found" src="./assets/404.png" />
      </div>
    </div>
  );
}

export default PageNotFound;
