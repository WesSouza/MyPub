import { z } from "zod";

import { urlValue, UrlValue } from "./common.js";
import { Link, LinkSchema } from "./Link.js";
import {
  lazyObjectSchema,
  ObjectOrLink,
  ObjectSchema,
  ObjectType,
} from "./Objects.js";

export type OrderedCollection<T = ObjectOrLink> = Omit<ObjectType, "type"> & {
  type: "OrderedCollection";
  current?: UrlValue | Link;
  first?: UrlValue | Link;
  last?: UrlValue | Link;
  orderedItems?: T[];
  totalItems?: number;
};

export const lazyOrderedCollectionSchema = (
  of: z.ZodTypeAny = ObjectSchema,
) => {
  const urlOrLink = z.union([urlValue, LinkSchema]);
  return lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("OrderedCollection"),
      current: urlOrLink.optional(),
      first: urlOrLink.optional(),
      last: urlOrLink.optional(),
      orderedItems: z.array(z.union([urlValue, LinkSchema, of])).optional(),
      totalItems: z.number().positive().optional(),
    });
};

export const OrderedCollectionSchema: z.ZodType<OrderedCollection> = z.lazy(
  lazyOrderedCollectionSchema,
);

export type OrderedCollectionPage<T = ObjectOrLink> = Omit<
  OrderedCollection<T>,
  "type"
> & {
  type: "OrderedCollectionPage";
  partOf?: UrlValue | Link;
  next?: UrlValue | Link;
  prev?: UrlValue | Link;
  startIndex?: number;
};

export const lazyOrderedCollectionPageSchema = (
  of: z.ZodTypeAny = ObjectSchema,
) => {
  const urlOrLink = z.union([urlValue, LinkSchema]);
  return lazyOrderedCollectionSchema(of)
    .omit({ type: true })
    .extend({
      type: z.literal("OrderedCollectionPage"),
      partOf: urlOrLink.optional(),
      next: urlOrLink.optional(),
      prev: urlOrLink.optional(),
      startIndex: z.number().positive().optional(),
    });
};

export const OrderedCollectionPageSchema: z.ZodType<OrderedCollectionPage> =
  z.lazy(lazyOrderedCollectionPageSchema);
