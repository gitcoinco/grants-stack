import { Link } from "react-router-dom";
import Button, { ButtonVariants } from "./Button";

function PageNotFound() {
  return (
    <div className="h-full w-full absolute flex flex-col justify-center items-center">
      <div className="w-full lg:w-3/5 sm:w-2/3">
        <img alt="404 Page not Found" src="./assets/404.png" />
        <div className="p-8 flex flex-col">
          <p className="mt-4 mb-12 w-full text-center">
            The page you are looking for does not exist.
          </p>
          <Link to="/">
            <Button
              styles={["w-full justify-center"]}
              variant={ButtonVariants.primary}
            >
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
