import type { Types } from "mongoose";

export function withStringId<T extends { _id: Types.ObjectId }>(
  result: T,
): T & { id: string } {
  return {
    ...result,
    id: result._id.toString(),
  };
}
