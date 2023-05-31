import { UseFormRegisterReturn, FieldErrors, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "common/src/styles";
import { get } from "lodash";

export const FormInputField = <T extends FieldValues, >({
  register,
  errors,
  label,
  id,
  placeholder,
  disabled,
}: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<T>;
  label: string;
  id: FieldPath<T>;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const errorMessage = get(errors, id)?.message;

  const hasError = Boolean(errorMessage);

  return (
    <div className="col-span-6 sm:col-span-3">
      <div className="flex justify-between">
        <label htmlFor={id} className="text-sm">{label}</label>
        <span className="text-right text-violet-400 float-right text-xs mt-1">*Required</span>
      </div>
      <Input
        {...register}
        className={"h-10 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"}
        $hasError={hasError}
        type="text"
        id={id}
        placeholder={placeholder}
        data-testid={`${id}-testid`}
        disabled={disabled}
      />
      {hasError && (
        <p className="text-xs text-pink-500">{errorMessage?.toString()}</p>
      )}
    </div>
  );
};
