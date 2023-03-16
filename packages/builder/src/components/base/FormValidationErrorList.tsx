export default function FormValidationErrorList({ formValidation }: any) {
  if (!formValidation.valid && formValidation.errorCount > 0)
    return (
      <div
        className="p-4 text-gitcoin-pink-500 border rounded border-red-900/10 bg-gitcoin-pink-100 mt-8"
        role="alert"
      >
        <strong className="text-gitcoin-pink-500 font-medium text-sm">
          There {formValidation.errorCount === 1 ? "was" : "were"}{" "}
          {formValidation.errorCount}{" "}
          {formValidation.errorCount === 1 ? "error" : "errors"} with your form
          submission
        </strong>
        <ul className="mt-1 ml-2 text-black text-sm list-disc list-inside">
          {formValidation.messages.map((o: string) => (
            <li className="text-black my-1" key={o}>
              {o}
            </li>
          ))}
        </ul>
      </div>
    );

  return null;
}
