import { z } from "zod";

import { urlValue, UrlValue } from "./common.js";
import { Link, LinkSchema } from "./Link.js";
import {
  lazyObjectSchema,
  ObjectOrLink,
  ObjectSchema,
  ObjectType,
} from "./Objects.js";

export type Collection<T = ObjectOrLink> = Omit<ObjectType, "type"> & {
  type: "Collection";
  current?: UrlValue | Link;
  first?: UrlValue | Link;
  last?: UrlValue | Link;
  items?: T[];
  totalItems?: number;
};

export const lazyCollectionSchema = (of: z.ZodTypeAny = ObjectSchema) => {
  const urlOrLink = z.union([urlValue, LinkSchema]);
  return lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Collection"),
      current: urlOrLink.optional(),
      first: urlOrLink.optional(),
      last: urlOrLink.optional(),
      items: z.array(z.union([urlValue, LinkSchema, of])).optional(),
      totalItems: z.number().positive().optional(),
    });
};

export const CollectionSchema: z.ZodType<Collection> =
  z.lazy(lazyCollectionSchema);

export type CollectionPage<T = ObjectOrLink> = Omit<Collection<T>, "type"> & {
  type: "CollectionPage";
  partOf?: UrlValue | Link;
  next?: UrlValue | Link;
  prev?: UrlValue | Link;
};

export const lazyCollectionPageSchema = (of: z.ZodTypeAny = ObjectSchema) => {
  const urlOrLink = z.union([urlValue, LinkSchema]);
  return lazyCollectionSchema(of)
    .omit({ type: true })
    .extend({
      type: z.literal("CollectionPage"),
      partOf: urlOrLink.optional(),
      next: urlOrLink.optional(),
      prev: urlOrLink.optional(),
    });
};

export const CollectionPageSchema: z.ZodType<CollectionPage> = z.lazy(
  lazyCollectionPageSchema,
);
