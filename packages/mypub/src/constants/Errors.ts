export type ErrorType = "generic" | "notFound";

export const ErrorStatuses: Record<
  ErrorType,
  { status: number; statusText: string }
> = {
  generic: {
    status: 500,
    statusText: "Internal Server Error",
  },
  notFound: {
    status: 404,
    statusText: "Not Found",
  },
};

export const Errors = {
  missingInstance: "missingInstance",
  X_notImplemented: "X_notImplemented",
} as const;
