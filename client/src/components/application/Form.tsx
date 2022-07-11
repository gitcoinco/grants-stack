import { ApplicationForm } from "../../types";

export default function Form({
  roundApplication,
}: {
  roundApplication: ApplicationForm;
}) {
  return <div>{roundApplication.id}</div>;
}
