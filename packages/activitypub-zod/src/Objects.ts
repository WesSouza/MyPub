import { z } from "zod";

import { AnyActivity, AnyActivitySchema } from "./Activities.js";
import { Actor, ActorSchema } from "./Actors.js";
import { Collection, CollectionSchema } from "./Collection.js";
import { dateValue, durationValue, UrlValue, urlValue } from "./common.js";
import { ContextSchema } from "./Context.js";
import { Link, LinkSchema } from "./Link.js";
import {
  OrderedCollection,
  OrderedCollectionSchema,
} from "./OrderedCollection.js";

const ShallowObjectSchema = ContextSchema.extend({
  content: z.string().nullish(),
  contentMap: z.record(z.string()).nullish(),
  duration: durationValue.nullish(),
  endTime: dateValue.nullish(),
  id: z.string().nullish(),
  mediaType: z.string().nullish(),
  name: z.string().nullish(),
  nameMap: z.record(z.string()).nullish(),
  published: dateValue.nullish(),
  startTime: dateValue.nullish(),
  source: z
    .object({
      content: z.string(),
      mediaType: z.string().nullish(),
    })
    .nullish(),
  summary: z.string().nullish(),
  summaryMap: z.record(z.string()).nullish(),
  type: z.string(),
  updated: dateValue.nullish(),
});

type LinkOrArray = UrlValue | Link | (UrlValue | Link)[];
type LinkOrImageOrArray = UrlValue | Image | Link | (UrlValue | Image | Link)[];

export type ObjectOrLink = UrlValue | ObjectType | Link;
export type ObjectOrLinkOrArray = ObjectOrLink | ObjectOrLink[];
type CollectionOrLink = UrlValue | Link | Collection | OrderedCollection;

export type ObjectType = z.infer<typeof ShallowObjectSchema> & {
  attachment?: ObjectOrLinkOrArray | null | undefined;
  attributedTo?: ObjectOrLinkOrArray | null | undefined;
  audience?: ObjectOrLinkOrArray | null | undefined;
  bcc?: ObjectOrLinkOrArray | null | undefined;
  bto?: ObjectOrLinkOrArray | null | undefined;
  cc?: ObjectOrLinkOrArray | null | undefined;
  context?: ObjectOrLinkOrArray | null | undefined;
  generator?: ObjectOrLinkOrArray | null | undefined;
  icon?: LinkOrImageOrArray | null | undefined;
  image?: LinkOrImageOrArray | null | undefined;
  inReplyTo?: ObjectOrLinkOrArray | null | undefined;
  likes?: CollectionOrLink | null | undefined;
  location?: ObjectOrLinkOrArray | null | undefined;
  preview?: ObjectOrLink | null | undefined;
  replies?: CollectionOrLink | null | undefined;
  shares?: CollectionOrLink | null | undefined;
  tag?: ObjectOrLinkOrArray | null | undefined;
  to?: ObjectOrLinkOrArray | null | undefined;
  url?: LinkOrArray | null | undefined;
};

export const lazyObjectSchema = () => {
  const objectOrLink = z.union([urlValue, LinkSchema, ObjectSchema]);
  const collectionOrLink = z.union([
    urlValue,
    LinkSchema,
    CollectionSchema,
    OrderedCollectionSchema,
  ]);
  const objectOrLinkOrArray = z.union([objectOrLink, z.array(objectOrLink)]);
  const linkOrArray = z.union([
    urlValue,
    LinkSchema,
    z.array(z.union([urlValue, LinkSchema])),
  ]);
  const imageOrLinkOrArray = z.union([
    urlValue,
    LinkSchema,
    ImageSchema,
    z.array(z.union([urlValue, LinkSchema, ImageSchema])),
  ]);
  return ShallowObjectSchema.extend({
    attachment: objectOrLinkOrArray.nullish(),
    attributedTo: objectOrLinkOrArray.nullish(),
    audience: objectOrLinkOrArray.nullish(),
    bcc: objectOrLinkOrArray.nullish(),
    bto: objectOrLinkOrArray.nullish(),
    cc: objectOrLinkOrArray.nullish(),
    context: objectOrLinkOrArray.nullish(),
    generator: objectOrLinkOrArray.nullish(),
    icon: imageOrLinkOrArray.nullish(),
    image: imageOrLinkOrArray.nullish(),
    inReplyTo: objectOrLinkOrArray.nullish(),
    likes: collectionOrLink.nullish(),
    location: objectOrLinkOrArray.nullish(),
    preview: objectOrLink.nullish(),
    replies: collectionOrLink.nullish(),
    shares: collectionOrLink.nullish(),
    tag: objectOrLinkOrArray.nullish(),
    to: objectOrLinkOrArray.nullish(),
    url: linkOrArray.nullish(),
  });
};

