import { z } from "zod";

import { ActorSchema } from "./Actors.js";
import { dateValue, DateValue, UrlValue, urlValue } from "./common.js";
import { LinkSchema } from "./Link.js";

import {
  lazyObjectSchema,
  ObjectOrLink,
  ObjectOrLinkOrArray,
  ObjectSchema,
  ObjectType,
} from "./Objects.js";

type ActivityBase = Omit<ObjectType, "type"> & {
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
  actor?: ObjectOrLinkOrArray;
  instrument?: ObjectOrLinkOrArray;
  object?: UrlValue | ObjectType | (UrlValue | ObjectType)[];
  origin?: ObjectOrLinkOrArray;
  result?: ObjectOrLinkOrArray;
  target?: ObjectOrLinkOrArray;
};

const lazyActivitySchema = () => {
  const object = z.union([urlValue, ObjectSchema]);
  const objectOrArray = z.union([object, z.array(object)]);
  const objectOrLink = z.union([urlValue, LinkSchema, ObjectSchema]);
  const objectOrLinkOrArray = z.union([objectOrLink, z.array(objectOrLink)]);
  return lazyObjectSchema()
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
      actor: z.union([ActorSchema, z.array(ActorSchema)]).optional(),
      instrument: objectOrArray.optional(),
      object: objectOrArray.optional(),
      origin: objectOrArray.optional(),
      result: objectOrArray.optional(),
      target: objectOrLinkOrArray.optional(),
    });
};

export type IntransitiveActivity = Omit<ObjectType, "type"> & {
  type: "Arrive" | "Travel";
};

export const lazyIntransitiveActivity = () =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.enum(["Arrive", "Travel"]),
    });

export const IntransitiveActivitySchema: z.ZodType<IntransitiveActivity> =
  z.lazy(lazyIntransitiveActivity);

export type Question = Omit<ObjectType, "type"> & {
  type: "Question";
  closed?: DateValue | boolean;
} & (
    | { anyOf: ObjectOrLink[]; oneOf: never }
    | { anyOf: never; oneOf: ObjectOrLink[] }
  );

export const lazyQuestion = () => {
  const objectOrLink = z.union([urlValue, LinkSchema, ObjectSchema]);
  return lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Question"),
      closed: z.union([dateValue, z.boolean()]).optional(),
    })
    .and(
      z.union([
        z.object({ anyOf: z.array(objectOrLink), oneOf: z.never() }),
        z.object({ anyOf: z.never(), oneOf: z.array(objectOrLink) }),
      ]),
    );
};

export const QuestionSchema: z.ZodType<Question> = z.lazy(lazyQuestion);

export type Activity = ActivityBase | IntransitiveActivity | Question;

export const ActivitySchema: z.ZodType<Activity> = z.lazy(() =>
  z.union([lazyActivitySchema(), IntransitiveActivitySchema, QuestionSchema]),
);
