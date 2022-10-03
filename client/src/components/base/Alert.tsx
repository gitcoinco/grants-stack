import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeAlertDelayed } from "../../actions/ui";
import { Alert } from "../../types/alert";
// import Check from "../icons/Check";

type AlertProps = {
  alert: Alert;
};

type AlertContainerProps = {
  alerts: Alert[];
};

export default function AlertComponent({ alert }: AlertProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(removeAlertDelayed(alert.id, 50000));
  }, [dispatch, alert.id]);

  return (
    <div className={`alert ${alert.type} flex text-lg`} role="alert">
      <div className="fill-current w-8 h-8 mr-2 mb-10">
        <img src="./assets/check.svg" alt="check" />
      </div>
      <div className="m-auto ml-4">
        <div className="block">{alert.title}</div>
        <div className="block">{alert.body}</div>
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
