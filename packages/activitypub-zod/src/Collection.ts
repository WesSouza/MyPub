import { z } from "zod";

import { urlValue, UrlValue } from "./common.js";
import { Link, LinkSchema } from "./Link.js";
import {
  anyLinkObjectUrl,
  AnyLinkObjectUrl,
  lazyObjectBaseSchema,
  ObjectBase,
} from "./Objects.js";

export type Collection<T = AnyLinkObjectUrl> = Omit<ObjectBase, "type"> & {
  type: "Collection";
  current?: CollectionPage | UrlValue | Link | null | undefined;
  first?: CollectionPage | UrlValue | Link | null | undefined;
  last?: CollectionPage | UrlValue | Link | null | undefined;
  items?: T[] | null | undefined;
  totalItems?: number | null | undefined;
};

export const lazyCollectionSchema = (of?: z.ZodTypeAny) => {
  of ??= anyLinkObjectUrl();
  const collectionPageOrLink = z.union([
    urlValue,
    LinkSchema,
    CollectionPageSchema,
  ]);
  return lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Collection"),
      current: collectionPageOrLink.nullish(),
      first: collectionPageOrLink.nullish(),
      last: collectionPageOrLink.nullish(),
      items: z.array(of).nullish(),
      totalItems: z.number().int().positive().nullish(),
    });
};

export const CollectionSchema: z.ZodType<Collection> =
  z.lazy(lazyCollectionSchema);

export type CollectionPage<T = AnyLinkObjectUrl> = {
  type: "CollectionPage";
  current?: CollectionPage | UrlValue | Link | null | undefined;
  first?: CollectionPage | UrlValue | Link | null | undefined;
  items?: T[] | null | undefined;
  last?: CollectionPage | UrlValue | Link | null | undefined;
  next?: UrlValue | Link | null | undefined;
  partOf?: UrlValue | Link | null | undefined;
  prev?: UrlValue | Link | null | undefined;
  totalItems?: number | null | undefined;
};

export const lazyCollectionPageSchema = (of?: z.ZodTypeAny) => {
  const urlOrLink = z.union([urlValue, LinkSchema]);
  return lazyCollectionSchema(of)
    .omit({ type: true })
    .extend({
      type: z.literal("CollectionPage"),
      partOf: urlOrLink.nullish(),
      next: urlOrLink.nullish(),
      prev: urlOrLink.nullish(),
    });
};

export const CollectionPageSchema: z.ZodType<CollectionPage> = z.lazy(
  lazyCollectionPageSchema,
);
