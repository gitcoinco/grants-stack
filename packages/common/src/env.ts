import { z } from "zod";

interface Options {
  required: boolean;
  defaultValue?: string;
}

const defaultOptions = {
  required: true,
  defaultValue: undefined,
};

export function getEnv(
  name: string,
  options: Options = defaultOptions
): string | undefined {
  let zValue = z.string({
    required_error: `env var ${name} is required`,
  });

  if (options.required) {
    zValue.min(1);
  }

  const result = zValue.safeParse(process.env[name]);
  if (result.success) {
    return result.data;
  }

  if (options.required) {
    throw new Error(`required env var not set: ${name}`);
  }

  return options.defaultValue;
}
