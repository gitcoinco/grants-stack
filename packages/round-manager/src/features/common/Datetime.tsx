import moment from "moment";
import { ReactElement } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";

interface DatetimeProps<T extends FieldValues> {
  control: Control<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  name: any;
  label: string;
  date?: moment.Moment;
  setDate?: (date: moment.Moment) => void;  
  minDate?: moment.Moment;
  disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Datetime = <T extends FieldValues>({ control, name, label, date, setDate, minDate, disabled }: DatetimeProps<T>): ReactElement => {
  const now = moment().format('YYYY-MM-DDTHH:mm');
  return (
    <div 
      className="relative w-full border-0 p-0 placeholder-grey-40 focus:ring-0 text-sm">
      <label
        htmlFor={name}
        className="block text-[10px]"
      >
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input
          data-testid={`${name}-testid`} 
          type="datetime-local"
          {...field}
          min={minDate ? minDate.format('YYYY-MM-DDTHH:mm') : now}
          className="block w-full border-0 p-0 focus:ring-0 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          value={date?.format('YYYY-MM-DDTHH:mm')}
          onChange={(e) => {
            // Convert the local datetime to UTC
              const date = moment.utc(e.target.value);
              if (setDate) setDate(date);
              field.onChange(e.target.value);
            }}
          />
        )}
      />
    </div>
  );
};

