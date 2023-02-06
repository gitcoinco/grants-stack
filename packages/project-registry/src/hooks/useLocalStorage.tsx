import { datadogRum } from "@datadog/browser-rum";
import { useState } from "react";
import { LocalStorage } from "../services/Storage";

export default function useLocalStorage(key: string, defaultValue: any): any[] {
  const localStorage = new LocalStorage();

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.get(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      datadogRum.addError(error);
      console.error(error);
      return defaultValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.add(key, JSON.stringify(valueToStore));
    } catch (error) {
      datadogRum.addError(error);
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
