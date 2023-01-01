import { z } from "zod";

import { urlValue } from "./common.js";
import { ContextSchema } from "./Context.js";
import { ObjectSchema, ObjectType } from "./Objects.js";

export const ShallowLinkSchema = ContextSchema.extend({
  href: urlValue.optional(),
  rel: z.union([z.string(), z.array(z.string())]).optional(),
  mediaType: z.string().optional(),
  name: z.string().optional(),
  nameMap: z.record(z.string()).optional(),
  hreflang: z.string().optional(),
  height: z.number().positive().optional(),
  width: z.number().positive().optional(),
});

export type Link = z.infer<typeof ShallowLinkSchema> & {
  preview?: string | Link | ObjectType;
};

export const LinkSchema: z.ZodType<Link> = z.lazy(() =>
  ShallowLinkSchema.extend({
    preview: z.union([urlValue, LinkSchema, ObjectSchema]).optional(),
  }),
);
