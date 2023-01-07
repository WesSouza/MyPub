import { z } from "zod";

const ContextValue = z
  .union([
    z.array(
      z.union([
        z.string(),
        z.record(z.union([z.string(), z.record(z.string())])),
      ]),
    ),
    z.string(),
  ])
  .optional();

export type Context = z.infer<typeof ContextValue>;

export const ContextSchema = z.object({
  "@context": ContextValue,
});
