import { datadogLogs } from "@datadog/browser-logs";
import { usePrograms } from "../../context/program/ReadProgramContext";
import { ProgressStatus } from "../api/types";
import Navbar from "./Navbar";
import ProgramListPage from "../program/ProgramListPage";
import RoundListPage from "../round/RoundListPage";
import Footer from "common/src/components/Footer";

function LandingPage() {
  datadogLogs.logger.info("====> Route: /");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { fetchProgramsStatus, listProgramsError } = usePrograms();
  const isSuccess =
    fetchProgramsStatus === ProgressStatus.IS_SUCCESS && !listProgramsError;

  return (
    <div className="bg-grey-50 flex flex-col items-center min-h-screen">
    <div className="w-full bg-grey-50">
      <Navbar programCta={isSuccess} />
    </div>
    <div className="w-full max-w-screen-2xl mx-auto px-8">
      <ProgramListPage />
      <RoundListPage />
    </div>
    <div className="w-full max-w-screen-2xl mx-auto px-8 flex justify-end mt-auto">
      <Footer />
    </div>
  </div>
  
  );
}

export default LandingPage;
