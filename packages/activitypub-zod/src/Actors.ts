import { z } from "zod";

import { DateValue, dateValue, UrlValue, urlValue } from "./common.js";
import { lazyObjectSchema, ObjectType } from "./Objects.js";

export type Actor = Omit<ObjectType, "id" | "type"> & {
  id: string;
  type: "Application" | "Group" | "Organization" | "Person" | "Service";
  inbox?: UrlValue;
  outbox?: UrlValue;
  endpoints?: {
    sharedInbox?: UrlValue;
  };
  followers?: UrlValue;
  following?: UrlValue;
  preferredUsername?: string;

  // Mastodon
  devices?: UrlValue;
  discoverable?: boolean;
  featured?: UrlValue;
  featuredTags?: UrlValue;
  manuallyApprovesFollowers?: boolean;
  published?: DateValue;

  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
};

export const lazyActor = () =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      id: z.string(),
      type: z.enum([
        "Application",
        "Group",
        "Organization",
        "Person",
        "Service",
      ]),

      inbox: urlValue,
      outbox: urlValue,
      endpoints: z
        .object({
          sharedInbox: urlValue.optional(),
        })
        .optional(),
      followers: urlValue.optional(),
      following: urlValue.optional(),
      preferredUsername: z.string().optional(),

      // Mastodon
      devices: urlValue.optional(),
      discoverable: z.boolean().optional(),
      featured: urlValue.optional(),
      featuredTags: urlValue.optional(),
      manuallyApprovesFollowers: z.boolean().optional(),
      published: dateValue.optional(),

      // Security
      publicKey: z
        .object({
          id: z.string(),
          owner: z.string(),
          publicKeyPem: z.string(),
        })
        .optional(),
    });

export const ActorSchema: z.ZodType<Actor> = z.lazy(lazyActor);
