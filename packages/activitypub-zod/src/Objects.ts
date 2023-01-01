import { z } from "zod";

import { Collection, CollectionSchema } from "./Collection.js";
import { dateValue, durationValue, UrlValue, urlValue } from "./common.js";
import { Link, LinkSchema } from "./Link.js";
import {
  OrderedCollection,
  OrderedCollectionSchema,
} from "./OrderedCollection.js";

const ShallowObjectSchema = z.object({
  content: z.string().optional(),
  contentMap: z.record(z.string()).optional(),
  duration: durationValue.optional(),
  endTime: dateValue.optional(),
  id: z.string().optional(),
  mediaType: z.string().optional(),
  name: z.string().optional(),
  nameMap: z.record(z.string()).optional(),
  published: dateValue.optional(),
  startTime: dateValue.optional(),
  source: z
    .object({
      content: z.string(),
      mediaType: z.string().optional(),
    })
    .optional(),
  summary: z.string().optional(),
  summaryMap: z.record(z.string()).optional(),
  type: z.string(),
  updated: dateValue.optional(),
});

type LinkOrArray = UrlValue | Link | (UrlValue | Link)[];
type LinkOrImageOrArray = UrlValue | Image | Link | (UrlValue | Image | Link)[];

export type ObjectOrLink = UrlValue | ObjectType | Link;
export type ObjectOrLinkOrArray = ObjectOrLink | ObjectOrLink[];
type CollectionOrLink = UrlValue | Link | Collection | OrderedCollection;

export type ObjectType = z.infer<typeof ShallowObjectSchema> & {
  attachment?: ObjectOrLinkOrArray;
  attributedTo?: ObjectOrLinkOrArray;
  audience?: ObjectOrLinkOrArray;
  bcc?: ObjectOrLinkOrArray;
  bto?: ObjectOrLinkOrArray;
  cc?: ObjectOrLinkOrArray;
  context?: ObjectOrLinkOrArray;
  generator?: ObjectOrLinkOrArray;
  icon?: LinkOrImageOrArray;
  image?: LinkOrImageOrArray;
  inReplyTo?: ObjectOrLinkOrArray;
  likes?: CollectionOrLink;
  location?: ObjectOrLinkOrArray;
  preview?: ObjectOrLink;
  replies?: CollectionOrLink;
  shares?: CollectionOrLink;
  tag?: ObjectOrLinkOrArray;
  to?: ObjectOrLinkOrArray;
  url?: LinkOrArray;
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
    attachment: objectOrLinkOrArray.optional(),
    attributedTo: objectOrLinkOrArray.optional(),
    audience: objectOrLinkOrArray.optional(),
    bcc: objectOrLinkOrArray.optional(),
    bto: objectOrLinkOrArray.optional(),
    cc: objectOrLinkOrArray.optional(),
    context: objectOrLinkOrArray.optional(),
    generator: objectOrLinkOrArray.optional(),
    icon: imageOrLinkOrArray.optional(),
    image: imageOrLinkOrArray.optional(),
    inReplyTo: objectOrLinkOrArray.optional(),
    likes: collectionOrLink.optional(),
    location: objectOrLinkOrArray.optional(),
    preview: objectOrLink.optional(),
    replies: collectionOrLink.optional(),
    shares: collectionOrLink.optional(),
    tag: objectOrLinkOrArray.optional(),
    to: objectOrLinkOrArray.optional(),
    url: linkOrArray.optional(),
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
