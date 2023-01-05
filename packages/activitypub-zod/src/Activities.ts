import { z } from "zod";
import { ActorSchema } from "./Actors.js";

import { dateValue, DateValue, urlValue } from "./common.js";
import { LinkSchema } from "./Link.js";

import {
  AnyObjectOrArray,
  lazyObjectSchema,
  ObjectOrLink,
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
  actor?: AnyObjectOrArray | null | undefined;
  instrument?: AnyObjectOrArray | null | undefined;
  object?: AnyObjectOrArray | null | undefined;
  origin?: AnyObjectOrArray | null | undefined;
  result?: AnyObjectOrArray | null | undefined;
  target?: AnyObjectOrArray | null | undefined;
};

const lazyActivitySchema = () => {
  const object = z.union([
    urlValue,
    AnyActivitySchema,
    ActorSchema,
    ObjectSchema,
  ]);
  const objectOrArray = z.union([object, z.array(object)]);
  const objectOrLink = z.union([urlValue, LinkSchema, ObjectSchema]);
  const objectOrLinkOrArray = z.union([objectOrLink, z.array(objectOrLink)]);
  const actorOrLink = z.union([urlValue, LinkSchema, ActorSchema]);
  const actorOrLinkOrArray = z.union([actorOrLink, z.array(actorOrLink)]);

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
      actor: actorOrLinkOrArray.nullish(),
      instrument: objectOrArray.nullish(),
      object: objectOrLinkOrArray.nullish(),
      origin: objectOrArray.nullish(),
      result: objectOrArray.nullish(),
      target: objectOrLinkOrArray.nullish(),
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

export type Question = Omit<ActivityBase, "type"> & {
  type: "Question";
  closed?: DateValue | boolean | null | undefined;
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
