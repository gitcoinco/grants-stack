import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "common/src/components/Footer";
import { Button } from "common/src/styles";
import { ReactComponent as NotFoundBanner } from "../../assets/404.svg";
import { datadogLogs } from "@datadog/browser-logs";

export default function NotFoundPage() {
  datadogLogs.logger.info(`====> Route: NotFound`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  return (
    <>
      <Navbar />
      <main>
        <div className="flex pt-8">
          <div className="m-auto text-center mt-5">
            <h1 className="my-5 text-sm text-red-100 font-bold">404 ERROR</h1>
            <h2 className="my-5 text-4xl">Uh oh! You might be a little lost</h2>

            <p className="text-grey-400 mb-0">
              It looks like the page you’re looking for doesn’t exist.
            </p>
            <p className="text-grey-400 mt-1">
              Check if you're connected to the right network
            </p>
            <p className="text-grey-400 mt-1 mb-5">
              For support, contact us on{" "}
              <a href="https://discord.com/invite/gitcoin">Discord.</a>
            </p>

            <Link to="/" data-testid={"not-found-go-back-home"}>
              <Button
                $variant="outline"
                type="button"
                className="px-3 bg-violet-100 text-violet-400 border-0 text-xs"
              >
                Go back home
              </Button>
            </Link>

            <NotFoundBanner className="max-w-full	" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
