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

export const SharedInbox = { path: "sharedInbox" as const };
