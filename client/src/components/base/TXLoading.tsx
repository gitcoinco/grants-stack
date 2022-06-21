import Stars from "../icons/Stars";
import colors from "../../styles/colors";

function statusMessage(status?: string) {
  switch (status) {
    case undefined:
      return "Please confirm your transaction";
    case "initiated":
      return "Your Transaction is Processing!";
    case "error":
      return "There was an error processing your transaction. Please try again";
    default:
      return "Project Created!";
  }
}

function TXLoading({ status }: { status?: string }) {
  return (
    <>
      <div className="w-6 mt-1 mr-2">
        <Stars color={colors["quaternary-text"]} />
      </div>
      <div>
        <p className="font-semibold text-quaternary-text mr-2 mt-1">
          {statusMessage(status)}
        </p>
        {status === "complete" && (
          <p className="text-quaternary-text">Now you can apply for grants.</p>
        )}
      </div>
    </>
  );
}

export default TXLoading;
