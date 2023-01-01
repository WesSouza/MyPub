export type ActivityPubPathSegment =
  | "activity"
  | "followers"
  | "following"
  | "inbox"
  | "liked"
  | "outbox"
  | "replies"
  | "sharedInbox"
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
  pathSegments: Record<ActivityPubPathSegment, string>;
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
    cover: string | undefined;
    profile: string | undefined;
  };
  followers: {
    items?: { user: User; state: "following" | "pending" }[];
    total: number;
  };
  following: {
    items?: User[];
    total: number;
  };
  content: {
    total: number;
  };
  publicKey: string;
  created: Date;
  updated: Date;
};

export type UserShallow = Omit<User, "followers" | "following"> & {
  followers: Pick<User["followers"], "total">;
  following: Pick<User["following"], "total">;
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
  announcements: {
    items?: UserShallow[];
    total: number;
  };
  likes: {
    items?: UserShallow[];
    total: number;
  };
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
  ) => AsyncResult<Collection<UserShallow>>;
  getUserFollowers: (
    userId: string,
    page: Pagination,
  ) => AsyncResult<Collection<UserShallow>>;
  setUserFollowing: (
    userId: string,
    followingUserId: string,
    state: "following" | "pending" | "not-following",
  ) => AsyncResult<boolean>;
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
