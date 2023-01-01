import { z } from "zod";

export const dateValue = z.string().datetime();
export type DateValue = z.infer<typeof dateValue>;

export const durationValue = z.string();
export type DurationValue = z.infer<typeof durationValue>;

export const urlValue = z.string().url();
export type UrlValue = z.infer<typeof urlValue>;
