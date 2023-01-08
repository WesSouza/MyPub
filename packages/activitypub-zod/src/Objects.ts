import { z } from "zod";

import {
  AnyActivity,
  AnyActivitySchema,
  Question,
  QuestionSchema,
} from "./Activities.js";
import { Actor, ActorSchema } from "./Actors.js";
import { Collection, CollectionSchema } from "./Collection.js";
import {
  DateValue,
  dateValue,
  durationValue,
  UrlValue,
  urlValue,
} from "./common.js";
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

  // Mastodon
  blurhash: z.string().nullish(),
  conversation: z.string().nullish(),
  focalPoint: z
    .tuple([z.number().min(-1).max(1), z.number().min(-1).max(1)])
    .nullish(),
  sensitive: z.boolean().nullish(),

  // Undocumented Mastodon >:-(
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
});

export type ObjectBase = z.infer<typeof ShallowObjectSchema> & {
  attachment?: LinkObjectUrlArray | null | undefined;
  attributedTo?: LinkObjectUrlArray | null | undefined;
  audience?: LinkObjectUrlArray | null | undefined;
  bcc?: LinkObjectUrlArray | null | undefined;
  bto?: LinkObjectUrlArray | null | undefined;
  cc?: LinkObjectUrlArray | null | undefined;
  context?: LinkObjectUrlArray | null | undefined;
  generator?: LinkObjectUrlArray | null | undefined;
  icon?: ImageLinkUrlArray | null | undefined;
  image?: ImageLinkUrlArray | null | undefined;
  inReplyTo?: LinkObjectUrlArray | null | undefined;
  likes?: CollectionLinkUrl | null | undefined;
  location?: LinkObjectUrlArray | null | undefined;
  preview?: LinkObjectUrl | null | undefined;
  replies?: CollectionLinkUrl | null | undefined;
  shares?: CollectionLinkUrl | null | undefined;
  tag?: LinkObjectUrlArray | null | undefined;
  to?: LinkObjectUrlArray | null | undefined;
  url?: LinkUrlArray | null | undefined;
};

export const lazyObjectBaseSchema = () => {
  return ShallowObjectSchema.extend({
    attachment: linkObjectUrlArray().nullish(),
    attributedTo: linkObjectUrlArray().nullish(),
    audience: linkObjectUrlArray().nullish(),
    bcc: linkObjectUrlArray().nullish(),
    bto: linkObjectUrlArray().nullish(),
    cc: linkObjectUrlArray().nullish(),
    context: linkObjectUrlArray().nullish(),
    generator: linkObjectUrlArray().nullish(),
    icon: imageLinkUrlArray().nullish(),
    image: imageLinkUrlArray().nullish(),
    inReplyTo: linkObjectUrlArray().nullish(),
    likes: collectionLinkUrl().nullish(),
    location: linkObjectUrlArray().nullish(),
    preview: linkObjectUrl().nullish(),
    replies: collectionLinkUrl().nullish(),
    shares: collectionLinkUrl().nullish(),
    tag: linkObjectUrlArray().nullish(),
    to: linkObjectUrlArray().nullish(),
    url: linkUrlArray().nullish(),
  });
};

export type Article = Omit<ObjectBase, "type"> & {
  type: "Article";
};

export const ArticleSchema: z.ZodType<Article> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Article"),
    }),
);

export type Audio = Omit<ObjectBase, "type"> & {
  type: "Audio";
};

export const AudioSchema: z.ZodType<Audio> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Audio"),
    }),
);

export type Document = Omit<ObjectBase, "type"> & {
  type: "Document";
};

export const DocumentSchema: z.ZodType<Document> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Document"),
    }),
);

export type Event = Omit<ObjectBase, "type"> & {
  type: "Event";
};

export const EventSchema: z.ZodType<Event> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Event"),
    }),
);

export type Image = Omit<ObjectBase, "type"> & {
  type: "Image";
};

export const ImageSchema: z.ZodType<Image> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Image"),
    }),
);

export type Note = Omit<ObjectBase, "type"> & {
  type: "Note";
};

export const NoteSchema: z.ZodType<Note> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Note"),
    }),
);

export type Page = Omit<ObjectBase, "type"> & {
  type: "Page";
};

export const PageSchema: z.ZodType<Page> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Page"),
    }),
);

export type Place = Omit<ObjectBase, "type"> & {
  type: "Place";
  accuracy?: number | null | undefined;
  altitude?: number | null | undefined;
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
  radius?: number | null | undefined;
  units?:
    | "cm"
    | "feet"
    | "inches"
    | "km"
    | "m"
    | "miles"
    | string
    | null
    | undefined;
};

export const PlaceSchema: z.ZodType<Place> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Place"),
      accuracy: z.number().positive().nullable(),
      altitude: z.number().nullable(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      radius: z.number().positive().nullable(),
      units: z
        .union([
          z.enum(["cm", "feet", "inches", "km", "m", "miles"]),
          z.string(),
        ])
        .nullable(),
    }),
);

