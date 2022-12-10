import Navbar from "./Navbar";
import { datadogLogs } from "@datadog/browser-logs";

export default function AccessDenied() {
  datadogLogs.logger.info(`====> Route: NotFound`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  return (
    <>
      <Navbar />
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
    </>
  );
}
