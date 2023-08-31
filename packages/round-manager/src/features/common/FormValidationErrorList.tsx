/* eslint-disable @typescript-eslint/no-explicit-any */
type Error = {
  key: string;
  message: string;
};

export default function FormValidationErrorList({ errors }: any) {
  function extractErrorMessages(err: any) {
    let errorMessages: Error[] = [];

    for (const key in err) {
      if (typeof err[key] === "object" && err[key] !== null) {
        if (err[key].message) {
          errorMessages.push({ key: key, message: err[key].message });
        } else {
          const nestedErrors = extractErrorMessages(err[key]);
          errorMessages = errorMessages.concat(nestedErrors);
        }
      }
    }

    return errorMessages;
  }

  function convertToTitleCase(input: string): string {
    const words = input.replace(/([a-z])([A-Z])/g, "$1 $2").split(/(?=[A-Z])/);
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(" ");
  }

  const errorsArray = extractErrorMessages(errors);

  if (errorsArray.length > 0)
    return (
      <div
        className="w-full inline-block p-4 text-pink-500 border rounded border-red-900/10 bg-pink-100 mb-8"
        role="alert"
      >
        <strong className="text-pink-500 font-medium text-sm">
          There {errorsArray.length === 1 ? "was" : "were"} {errorsArray.length}{" "}
          {errorsArray.length === 1 ? "error" : "errors"} with your form
          submission
        </strong>
        <ul className="mt-1 ml-2 text-black text-sm list-disc list-inside">
          {errorsArray.map((o: Error) => (
            <li className="text-black my-1" key={o.key}>
              {`${convertToTitleCase(o.key)}: ${o.message}`}
            </li>
          ))}
        </ul>
      </div>
    );

  return null;
}
