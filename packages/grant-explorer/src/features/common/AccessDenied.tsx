import Navbar from "./Navbar";
import { datadogLogs } from "@datadog/browser-logs";
import Footer from "common/src/components/Footer";

export default function AccessDenied() {
  datadogLogs.logger.info(`====> Route: NotFound`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  return (
    <>
      <Navbar roundUrlPath={""} />
      <div className="lg:mx-20 h-screen px-4 py-7">
        <main className="h-screen">
          <div className="flex pt-8">
            <div className="m-auto text-center mt-5">
              <h1 className="my-5 text-sm text-red-100 font-bold">ERROR</h1>
              <h2 className="my-5 text-4xl">Access Denied!</h2>
              <p className="text-grey-400 mb-5">
                It looks like you don't have access to this page..
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
