import { z } from "zod";

import { DateValue, dateValue, UrlValue, urlValue } from "./common.js";
import { lazyObjectBaseSchema, ObjectBase } from "./Objects.js";

export type Actor = Omit<ObjectBase, "id" | "type"> & {
  id: string;
  type: "Application" | "Group" | "Organization" | "Person" | "Service";
  inbox?: UrlValue | null | undefined;
  outbox?: UrlValue | null | undefined;
  endpoints?:
    | {
        sharedInbox?: UrlValue | null | undefined;
      }
    | null
    | undefined;
  followers?: UrlValue | null | undefined;
  following?: UrlValue | null | undefined;
  preferredUsername?: string | null | undefined;

  // Mastodon
  devices?: UrlValue | null | undefined;
  discoverable?: boolean | null | undefined;
  featured?: UrlValue | null | undefined;
  featuredTags?: UrlValue | null | undefined;
  manuallyApprovesFollowers?: boolean | null | undefined;
  published?: DateValue | null | undefined;

  publicKey?:
    | {
        id: string;
        owner: string;
        publicKeyPem: string;
      }
    | null
    | undefined;
};

export const lazyActor = () =>
  lazyObjectBaseSchema()
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
          sharedInbox: urlValue.nullish(),
        })
        .nullish(),
      followers: urlValue.nullish(),
      following: urlValue.nullish(),
      preferredUsername: z.string().nullish(),

      // Mastodon
      devices: urlValue.nullish(),
      discoverable: z.boolean().nullish(),
      featured: urlValue.nullish(),
      featuredTags: urlValue.nullish(),
      manuallyApprovesFollowers: z.boolean().nullish(),
      published: dateValue.nullish(),

      // Security
      publicKey: z
        .object({
          id: z.string(),
          owner: z.string(),
          publicKeyPem: z.string(),
        })
        .nullish(),
    });

export const ActorSchema: z.ZodType<Actor> = z.lazy(lazyActor);
