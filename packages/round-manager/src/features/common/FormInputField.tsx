import { FC } from "react";
import { UseFormRegisterReturn, FieldErrors } from "react-hook-form";
import { Input } from "common/src/styles";
import { Round } from "../api/types";
import _ from "lodash";

export const FormInputField: FC<{
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  label: string;
  id: string;
  placeholder?: string;
}> = ({ register, errors, label, id, placeholder }) => {
  const errorMessage = _.get(errors, id)?.message;
  const hasError = Boolean(errorMessage);

  return (
    <div className="col-span-6 sm:col-span-3">
      <div className="flex justify-between">
        <label htmlFor={id} className="text-sm">{label}</label>
        <span className="text-right text-violet-400 float-right text-xs mt-1">*Required</span>
      </div>
      <Input
        {...register}
        className={"h-10"}
        $hasError={hasError}
        type="text"
        id={id}
        placeholder={placeholder}
        data-testid={`${id}-testid`}
      />
      {hasError && (
        <p className="text-xs text-pink-500">{errorMessage}</p>
      )}
    </div>
  );
};
