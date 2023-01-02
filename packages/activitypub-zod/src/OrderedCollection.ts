import { z } from "zod";

import { urlValue, UrlValue } from "./common.js";
import { Link, LinkSchema } from "./Link.js";
import {
  anyObject,
  AnyObject,
  lazyObjectSchema,
  ObjectType,
} from "./Objects.js";

export type OrderedCollection<T = AnyObject> = Omit<ObjectType, "type"> & {
  type: "OrderedCollection";
  current?: OrderedCollectionPage | UrlValue | Link | null | undefined;
  first?: OrderedCollectionPage | UrlValue | Link | null | undefined;
  last?: OrderedCollectionPage | UrlValue | Link | null | undefined;
  orderedItems?: T[] | null | undefined;
  totalItems?: number | null | undefined;
};

export const lazyOrderedCollectionSchema = (of?: z.ZodTypeAny) => {
  of ??= anyObject();
  const orderedCollectionPageOrLink = z.union([
    urlValue,
    LinkSchema,
    OrderedCollectionPageSchema,
  ]);
  return lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("OrderedCollection"),
      current: orderedCollectionPageOrLink.nullish(),
      first: orderedCollectionPageOrLink.nullish(),
      last: orderedCollectionPageOrLink.nullish(),
      orderedItems: z.array(of).nullish(),
      totalItems: z.number().positive().nullish(),
    });
};

export const OrderedCollectionSchema: z.ZodType<OrderedCollection> = z.lazy(
  lazyOrderedCollectionSchema,
);

export type OrderedCollectionPage<T = AnyObject> = {
  type: "OrderedCollectionPage";
  current?: OrderedCollectionPage | UrlValue | Link | null | undefined;
  first?: OrderedCollectionPage | UrlValue | Link | null | undefined;
  items?: T[] | null | undefined;
  last?: OrderedCollectionPage | UrlValue | Link | null | undefined;
  next?: UrlValue | Link | null | undefined;
  partOf?: UrlValue | Link | null | undefined;
  prev?: UrlValue | Link | null | undefined;
  startIndex?: number | null | undefined;
  totalItems?: number | null | undefined;
};

export const lazyOrderedCollectionPageSchema = (of?: z.ZodTypeAny) => {
  const urlOrLink = z.union([urlValue, LinkSchema]);
  return lazyOrderedCollectionSchema(of)
    .omit({ type: true })
    .extend({
      type: z.literal("OrderedCollectionPage"),
      partOf: urlOrLink.nullish(),
      next: urlOrLink.nullish(),
      prev: urlOrLink.nullish(),
      startIndex: z.number().positive().optional(),
    });
};

export const OrderedCollectionPageSchema: z.ZodType<OrderedCollectionPage> =
  z.lazy(lazyOrderedCollectionPageSchema);
