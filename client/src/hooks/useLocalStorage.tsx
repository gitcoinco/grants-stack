import { useState } from "react";
import { useDatadogRum } from "react-datadog";
import { LocalStorage } from "../services/Storage";

export default function useLocalStorage(key: string, defaultValue: any): any[] {
  const localStorage = new LocalStorage();
  const dataDog = useDatadogRum();

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.get(key);
      return item ?? defaultValue;
    } catch (error) {
      dataDog.addError(error);
      console.error(error);
      return defaultValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.add(key, valueToStore);
    } catch (error) {
      dataDog.addError(error);
      console.error(error);
    }
  };
  return [storedValue, setValue];
}
