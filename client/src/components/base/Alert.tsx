import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Check from "../icons/Check";
import { Alert } from "../../types/alert";
import { removeAlertDelayed } from "../../actions/ui";

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

  return (
    <div className={`alert ${alert.type}`} role="alert">
      <svg
        className="fill-current w-4 h-4 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <Check />
      </svg>
      <span className="block sm:inline">{alert.message}</span>
    </div>
  );
}

export function AlertContainer({ alerts }: AlertContainerProps) {
  if (alerts.length === 0) {
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