export type Article = Omit<ObjectType, "type"> & {
  type: "Article";
};

export const ArticleSchema: z.ZodType<Article> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Article"),
    }),
);

export type Audio = Omit<ObjectType, "type"> & {
  type: "Audio";
};

export const AudioSchema: z.ZodType<Audio> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Audio"),
    }),
);

export type Document = Omit<ObjectType, "type"> & {
  type: "Document";
};

export const DocumentSchema: z.ZodType<Document> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Document"),
    }),
);

export type Event = Omit<ObjectType, "type"> & {
  type: "Event";
};

export const EventSchema: z.ZodType<Event> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Event"),
    }),
);

export type Image = Omit<ObjectType, "type"> & {
  type: "Image";
};

export const ImageSchema: z.ZodType<Image> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Image"),
    }),
);

export type Note = Omit<ObjectType, "type"> & {
  type: "Note";
};

export const NoteSchema: z.ZodType<Note> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Note"),
    }),
);

export type Page = Omit<ObjectType, "type"> & {
  type: "Page";
};

export const PageSchema: z.ZodType<Page> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Page"),
    }),
);

export type Place = Omit<ObjectType, "type"> & {
  type: "Place";
};

export const PlaceSchema: z.ZodType<Place> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Place"),
    }),
);

export type Profile = Omit<ObjectType, "type"> & {
  type: "Profile";
};

export const ProfileSchema: z.ZodType<Profile> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Profile"),
    }),
);

export type PropertyValue = Omit<ObjectType, "name" | "type"> & {
  type: "PropertyValue";
  name: string;
  value: string;
};

export const PropertyValueSchema: z.ZodType<PropertyValue> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ name: true, type: true })
    .extend({
      type: z.literal("PropertyValue"),
      name: z.string(),
      value: z.string(),
    }),
);

export type Relationship = Omit<ObjectType, "type"> & {
  type: "Relationship";
};

export const RelationshipSchema: z.ZodType<Relationship> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Relationship"),
    }),
);

export type Tombstone = Omit<ObjectType, "type"> & {
  type: "Tombstone";
};

export const TombstoneSchema: z.ZodType<Tombstone> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Tombstone"),
    }),
);

export type Video = Omit<ObjectType, "type"> & {
  type: "Video";
};

export const VideoSchema: z.ZodType<Video> = z.lazy(() =>
  lazyObjectSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Video"),
    }),
);

export const ObjectSchema: z.ZodType<
  | Article
  | Audio
  | Document
  | Event
  | Image
  | Note
  | Page
  | Place
  | Profile
  | PropertyValue
  | Relationship
  | Tombstone
  | Video
  | ObjectType
> = z.lazy(() =>
  z.union([
    ArticleSchema,
    AudioSchema,
    DocumentSchema,
    EventSchema,
    ImageSchema,
    NoteSchema,
    PageSchema,
    PlaceSchema,
    ProfileSchema,
    PropertyValueSchema,
    RelationshipSchema,
    TombstoneSchema,
    VideoSchema,
    lazyObjectSchema(),
  ]),
);

export type AnyObject = AnyActivity | Actor | ObjectOrLink;
export type AnyObjectNotString = AnyActivity | Actor | ObjectType | Link;
export type AnyObjectOrArray = AnyObject | AnyObject[];

export const anyObject = () =>
  z.union([AnyActivitySchema, ActorSchema, urlValue, LinkSchema, ObjectSchema]);
export const anyObjectOrArray = () =>
  z.union([anyObject(), z.array(anyObject())]);

export const AnyObjectSchema: z.ZodType<AnyObject> = z.lazy(anyObject);

export const AnyObjectNotStringSchema: z.ZodType<AnyObjectNotString> = z.lazy(
  () => z.union([AnyActivitySchema, ActorSchema, LinkSchema, ObjectSchema]),
);
