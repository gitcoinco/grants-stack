import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeAlertDelayed } from "../../actions/ui";
import { Alert } from "../../types/alert";
import Check from "../icons/Check";

type AlertProps = {
  alert: Alert;
};

type AlertContainerProps = {
  alerts: Alert[];
};

export default function AlertComponent({ alert }: AlertProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(removeAlertDelayed(alert.id, 5000));
  }, [dispatch, alert.id]);

  const alertType =
    alert.type === "success"
      ? "text-gitcoin-teal-500"
      : "text-gitcoin-pink-500";

  return (
    <div className={`alert ${alert.type} flex`} role="alert">
      <svg
        className="fill-current w-4 h-4 mr-2 mb-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <Check />
      </svg>
      <div className="m-auto">
        <div className={`block ${alertType}`}>{alert.title}</div>
        <div className="block text-black">{alert.body}</div>
      </div>
    </div>
  );
}

export function AlertContainer({ alerts }: AlertContainerProps) {
  if (alerts?.length === 0) {
    return null;
  }

  return (
    <div className="alerts-container px-2">
      <div className="container">
        {alerts.map((a) => (
          <AlertComponent key={a.id} alert={a} />
        ))}
      </div>
    </div>
  );
}
