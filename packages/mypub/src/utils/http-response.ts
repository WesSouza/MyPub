import { Errors, ErrorStatuses, ErrorType } from "../constants/index.js";

export function respondWithError(
  errorType: ErrorType,
  error: keyof typeof Errors | string,
  reason?: unknown,
) {
  console.trace({ error, reason });
  return new Response(JSON.stringify({ error }), {
    status: ErrorStatuses[errorType].status,
    statusText: ErrorStatuses[errorType].statusText,
  });
}
