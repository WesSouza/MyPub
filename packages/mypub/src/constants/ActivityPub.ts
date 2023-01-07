import { ActorCollection, MyPubPathSegment } from "@mypub/types";

export const ActorCollections: Record<
  ActorCollection,
  { path: MyPubPathSegment }
> = {
  Followers: { path: "followers" },
  Following: { path: "following" },
  Inbox: { path: "inbox" },
  Liked: { path: "liked" },
  Outbox: { path: "outbox" },
} as const;

export const HandleRegExpSingle =
  /^(?<handle>[a-z0-9\-\._]+)@(?<domain>[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,})$/i;
export const HandleRegExpMultiple =
  /(?<prefix>@?)(?<handle>[a-z0-9\-\._]+)@(?<domain>[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,})/gi;

export const PublicDestination = "https://www.w3.org/ns/activitystreams#Public";
