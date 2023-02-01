import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { removeAlertDelayed } from "../../actions/ui";
import { Alert } from "../../types/alert";

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
    <div className={`alert ${alert.type} flex`} role="alert">
      <div className="fill-current w-6 h-6 mr-2 mb-6">
        <CheckCircleIcon />
      </div>
      <div className="m-auto ml-4">
        <div className="block">{alert.title}</div>
        <div className="block text-black font-normal">{alert.body}</div>
      </div>
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
