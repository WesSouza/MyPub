import { AnyObjectNotString, AnyObjectOrArray } from "activitypub-zod";

export function isSingleObject(
  fromObject: AnyObjectOrArray | null | undefined,
): fromObject is AnyObjectNotString {
  return Boolean(
    fromObject && !Array.isArray(fromObject) && typeof fromObject === "object",
  );
}

export function isSingleOfType<T extends AnyObjectNotString>(
  fromObject: AnyObjectOrArray | null | undefined,
  type: T["type"],
): fromObject is T {
  return Boolean(
    fromObject &&
      !Array.isArray(fromObject) &&
      typeof fromObject === "object" &&
      fromObject.type === type,
  );
}
