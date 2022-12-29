export type ErrorType = "generic" | "badRequest" | "notFound";

export const ErrorStatuses: Record<
  ErrorType,
  { status: number; statusText: string }
> = {
  generic: {
    status: 500,
    statusText: "Internal Server Error",
  },
  badRequest: {
    status: 400,
    statusText: "Bad Request",
  },
  notFound: {
    status: 404,
    statusText: "Not Found",
  },
};

export const Errors = {
  badRequest: "badRequest",
  missingInstance: "missingInstance",
  notFound: "notFound",
  X_notImplemented: "X_notImplemented",
} as const;
