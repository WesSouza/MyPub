import { ActorCollection } from "@mypub/types";

export const ActivityPubPathSegments = {
  activity: "activity",
  followers: "followers",
  following: "following",
  inbox: "inbox",
  liked: "liked",
  outbox: "outbox",
  replies: "replies",
  sharedInbox: "sharedInbox",
  statuses: "statuses",
  users: "users",
} as const;

export const ActorCollections: Record<
  ActorCollection,
  { path: keyof typeof ActivityPubPathSegments }
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

export const SharedInbox = { path: "sharedInbox" as const };
