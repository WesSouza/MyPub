import { SimpleError } from "@mypub/types";

import { Errors, ErrorStatuses, ErrorType } from "../constants/index.js";

export function respondWithError(
  errorType: ErrorType,
  error: keyof typeof Errors | string,
  reason?: Error | SimpleError,
) {
  console.error(error, reason ?? "");
  return new Response(JSON.stringify({ error }), {
    status: ErrorStatuses[errorType].status,
    statusText: ErrorStatuses[errorType].statusText,
  });
}
