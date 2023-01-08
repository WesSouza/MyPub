import { AnyLinkObjectUrlArray, AnyObjectLink } from "activitypub-zod";

export function isSingleObject(
  fromObject: AnyLinkObjectUrlArray | null | undefined,
): fromObject is AnyObjectLink {
  return Boolean(
    fromObject && !Array.isArray(fromObject) && typeof fromObject === "object",
  );
}

export function isSingleOfType<T extends AnyObjectLink>(
  fromObject: AnyLinkObjectUrlArray | null | undefined,
  type: T["type"],
): fromObject is T {
  return Boolean(
    fromObject &&
      !Array.isArray(fromObject) &&
      typeof fromObject === "object" &&
      fromObject.type === type,
  );
}
