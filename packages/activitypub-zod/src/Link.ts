import { z } from "zod";

import { urlValue } from "./common.js";
import { ContextSchema } from "./Context.js";
import { AnyObjectSchema, ObjectBase } from "./Objects.js";

export const ShallowLinkSchema = ContextSchema.extend({
  type: z.enum(["Hashtag", "Link", "Mention"]),
  href: urlValue.nullish(),
  rel: z.union([z.string(), z.array(z.string())]).nullish(),
  mediaType: z.string().nullish(),
  name: z.string().nullish(),
  nameMap: z.record(z.string()).nullish(),
  hreflang: z.string().nullish(),
  height: z.number().int().positive().nullish(),
  width: z.number().int().positive().nullish(),
});

type LinkBase = z.infer<typeof ShallowLinkSchema> & {
  preview?: string | Link | ObjectBase | null | undefined;
};

const lazyLink = () =>
  ShallowLinkSchema.extend({
    preview: z.union([urlValue, LinkSchema, AnyObjectSchema]).nullish(),
  });

const LinkBaseSchema: z.ZodType<LinkBase> = z.lazy(lazyLink);

export type Hashtag = Omit<LinkBase, "type"> & {
  type: "Hashtag";
};

export const HashtagSchema: z.ZodType<Hashtag> = z.lazy(() =>
  lazyLink()
    .omit({ type: true })
    .extend({
      type: z.literal("Hashtag"),
    }),
);

export type Mention = Omit<LinkBase, "type"> & {
  type: "Mention";
};

export const MentionSchema: z.ZodType<Mention> = z.lazy(() =>
  lazyLink()
    .omit({ type: true })
    .extend({
      type: z.literal("Mention"),
    }),
);

export type Link = Hashtag | LinkBase | Mention;

export const LinkSchema = z.union([
  HashtagSchema,
  LinkBaseSchema,
  MentionSchema,
]);
