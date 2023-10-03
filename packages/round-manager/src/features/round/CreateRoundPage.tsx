import { datadogLogs } from "@datadog/browser-logs";
import { XIcon } from "@heroicons/react/solid";
import { Button } from "common/src/styles";
import "react-datetime/css/react-datetime.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProgramById } from "../../context/program/ReadProgramContext";
import Footer from "common/src/components/Footer";
import { FormWizard } from "../common/FormWizard";
import Navbar from "../common/Navbar";
import ApplicationEligibilityForm from "./ApplicationEligibilityForm";
import { RoundApplicationForm } from "./RoundApplicationForm";
import { RoundDetailForm } from "./RoundDetailForm";
import QuadraticFundingForm from "./QuadraticFundingForm";
import { RoundCategory } from "../api/types";

function ExitCreateRound(props: { onClick: () => void }) {
  return (
    <Button
      type="button"
      $variant="outline"
      className="inline-flex float-right py-2 px-4 text-sm text-pink-500"
      onClick={props.onClick}
    >
      <XIcon className="h-5 w-5 mr-1" aria-hidden="true" />
      Exit
    </Button>
  );
}

export default function CreateRound() {
  datadogLogs.logger.info("====> Route: /round/create");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const [searchParams] = useSearchParams();
  const programId = searchParams.get("programId");
  const roundCategoryParam = searchParams.get("roundCategory");
  const roundCategory =
    roundCategoryParam === "direct"
      ? RoundCategory.Direct
      : RoundCategory.QuadraticFunding;
  const steps =
    roundCategory == RoundCategory.Direct
      ? [RoundDetailForm, ApplicationEligibilityForm, RoundApplicationForm]
      : [
          RoundDetailForm,
          QuadraticFundingForm,
          ApplicationEligibilityForm,
          RoundApplicationForm,
        ];

  const { program } = useProgramById(programId ?? undefined);

  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="bg-[#F3F3F5]">
        <div className="pb-10 container mx-auto px-4 pt-8">
          <header>
            <div className="flow-root">
              <h1 className="float-left text-[32px] mb-7">
                Create a {roundCategoryParam == "direct" && "Direct Grants"}
                &nbsp;Round
              </h1>
              <ExitCreateRound onClick={() => navigate("/")} />
            </div>
          </header>
          <main>
            <FormWizard
              // @ts-expect-error Needs refactoring/typing as a whole
              steps={steps}
              initialData={{ program }}
              configuration={{
                roundCategory: roundCategory,
              }}
            />
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}
