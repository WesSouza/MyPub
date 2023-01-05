import { z } from "zod";

import { urlValue } from "./common.js";
import { ContextSchema } from "./Context.js";
import { ObjectSchema, ObjectType } from "./Objects.js";

export const ShallowLinkSchema = ContextSchema.extend({
  type: z.literal("Link"),
  href: urlValue.nullish(),
  rel: z.union([z.string(), z.array(z.string())]).nullish(),
  mediaType: z.string().nullish(),
  name: z.string().nullish(),
  nameMap: z.record(z.string()).nullish(),
  hreflang: z.string().nullish(),
  height: z.number().positive().nullish(),
  width: z.number().positive().nullish(),
});

export type Link = z.infer<typeof ShallowLinkSchema> & {
  preview?: string | Link | ObjectType | null | undefined;
};

export const LinkSchema: z.ZodType<Link> = z.lazy(() =>
  ShallowLinkSchema.extend({
    preview: z.union([urlValue, LinkSchema, ObjectSchema]).nullish(),
  }),
);