export type Profile = Omit<ObjectBase, "type"> & {
  type: "Profile";
  describes?: UrlValue | Actor | null | undefined;
};

export const ProfileSchema: z.ZodType<Profile> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Profile"),
      describes: z.union([urlValue, ActorSchema]).nullable(),
    }),
);

export type PropertyValue = Omit<ObjectBase, "name" | "type"> & {
  type: "PropertyValue";
  name: string;
  value: string;
};

export const PropertyValueSchema: z.ZodType<PropertyValue> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ name: true, type: true })
    .extend({
      type: z.literal("PropertyValue"),
      name: z.string(),
      value: z.string(),
    }),
);

export type Relationship = Omit<ObjectBase, "type"> & {
  type: "Relationship";
  subject?: LinkObjectUrl | null | undefined;
  object?: LinkObjectUrlArray | null | undefined;
  relationship?: ObjectUrlArray | null | undefined;
};

export const RelationshipSchema: z.ZodType<Relationship> = z.lazy(() => {
  return lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Relationship"),
      subject: linkObjectUrl().nullable(),
      object: anyLinkObjectUrlArray().nullable(),
      relationship: objectUrlArray().nullable(),
    });
});

export type Tombstone = Omit<ObjectBase, "type"> & {
  type: "Tombstone";
  formerType?: string | null | undefined;
  deleted: DateValue;
};

export const TombstoneSchema: z.ZodType<Tombstone> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Tombstone"),
      formerType: z.string().nullish(),
      deleted: dateValue,
    }),
);

export type Video = Omit<ObjectBase, "type"> & {
  type: "Video";
};

export const VideoSchema: z.ZodType<Video> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Video"),
    }),
);

// Mastodon
export type Emoji = Omit<ObjectBase, "type"> & {
  type: "Emoji";
};

export const EmojiSchema: z.ZodType<Emoji> = z.lazy(() =>
  lazyObjectBaseSchema()
    .omit({ type: true })
    .extend({
      type: z.literal("Emoji"),
    }),
);

export const AnyObjectSchema: z.ZodType<AnyObject> = z.lazy(() =>
  z.union([
    ArticleSchema,
    AudioSchema,
    DocumentSchema,
    EmojiSchema,
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

    // Mastodon uses Question as an object, not an activity >:-(
    QuestionSchema,

    lazyObjectBaseSchema(),
  ]),
);

export type AnyObject =
  | Article
  | Audio
  | Document
  | Emoji
  | Event
  | Image
  | Note
  | Page
  | Place
  | Profile
  | PropertyValue
  | Question
  | Relationship
  | Tombstone
  | Video
  | ObjectBase;

export type ObjectUrlArray = AnyObject | UrlValue | (AnyObject | UrlValue)[];
const objectUrlArray = () => z.union([AnyObjectSchema, urlValue]);

export type AnyLinkObjectUrl = AnyActivity | Actor | LinkObjectUrl;
export const anyLinkObjectUrl = () =>
  z.union([
    AnyActivitySchema,
    ActorSchema,
    LinkSchema,
    AnyObjectSchema,
    urlValue,
  ]);
export const AnyLinkObjectUrlSchema: z.ZodType<AnyLinkObjectUrl> =
  z.lazy(anyLinkObjectUrl);

export type AnyLinkObjectUrlArray = AnyLinkObjectUrl | AnyLinkObjectUrl[];
export const anyLinkObjectUrlArray = () =>
  z.union([anyLinkObjectUrl(), z.array(anyLinkObjectUrl())]);

export type LinkObjectUrl = Link | AnyObject | UrlValue;
const linkObjectUrl = () => z.union([LinkSchema, AnyObjectSchema, urlValue]);

export type LinkObjectUrlArray = LinkObjectUrl | LinkObjectUrl[];
const linkObjectUrlArray = () =>
  z.union([linkObjectUrl(), z.array(linkObjectUrl())]);

type CollectionLinkUrl = UrlValue | Link | Collection | OrderedCollection;
const collectionLinkUrl = () =>
  z.union([CollectionSchema, OrderedCollectionSchema, LinkSchema, urlValue]);

type LinkUrlArray = UrlValue | Link | (UrlValue | Link)[];
const linkUrlArray = () =>
  z.union([LinkSchema, urlValue, z.array(z.union([LinkSchema, urlValue]))]);

type ImageLinkUrlArray = UrlValue | Image | Link | (UrlValue | Image | Link)[];
const imageLinkUrlArray = () =>
  z.union([
    ImageSchema,
    LinkSchema,
    urlValue,
    z.array(z.union([ImageSchema, LinkSchema, urlValue])),
  ]);

export type AnyObjectLink = AnyActivity | Actor | AnyObject | Link;
export const AnyObjectLinkSchema: z.ZodType<AnyObjectLink> = z.lazy(() =>
  z.union([AnyActivitySchema, ActorSchema, LinkSchema, AnyObjectSchema]),
);
