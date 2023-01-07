export type MyPubPathSegment =
  | "activity"
  | "followers"
  | "following"
  | "inbox"
  | "liked"
  | "node-info"
  | "outbox"
  | "replies"
  | "shared-inbox"
  | "statuses"
  | "users";

export type ActorCollection =
  | "Followers"
  | "Following"
  | "Inbox"
  | "Liked"
  | "Outbox";

export type AsyncResult<T> = Promise<T | SimpleError>;

export type APIResult<T> = T | SimpleError;

export type SimpleError = {
  error: string;
  reason?: unknown;
};

export type MyPubInstanceData = {
  domain: string;
  title: string;
  description: string;
  email: string;
  adminUserId: string;
  pathSegments: Record<MyPubPathSegment, string>;
};

export type MyPubContext = {
  instance: MyPubInstanceData;
  cache: MyPubCacheModule;
  data: MyPubDataModule;
  storage: MyPubStorageModule;
  users: MyPubUsersModule;
};

export type ContextWrapped<T> = (context: MyPubContext) => T;

export type MyPubConfig = {
  instance: Omit<MyPubInstanceData, "pathSegments"> &
    Partial<Pick<MyPubInstanceData, "pathSegments">>;
  cache: ContextWrapped<MyPubCacheModule>;
  data: ContextWrapped<MyPubDataModule>;
  storage: ContextWrapped<MyPubStorageModule>;
  users: ContextWrapped<MyPubUsersModule>;
};

export type MyPubCacheModule = {
  has: (key: string) => boolean | Promise<boolean>;
  get: (key: string) => unknown | Promise<unknown>;
  set: (
    key: string,
    value: unknown,
    options: { expiresIn?: number },
  ) => void | Promise<void>;
};

export type User = {
  id: string;
  url: string;
  handle: string;
  domain: string;
  name: string;
  summary: string;
  tag: string[];
  links: { name: string; href: string }[];
  images: {
    cover?: string | undefined;
    profile?: string | undefined;
  };
  counts: Record<"followers" | "following" | "content", number>;
  inboxUrl?: string | undefined;
  publicKey: string;
  created: Date;
  updated: Date;
};

export type UserData = Omit<User, "id" | "created" | "updated">;

export type UserFollow = {
  user: User;
  follows: User;
  state: "following" | "pending";
};

export type MastodonApplication = {
  name: string;
  website: string;
};

export type UserKeys = {
  publicKey: string;
  privateKey: string;
};

export type Note = {
  user: User;
  application?: MastodonApplication;
  content: string;
  language: string;
  visibility: "public" | "unlisted" | "private";
  sensitive: boolean;
  sensitiveSummary: string;
  pinned: boolean;
  counts: Record<"announcements" | "likes", number>;
  created: Date;
  updated: Date;
};

export type Pagination =
  | {
      page: number;
      pages: number;
    }
  | {
      offset: number;
      limit: number;
    }
  | {
      cursor: string;
    };

export type Collection<T> = {
  items: T[];
  totalItems: number;
};

export type MyPubDataModule = {
  getUser: (userId: string) => AsyncResult<User>;
  getUserByUrl: (url: string) => AsyncResult<User>;
  getUserByHandle: (accountHandle: string) => AsyncResult<User>;
  getUserFollowing: (
    userId: string,
    page: Pagination,
  ) => AsyncResult<Collection<User>>;
  getUserFollowers: (
    userId: string,
    page: Pagination,
  ) => AsyncResult<Collection<User>>;
  setUserFollowing: (
    userId: string,
    followingUserId: string,
    state: "following" | "pending" | "not-following",
  ) => AsyncResult<boolean>;
  upsertUserByUrl: (url: string, user: Partial<UserData>) => AsyncResult<User>;
};

export type FileData = {
  id: string;
  url: string;
  fileName: string;
  alt: string;
  focusPoint?: [number, number];
  contentType: string;
  width?: number;
  height?: number;
  length?: number;
  preview?: FileData;
};

export type MyPubStorageModule = {
  storeObject: (
    file: Omit<FileData, "id" | "url">,
    userId: string,
  ) => AsyncResult<FileData>;
  deleteObject: (objectId: string) => AsyncResult<void>;
};

export type MyPubUsersModule = {
  getUserKeys: (userId: string) => AsyncResult<UserKeys>;
  signRequest: (userId: string, request: Request) => AsyncResult<Request>;
};
