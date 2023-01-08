import { z } from "zod";

import { dateValue, DateValue, urlValue } from "./common.js";
import { LinkSchema } from "./Link.js";

import {
  anyLinkObjectUrlArray,
  AnyLinkObjectUrlArray,
  AnyObjectSchema,
  lazyObjectBaseSchema,
  LinkObjectUrl,
  ObjectBase,
} from "./Objects.js";

type ActivityBase = Omit<ObjectBase, "type"> & {
  type:
    | "Accept"
    | "Add"
    | "Announce"
    | "Block"
    | "Create"
    | "Delete"
    | "Dislike"
    | "Flag"
    | "Follow"
    | "Ignore"
    | "Invite"
    | "Join"
    | "Leave"
    | "Like"
    | "Listen"
    | "Move"
    | "Offer"
    | "Reject"
    | "Read"
    | "Remove"
    | "TentativeReject"
    | "TentativeAccept"
    | "Undo"
    | "Update"
    | "View";
  actor?: AnyLinkObjectUrlArray | null | undefined;
  instrument?: AnyLinkObjectUrlArray | null | undefined;
  object?: AnyLinkObjectUrlArray | null | undefined;
  origin?: AnyLinkObjectUrlArray | null | undefined;
  result?: AnyLinkObjectUrlArray | null | undefined;
  target?: AnyLinkObjectUrlArray | null | undefined;
};

const lazyActivitySchema = () => {
  return lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.enum([
        "Accept",
        "Add",
        "Announce",
        "Block",
        "Create",
        "Delete",
        "Dislike",
        "Flag",
        "Follow",
        "Ignore",
        "Invite",
        "Join",
        "Leave",
        "Like",
        "Listen",
        "Move",
        "Offer",
        "Reject",
        "Read",
        "Remove",
        "TentativeReject",
        "TentativeAccept",
        "Undo",
        "Update",
        "View",
      ]),
      actor: anyLinkObjectUrlArray().nullish(),
      instrument: anyLinkObjectUrlArray().nullish(),
      object: anyLinkObjectUrlArray().nullish(),
      origin: anyLinkObjectUrlArray().nullish(),
      result: anyLinkObjectUrlArray().nullish(),
      target: anyLinkObjectUrlArray().nullish(),
    });
};

export type IntransitiveActivity = Omit<ObjectBase, "type"> & {
  type: "Arrive" | "Travel";
};

export const lazyIntransitiveActivity = () =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.enum(["Arrive", "Travel"]),
    });

export const IntransitiveActivitySchema: z.ZodType<IntransitiveActivity> =
  z.lazy(lazyIntransitiveActivity);

export type Question = Omit<ActivityBase, "type"> & {
  type: "Question";
  closed?: DateValue | boolean | null | undefined;
} & (
    | { anyOf: LinkObjectUrl[]; oneOf: never }
    | { anyOf: never; oneOf: LinkObjectUrl[] }
  );

export const lazyQuestion = () => {
  const objectOrLink = z.union([urlValue, LinkSchema, AnyObjectSchema]);
  return lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Question"),
      closed: z.union([dateValue, z.boolean()]).nullish(),
    })
    .and(
      z.union([
        z.object({ anyOf: z.array(objectOrLink), oneOf: z.never() }),
        z.object({ anyOf: z.never(), oneOf: z.array(objectOrLink) }),
      ]),
    );
};

export const QuestionSchema: z.ZodType<Question> = z.lazy(lazyQuestion);

export type Activity = ActivityBase | Question;

export const ActivitySchema: z.ZodType<Activity> = z.lazy(() =>
  z.union([lazyActivitySchema(), QuestionSchema]),
);

export type AnyActivity = Activity | IntransitiveActivity;

export const AnyActivitySchema: z.ZodType<AnyActivity> = z.lazy(() =>
  z.union([lazyActivitySchema(), IntransitiveActivitySchema]),
);
