import { SimpleError } from "@mypub/types";

export function isSimpleError(value: unknown): value is SimpleError {
  return Boolean(
    value &&
      typeof value === "object" &&
      "error" in value &&
      typeof value.error === "string",
  );
}
