import Stars from "../icons/Stars";
import colors from "../../styles/colors";
import { Status } from "../../reducers/newGrant";

function statusMessage(status: Status, error: string | undefined) {
  switch (status) {
    case Status.UploadingImages:
      return "Uploading images to IPFS...";
    case Status.UploadingJSON:
      return "Uploading metadata to IPFS...";
    case Status.WaitingForSignature:
      return "Please confirm your transaction";
    case Status.TransactionInitiated:
      return "Your transaction is processing!";
    case Status.Completed:
      return "Project Created!";
    case Status.Error:
      return error;
    default:
      return "";
  }
}

interface Props {
  status: Status;
  error: string | undefined;
}

function TXLoading({ status, error }: Props) {
  return (
    <>
      <div className="w-6 mt-1 mr-2">
        <Stars color={colors["quaternary-text"]} />
      </div>
      <div>
        <p className="font-semibold text-quaternary-text mr-2 mt-1">
          {statusMessage(status, error)}
        </p>
        {status === Status.Completed && (
          <p className="text-quaternary-text">Now you can apply for grants.</p>
        )}
      </div>
    </>
  );
}

export default TXLoading;
